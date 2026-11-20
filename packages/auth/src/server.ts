import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { organization, bearer, emailOTP } from 'better-auth/plugins';
import { dodopayments, checkout, portal, webhooks } from '@dodopayments/better-auth';
import DodoPayments from 'dodopayments';
import { db, schema } from '@repo/db';
import { sendAuthOtpEmail } from './email';

const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY || 'dodo_dummy_key_dev';
const isProd = process.env.NODE_ENV === 'production';
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const hasLiveDodoKey = Boolean(
  dodoApiKey &&
  !dodoApiKey.startsWith('dodo_dummy') &&
  !dodoApiKey.includes('xxxxx')
);

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
if (!betterAuthSecret && isProd && !isBuildPhase) {
  throw new Error('BETTER_AUTH_SECRET environment variable must be defined in production.');
}

export const dodoClient = new DodoPayments({
  bearerToken: dodoApiKey,
  environment: isProd ? 'live_mode' : 'test_mode',
});

const trustedOrigins = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.BETTER_AUTH_URL,
      'http://localhost:3000',
      'http://localhost:4000',
    ].filter((origin): origin is string => Boolean(origin))
  )
);

export const auth = betterAuth({
  appName: 'CobblERP',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret:
    betterAuthSecret ||
    'cobblerp-insecure-dev-secret-key-change-in-prod-min-32-chars',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
    },
  }),
  user: {
    additionalFields: {
      jobTitle: {
        type: 'string',
        required: false,
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
      defaultDepartment: {
        type: 'string',
        required: false,
        defaultValue: 'Production Floor',
        input: true,
      },
      preferredTheme: {
        type: 'string',
        required: false,
        defaultValue: 'g100',
        input: true,
      },
      emailNotifications: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
    bearer(),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      changeEmail: {
        enabled: true,
      },
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendAuthOtpEmail({ email, otp, type });
      },
    }) as unknown as BetterAuthPlugin,
    dodopayments({
      client: dodoClient,
      createCustomerOnSignUp: hasLiveDodoKey,
      use: [
        checkout({
          products: [
            {
              productId: process.env.DODO_PRODUCT_STARTER_ID || 'pdt_starter_plan',
              slug: 'starter',
            },
            {
              productId: process.env.DODO_PRODUCT_PRO_ID || 'pdt_pro_plan',
              slug: 'pro',
            },
            {
              productId: process.env.DODO_PRODUCT_ENTERPRISE_ID || 'pdt_enterprise_plan',
              slug: 'enterprise',
            },
          ],
          successUrl: '/settings?billing=success',
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || 'dodo_webhook_secret_dev',
          onPayload: async (payload: any) => {
            console.log('[Dodo Payments Webhook Received]', payload?.type || 'unknown');
          },
        }),
      ],
    }),
  ],
  trustedOrigins,
});

export type Auth = typeof auth;
