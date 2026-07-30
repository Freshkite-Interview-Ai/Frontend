import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { TESTS_FEATURE_ENABLED } from '@/lib/featureFlags';

const authRoutes = ['/login', '/signup'];

// Routes belonging to the (currently disabled) tests feature, and where to send
// visitors who reach them directly while it is off.
const testsRouteRedirects: Array<{ prefix: string; redirectTo: string }> = [
  { prefix: '/recruitment-tests', redirectTo: '/dashboard' },
  { prefix: '/company/tests', redirectTo: '/company/dashboard' },
];

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
  '/recruitment-tests',
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

  // Tests feature is disabled: keep its routes unreachable even via direct URL.
  if (!TESTS_FEATURE_ENABLED) {
    const disabledRoute = testsRouteRedirects.find(
      ({ prefix }) => pathname === prefix || pathname.startsWith(prefix + '/')
    );
    if (disabledRoute) {
      return NextResponse.redirect(new URL(disabledRoute.redirectTo, request.url));
    }
  }

  // NextAuth session (Google OAuth users)
  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Local-auth cookie (email/password users)
  const localAuthCookie = request.cookies.get('prephire_local_auth');
  // Company-auth cookie (company login users)
  const companyAuthCookie = request.cookies.get('prephire_company_auth');

  const isGoogleAuth = !!nextAuthToken;
  const isLocalAuth = !!localAuthCookie?.value;
  const isCompanyAuth = !!companyAuthCookie?.value;
  const isCandidateAuthenticated = isGoogleAuth || isLocalAuth;

  const isCandidateProtectedRoute = protectedRoutePrefixes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isCompanyRoute = pathname === '/company' || pathname.startsWith('/company/');

  // Company area requires company auth only.
  if (isCompanyRoute && !isCompanyAuth) {
    return NextResponse.redirect(new URL('/login?mode=company', request.url));
  }

  // /auth/callback only makes sense for Google OAuth users
  if (pathname === '/auth/callback') {
    if (!isGoogleAuth) {
      // Avoid callback loops for local users or stale local-auth cookies.
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect authenticated users away from login/signup
  // NOTE: We only auto-redirect Google-authenticated users here.
  // Local auth is client-side token based; a stale local-auth cookie can exist
  // briefly and cause redirect loops if we force /login -> /dashboard here.
  if (isCandidateAuthenticated && isAuthRoute) {
    if (isGoogleAuth) {
      // Google users go through /auth/callback for token exchange + onboarding check
      return NextResponse.redirect(new URL('/auth/callback', request.url));
    }
    // Local users stay on /login and client-side auth determines next route safely.
    return NextResponse.next();
  }

  // Company users on company login mode can be sent directly to dashboard.
  if (isCompanyAuth && pathname === '/login' && request.nextUrl.searchParams.get('mode') === 'company') {
    return NextResponse.redirect(new URL('/company/dashboard', request.url));
  }

  // Protect dashboard/app routes from unauthenticated access
  if (!isCandidateAuthenticated && isCandidateProtectedRoute) {
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
