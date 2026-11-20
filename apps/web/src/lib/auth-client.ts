import { createAuthClient } from 'better-auth/react';
import {
  emailOTPClient,
  inferAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins';
import { dodopaymentsClient } from '@dodopayments/better-auth/client';
import type { Auth } from '@repo/auth';

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [
    inferAdditionalFields<Auth>(),
    emailOTPClient(),
    organizationClient(),
    dodopaymentsClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
} = authClient;
