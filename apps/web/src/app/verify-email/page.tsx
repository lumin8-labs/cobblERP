'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Form,
  InlineLoading,
  InlineNotification,
  Link as CarbonLink,
  Stack,
  TextInput,
} from '@carbon/react';
import { CheckmarkFilled, Email, Renew } from '@carbon/icons-react';
import { AuthShell } from '@/components/AuthShell';
import { authClient, useSession } from '@/lib/auth-client';
import { validateEmail, validateOtp } from '@/lib/validation';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!email && session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [email, session?.user?.email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const emailError = emailTouched || submitted ? validateEmail(email) : null;
  const otpError = otpTouched || submitted ? validateOtp(otp) : null;

  const handleSendCode = async () => {
    setEmailTouched(true);
    setBannerError(null);
    setBannerSuccess(null);

    if (validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: 'email-verification',
      });
      if (result.error) {
        setBannerError(
          result.error.message || 'Unable to send verification code.'
        );
        return;
      }
      setCodeSent(true);
      setCooldown(60);
      setBannerSuccess(`Verification code sent to ${email.trim()}.`);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Unable to send verification code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setBannerError(null);
    setBannerSuccess(null);

    if (validateEmail(email) || validateOtp(otp)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.verifyEmail({
        email: email.trim(),
        otp: otp.trim(),
      });
      if (result.error) {
        setBannerError(
          result.error.message || 'Invalid or expired verification code.'
        );
        return;
      }
      setBannerSuccess('Email verified successfully. Redirecting...');
      window.setTimeout(() => {
        router.push('/settings');
        router.refresh();
      }, 900);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Unable to verify email.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Email Verification"
      title="Verify your email address"
      subtitle="Request a 6-digit verification code and confirm ownership of your CobblERP email."
      footer={
        <>
          <CarbonLink as={Link} href="/sign-in">
            Back to sign in
          </CarbonLink>
          <CarbonLink as={Link} href="/settings">
            Profile &amp; Settings
          </CarbonLink>
        </>
      }
    >
      {bannerError ? (
        <div className="cobbl-notification-wrap">
          <InlineNotification
            kind="error"
            role="alert"
            title="Verification failed"
            subtitle={bannerError}
            onCloseButtonClick={() => setBannerError(null)}
          />
        </div>
      ) : null}

      {bannerSuccess ? (
        <div className="cobbl-notification-wrap">
          <InlineNotification
            kind="success"
            role="status"
            title="Success"
            subtitle={bannerSuccess}
            onCloseButtonClick={() => setBannerSuccess(null)}
          />
        </div>
      ) : null}

      <Form onSubmit={handleVerify} noValidate>
        <Stack gap={6}>
          <TextInput
            id="verify-email-address"
            name="email"
            type="email"
            labelText="Account email"
            placeholder="operator@factory.com"
            autoComplete="email"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="none"
            enterKeyHint="next"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            invalid={Boolean(emailError)}
            invalidText={emailError || undefined}
          />

          <TextInput
            id="verify-email-otp"
            name="otp"
            className="cobbl-otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            enterKeyHint="done"
            labelText="6-digit verification code"
            helperText="Check your inbox (or server console in local development)."
            placeholder="123456"
            required
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            onBlur={() => setOtpTouched(true)}
            invalid={Boolean(otpError)}
            invalidText={otpError || undefined}
          />

          <div className="cobbl-form-actions">
            <Button
              type="submit"
              kind="primary"
              renderIcon={isLoading ? undefined : CheckmarkFilled}
              disabled={isLoading}
            >
              {isLoading ? (
                <InlineLoading description="Verifying..." />
              ) : (
                'Verify email'
              )}
            </Button>

            <Button
              type="button"
              kind="secondary"
              renderIcon={codeSent ? Renew : Email}
              disabled={cooldown > 0 || isLoading}
              onClick={handleSendCode}
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : codeSent
                  ? 'Resend code'
                  : 'Send verification code'}
            </Button>
          </div>
        </Stack>
      </Form>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          eyebrow="Email Verification"
          title="Verify your email address"
          subtitle="Loading verification form..."
        >
          <InlineLoading description="Loading..." />
        </AuthShell>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

