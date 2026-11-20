'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { ArrowRight, CheckmarkFilled, Renew } from '@carbon/icons-react';
import { AuthShell } from '@/components/AuthShell';
import { authClient, organization, signUp } from '@/lib/auth-client';
import {
  toOrganizationSlug,
  validateEmail,
  validateFullName,
  validateOtp,
  validatePassword,
} from '@/lib/validation';

export default function SignUpPage() {
  const router = useRouter();

  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerInfo, setBannerInfo] = useState<string | null>(null);

  // Registration fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [factoryName, setFactoryName] = useState('');

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Verification OTP fields
  const [otp, setOtp] = useState('');
  const [otpTouched, setOtpTouched] = useState(false);
  const [otpSubmitted, setOtpSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const nameError =
    nameTouched || registerSubmitted ? validateFullName(name) : null;
  const emailError =
    emailTouched || registerSubmitted ? validateEmail(email) : null;
  const passwordError =
    passwordTouched || registerSubmitted ? validatePassword(password) : null;
  const otpError = otpTouched || otpSubmitted ? validateOtp(otp) : null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterSubmitted(true);
    setBannerError(null);
    setBannerInfo(null);

    if (
      validateFullName(name) ||
      validateEmail(email) ||
      validatePassword(password)
    ) {
      return;
    }

    setIsRegistering(true);
    try {
      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        setBannerError(
          result.error.message || 'Unable to create your account.'
        );
        return;
      }

      setStep('verify');
      setResendCooldown(60);
      setBannerInfo(
        `Account created. Enter the 6-digit verification code sent to ${email.trim()}.`
      );
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Unable to create your account.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSubmitted(true);
    setBannerError(null);

    if (validateOtp(otp)) {
      return;
    }

    setIsVerifying(true);
    try {
      const verifyResult = await authClient.emailOtp.verifyEmail({
        email: email.trim(),
        otp: otp.trim(),
      });

      if (verifyResult.error) {
        setBannerError(
          verifyResult.error.message || 'Invalid or expired verification code.'
        );
        return;
      }

      if (factoryName.trim()) {
        const orgResult = await organization.create({
          name: factoryName.trim(),
          slug: toOrganizationSlug(factoryName),
        });
        if (orgResult.data?.id) {
          await organization.setActive({ organizationId: orgResult.data.id });
        }
      }

      router.push('/settings');
      router.refresh();
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Failed to verify email address.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isVerifying) return;
    setBannerError(null);
    setIsVerifying(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: 'email-verification',
      });
      if (result.error) {
        setBannerError(
          result.error.message || 'Could not resend verification code.'
        );
        return;
      }
      setResendCooldown(60);
      setBannerInfo(`A new 6-digit verification code was sent to ${email.trim()}.`);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Could not resend verification code.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Factory Onboarding"
      title={
        step === 'register'
          ? 'Create your CobblERP account'
          : 'Verify your work email'
      }
      subtitle={
        step === 'register'
          ? 'Register an operator or factory supervisor account with email OTP verification.'
          : 'Confirm your email address using the 6-digit code sent to your inbox.'
      }
      footer={
        <>
          <span className="cobbl-body-muted">
            Already registered?{' '}
            <CarbonLink as={Link} href="/sign-in">
              Sign in
            </CarbonLink>
          </span>
          <CarbonLink as={Link} href="/forgot-password">
            Reset password
          </CarbonLink>
        </>
      }
    >
      {bannerError ? (
        <div className="cobbl-notification-wrap">
          <InlineNotification
            kind="error"
            role="alert"
            title="Registration error"
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
            title="Verification code sent"
            subtitle={bannerInfo}
            onCloseButtonClick={() => setBannerInfo(null)}
          />
        </div>
      ) : null}

      {step === 'register' ? (
        <Form onSubmit={handleRegister} noValidate>
          <Stack gap={6}>
            <TextInput
              id="signup-name"
              name="name"
              type="text"
              labelText="Full name"
              placeholder="Amina Patel"
              autoComplete="name"
              enterKeyHint="next"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              invalid={Boolean(nameError)}
              invalidText={nameError || undefined}
            />

            <TextInput
              id="signup-email"
              name="email"
              type="email"
              labelText="Work email"
              placeholder="amina@footwearco.com"
              autoComplete="username"
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

            <PasswordInput
              id="signup-password"
              name="password"
              labelText="Password"
              helperText="Use at least 8 characters including uppercase, lowercase, and a number."
              placeholder="Create a strong password"
              autoComplete="new-password"
              enterKeyHint="next"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              invalid={Boolean(passwordError)}
              invalidText={passwordError || undefined}
            />

            <TextInput
              id="signup-factory"
              name="organization"
              type="text"
              labelText="Factory or organization name (optional)"
              helperText="Provision a multi-tenant footwear plant workspace immediately upon email verification."
              placeholder="Northampton Goodyear Works"
              autoComplete="organization"
              enterKeyHint="done"
              value={factoryName}
              onChange={(e) => setFactoryName(e.target.value)}
            />

            <div className="cobbl-form-actions">
              <Button
                type="submit"
                kind="primary"
                renderIcon={isRegistering ? undefined : ArrowRight}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <InlineLoading description="Creating account..." />
                ) : (
                  'Create account'
                )}
              </Button>
            </div>
          </Stack>
        </Form>
      ) : (
        <Form onSubmit={handleVerifyEmail} noValidate>
          <Stack gap={6}>
            <TextInput
              id="signup-verify-otp"
              name="otp"
              className="cobbl-otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              enterKeyHint="done"
              labelText="6-digit verification code"
              helperText={`Sent to ${email.trim()}. Expires in 10 minutes.`}
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
                renderIcon={isVerifying ? undefined : CheckmarkFilled}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <InlineLoading description="Verifying..." />
                ) : (
                  'Verify email'
                )}
              </Button>

              <Button
                type="button"
                kind="secondary"
                renderIcon={Renew}
                disabled={resendCooldown > 0 || isVerifying}
                onClick={handleResendVerification}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend code'}
              </Button>

              <Button
                type="button"
                kind="ghost"
                disabled={isVerifying}
                onClick={() => router.push('/settings')}
              >
                Verify later in settings
              </Button>
            </div>
          </Stack>
        </Form>
      )}
    </AuthShell>
  );
}

