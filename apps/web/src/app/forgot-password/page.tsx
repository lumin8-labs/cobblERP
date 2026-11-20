'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Form,
  InlineLoading,
  InlineNotification,
  Link as CarbonLink,
  PasswordInput,
  Stack,
  TextInput,
} from '@carbon/react';
import { ArrowLeft, ArrowRight, CheckmarkFilled, Email, Renew } from '@carbon/icons-react';
import { AuthShell } from '@/components/AuthShell';
import { authClient } from '@/lib/auth-client';
import { validateEmail, validateOtp, validatePassword } from '@/lib/validation';

type ResetStep = 'email' | 'otp' | 'password' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [emailTouched, setEmailTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerInfo, setBannerInfo] = useState<string | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const emailError = emailTouched || submitted ? validateEmail(email) : null;
  const otpError = otpTouched || submitted ? validateOtp(otp) : null;
  const passwordError =
    passwordTouched || submitted ? validatePassword(newPassword) : null;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setBannerError(null);
    setBannerInfo(null);

    if (validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.requestPasswordReset({
        email: email.trim(),
      });

      if (result.error) {
        setBannerError(
          result.error.message || 'Unable to send password reset code.'
        );
        return;
      }

      setStep('otp');
      setSubmitted(false);
      setOtpTouched(false);
      setResendCooldown(60);
      setBannerInfo(
        `If an account matches ${email.trim()}, a 6-digit reset code has been sent.`
      );
    } catch (err) {
      setBannerError(
        err instanceof Error
          ? err.message
          : 'Unable to send password reset code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setBannerError(null);

    if (validateOtp(otp)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.checkVerificationOtp({
        email: email.trim(),
        type: 'forget-password',
        otp: otp.trim(),
      });

      if (result.error) {
        setBannerError(
          result.error.message || 'Invalid or expired reset code.'
        );
        return;
      }

      setStep('password');
      setSubmitted(false);
      setPasswordTouched(false);
      setBannerInfo(null);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Unable to verify reset code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setBannerError(null);

    if (validatePassword(newPassword)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        password: newPassword,
      });

      if (result.error) {
        setBannerError(
          result.error.message || 'Unable to reset password. Try requesting a new code.'
        );
        return;
      }

      setStep('done');
      setBannerInfo(null);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Unable to reset password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setBannerError(null);
    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.requestPasswordReset({
        email: email.trim(),
      });
      if (result.error) {
        setBannerError(
          result.error.message || 'Failed to resend reset code.'
        );
        return;
      }
      setResendCooldown(60);
      setBannerInfo(`A new 6-digit reset code was sent to ${email.trim()}.`);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Failed to resend reset code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Reset your password"
      subtitle="Verify your identity with a 6-digit email OTP, then choose a new password."
      footer={
        <>
          <CarbonLink as={Link} href="/sign-in">
            Back to sign in
          </CarbonLink>
          <CarbonLink as={Link} href="/sign-up">
            Create an account
          </CarbonLink>
        </>
      }
    >
      {bannerError ? (
        <div className="cobbl-notification-wrap">
          <InlineNotification
            kind="error"
            role="alert"
            title="Reset error"
            subtitle={bannerError}
            onCloseButtonClick={() => setBannerError(null)}
          />
        </div>
      ) : null}

      {bannerInfo ? (
        <div className="cobbl-notification-wrap">
          <InlineNotification
            kind="info"
            role="status"
            title="Verification code"
            subtitle={bannerInfo}
            onCloseButtonClick={() => setBannerInfo(null)}
          />
        </div>
      ) : null}

      {step === 'email' ? (
        <Form onSubmit={handleRequestReset} noValidate>
          <Stack gap={6}>
            <TextInput
              id="reset-email"
              name="email"
              type="email"
              labelText="Account email"
              helperText="Step 1 of 3 — Enter the email associated with your CobblERP account."
              placeholder="operator@factory.com"
              autoComplete="username"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              enterKeyHint="done"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              invalid={Boolean(emailError)}
              invalidText={emailError || undefined}
            />

            <div className="cobbl-form-actions">
              <Button
                type="submit"
                kind="primary"
                renderIcon={isLoading ? undefined : Email}
                disabled={isLoading}
              >
                {isLoading ? (
                  <InlineLoading description="Sending code..." />
                ) : (
                  'Send reset code'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      ) : null}

      {step === 'otp' ? (
        <Form onSubmit={handleVerifyResetOtp} noValidate>
          <Stack gap={6}>
            <TextInput
              id="reset-otp"
              name="otp"
              className="cobbl-otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              enterKeyHint="done"
              labelText="6-digit reset code"
              helperText={`Step 2 of 3 — Enter the code sent to ${email.trim()}.`}
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
                renderIcon={isLoading ? undefined : ArrowRight}
                disabled={isLoading}
              >
                {isLoading ? (
                  <InlineLoading description="Checking code..." />
                ) : (
                  'Verify code'
                )}
              </Button>

              <Button
                type="button"
                kind="secondary"
                renderIcon={Renew}
                disabled={resendCooldown > 0 || isLoading}
                onClick={handleResendCode}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend code'}
              </Button>

              <Button
                type="button"
                kind="ghost"
                renderIcon={ArrowLeft}
                disabled={isLoading}
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setSubmitted(false);
                  setBannerError(null);
                  setBannerInfo(null);
                }}
              >
                Change email
              </Button>
            </div>
          </Stack>
        </Form>
      ) : null}

      {step === 'password' ? (
        <Form onSubmit={handleResetPassword} noValidate>
          <Stack gap={6}>
            <PasswordInput
              id="reset-new-password"
              name="new-password"
              labelText="New password"
              helperText="Step 3 of 3 — At least 8 characters with uppercase, lowercase, and a number."
              placeholder="Enter new password"
              autoComplete="new-password"
              enterKeyHint="done"
              minLength={8}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              invalid={Boolean(passwordError)}
              invalidText={passwordError || undefined}
            />

            <div className="cobbl-form-actions">
              <Button
                type="submit"
                kind="primary"
                renderIcon={isLoading ? undefined : CheckmarkFilled}
                disabled={isLoading}
              >
                {isLoading ? (
                  <InlineLoading description="Updating password..." />
                ) : (
                  'Update password'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      ) : null}

      {step === 'done' ? (
        <Stack gap={6}>
          <InlineNotification
            kind="success"
            role="status"
            title="Password updated"
            subtitle="Your CobblERP password has been reset. You can now sign in with your new credentials."
            hideCloseButton
          />
          <div className="cobbl-form-actions">
            <Button as={Link} href="/sign-in" kind="primary" renderIcon={ArrowRight}>
              Continue to sign in
            </Button>
          </div>
        </Stack>
      ) : null}
    </AuthShell>
  );
}

