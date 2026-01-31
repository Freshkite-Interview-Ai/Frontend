import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * NextAuth configuration for Google OAuth
 * Production-ready setup with proper token handling
 */
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in - persist tokens
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          expiresAt: account.expires_at,
          provider: account.provider,
        };
      }

      // Return token if not expired (with 5 min buffer)
      if (Date.now() < ((token.expiresAt as number) - 300) * 1000) {
        return token;
      }

      // Token expired, try to refresh
      return refreshGoogleToken(token);
    },

    async session({ session, token }) {
      // Pass tokens to the client session
      if (session.user) {
        session.user.id = token.sub || '';
        session.accessToken = token.accessToken as string;
        session.idToken = token.idToken as string;
      }

      // Handle token refresh errors
      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Refresh Google access token using refresh token
 */
async function refreshGoogleToken(token: any) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token ?? token.idToken,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      // Google doesn't return a new refresh token, keep the old one
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
