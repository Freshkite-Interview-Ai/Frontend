import { signIn, signOut, getSession } from 'next-auth/react';

export const authService = {
  // Sign in with Keycloak
  signIn: async () => {
    return signIn('keycloak', { callbackUrl: '/dashboard' });
  },

  // Sign out from NextAuth and Keycloak
  signOut: async () => {
    return signOut({ callbackUrl: '/' });
  },

  // Get current session
  getSession: async () => {
    return getSession();
  },

  // Get access token from session
  getAccessToken: async () => {
    const session = await getSession();
    return session?.accessToken || null;
  },
};

export default authService;
