import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const authRoutes = ['/login', '/signup'];

const protectedRoutePrefixes = [
  '/dashboard',
  '/concepts',
  '/record',
  '/resume',
  '/interview',
  '/tokens',
  '/profile',
  '/settings',
  '/problems',
  '/company',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // NextAuth session (Google OAuth users)
  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Local-auth cookie (email/password users)
  const localAuthCookie = request.cookies.get('prephire_local_auth');

  const isGoogleAuth = !!nextAuthToken;
  const isLocalAuth = !!localAuthCookie?.value;
  const isAuthenticated = isGoogleAuth || isLocalAuth;

  const isProtectedRoute = protectedRoutePrefixes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // /auth/callback only makes sense for Google OAuth users
  if (pathname === '/auth/callback') {
    if (isLocalAuth && !isGoogleAuth) {
      // Local users have nothing to do in the callback — send to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect authenticated users away from login/signup
  if (isAuthenticated && isAuthRoute) {
    if (isGoogleAuth) {
      // Google users go through /auth/callback for token exchange + onboarding check
      return NextResponse.redirect(new URL('/auth/callback', request.url));
    }
    // Local users are already fully set up — go straight to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard/app routes from unauthenticated access
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
