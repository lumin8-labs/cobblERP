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
  PasswordInput,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TextInput,
} from '@carbon/react';
import { ArrowRight, Email, Renew } from '@carbon/icons-react';
import { AuthShell } from '@/components/AuthShell';
import { authClient, signIn } from '@/lib/auth-client';
import { validateEmail, validateOtp } from '@/lib/validation';

function sanitizeCallbackUrl(rawUrl: string | null): string {
  if (!rawUrl) return '/';
  if (rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
    return rawUrl;
  }
  return '/';
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get('callbackUrl'));

  const [selectedTab, setSelectedTab] = useState(0);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerInfo, setBannerInfo] = useState<string | null>(null);

  // Password sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Email OTP sign-in state
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpName, setOtpName] = useState('');
  const [otpEmailTouched, setOtpEmailTouched] = useState(false);
  const [otpCodeTouched, setOtpCodeTouched] = useState(false);
  const [otpSubmitted, setOtpSubmitted] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const emailError =
    emailTouched || passwordSubmitted ? validateEmail(email) : null;
  const passwordError =
    (passwordTouched || passwordSubmitted) && !password
      ? 'Enter your password.'
      : null;

  const otpEmailError =
    otpEmailTouched || otpSubmitted ? validateEmail(otpEmail) : null;
  const otpCodeError =
    otpCodeTouched || otpSubmitted ? validateOtp(otpCode) : null;

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSubmitted(true);
    setBannerError(null);
    setBannerInfo(null);

    const emailErr = validateEmail(email);
    if (emailErr || !password) {
      return;
    }

    setIsPasswordLoading(true);
    try {
      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setBannerError(result.error.message || 'Invalid email or password.');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Unable to sign in right now.'
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSubmitted(true);
    setBannerError(null);
    setBannerInfo(null);

    const err = validateEmail(otpEmail);
    if (err) {
      return;
    }

    setIsOtpLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: otpEmail.trim(),
        type: 'sign-in',
      });

      if (result.error) {
        setBannerError(
          result.error.message || 'Failed to send verification code.'
        );
        return;
      }

      setOtpStep('verify');
      setOtpSubmitted(false);
      setOtpCodeTouched(false);
      setResendCooldown(60);
      setBannerInfo(
        `A 6-digit sign-in code was sent to ${otpEmail.trim()}. It expires in 10 minutes.`
      );
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Failed to send verification code.'
      );
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtpSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSubmitted(true);
    setBannerError(null);

    const codeErr = validateOtp(otpCode);
    if (codeErr) {
      return;
    }

    setIsOtpLoading(true);
    try {
      const result = await signIn.emailOtp({
        email: otpEmail.trim(),
        otp: otpCode.trim(),
        ...(otpName.trim() ? { name: otpName.trim() } : {}),
      });

      if (result.error) {
        setBannerError(
          result.error.message || 'Invalid or expired verification code.'
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Unable to verify sign-in code.'
      );
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isOtpLoading) return;
    setBannerError(null);
    setIsOtpLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: otpEmail.trim(),
        type: 'sign-in',
      });
      if (result.error) {
        setBannerError(
          result.error.message || 'Failed to resend verification code.'
        );
        return;
      }
      setResendCooldown(60);
      setBannerInfo(`A new 6-digit code was sent to ${otpEmail.trim()}.`);
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Failed to resend code.'
      );
    } finally {
      setIsOtpLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Operator Access"
      title="Sign in to CobblERP"
      subtitle="Access your footwear manufacturing floor, inventory, and quality control workspace."
      footer={
        <>
          <span className="cobbl-body-muted">
            New to CobblERP?{' '}
            <CarbonLink as={Link} href="/sign-up">
              Create an account
            </CarbonLink>
          </span>
          <CarbonLink as={Link} href="/verify-email">
            Verify email with OTP
          </CarbonLink>
        </>
      }
    >
      {bannerError ? (
        <div className="cobbl-notification-wrap">
          <InlineNotification
            kind="error"
            role="alert"
            title="Authentication error"
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
            title="Check your email"
            subtitle={bannerInfo}
            onCloseButtonClick={() => setBannerInfo(null)}
          />
        </div>
      ) : null}

      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => {
          setSelectedTab(selectedIndex);
          setBannerError(null);
          setBannerInfo(null);
        }}
      >
        <TabList aria-label="Sign-in methods">
          <Tab>Password</Tab>
          <Tab>Email OTP</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="cobbl-settings-panel">
              <Form onSubmit={handlePasswordSignIn} noValidate>
                <Stack gap={6}>
                  <TextInput
                    id="signin-email"
                    name="email"
                    type="email"
                    labelText="Work email"
                    placeholder="operator@factory.com"
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
                    id="signin-password"
                    name="password"
                    labelText="Password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    enterKeyHint="done"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    invalid={Boolean(passwordError)}
                    invalidText={passwordError || undefined}
                  />

                  <div className="cobbl-inline-row">
                    <CarbonLink as={Link} href="/forgot-password">
                      Forgot password?
                    </CarbonLink>
                  </div>

                  <div className="cobbl-form-actions">
                    <Button
                      type="submit"
                      kind="primary"
                      renderIcon={isPasswordLoading ? undefined : ArrowRight}
                      disabled={isPasswordLoading}
                    >
                      {isPasswordLoading ? (
                        <InlineLoading description="Signing in..." />
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                  </div>
                </Stack>
              </Form>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="cobbl-settings-panel">
              {otpStep === 'request' ? (
                <Form onSubmit={handleSendOtp} noValidate>
                  <Stack gap={6}>
                    <TextInput
                      id="otp-signin-email"
                      name="email"
                      type="email"
                      labelText="Work email"
                      helperText="We will email you a one-time 6-digit code for passwordless sign-in."
                      placeholder="operator@factory.com"
                      autoComplete="username"
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="none"
                      enterKeyHint="done"
                      required
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      onBlur={() => setOtpEmailTouched(true)}
                      invalid={Boolean(otpEmailError)}
                      invalidText={otpEmailError || undefined}
                    />

                    <div className="cobbl-form-actions">
                      <Button
                        type="submit"
                        kind="primary"
                        renderIcon={isOtpLoading ? undefined : Email}
                        disabled={isOtpLoading}
                      >
                        {isOtpLoading ? (
                          <InlineLoading description="Sending code..." />
                        ) : (
                          'Send 6-digit code'
                        )}
                      </Button>
                    </div>
                  </Stack>
                </Form>
              ) : (
                <Form onSubmit={handleVerifyOtpSignIn} noValidate>
                  <Stack gap={6}>
                    <TextInput
                      id="otp-signin-code"
                      name="otp"
                      className="cobbl-otp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      enterKeyHint="done"
                      labelText="6-digit verification code"
                      helperText={`Code sent to ${otpEmail.trim()}.`}
                      placeholder="123456"
                      required
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      onBlur={() => setOtpCodeTouched(true)}
                      invalid={Boolean(otpCodeError)}
                      invalidText={otpCodeError || undefined}
                    />

                    <TextInput
                      id="otp-signin-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      labelText="Display name (optional)"
                      helperText="Only needed if this is your first time signing in."
                      placeholder="Amina Patel"
                      value={otpName}
                      onChange={(e) => setOtpName(e.target.value)}
                    />

                    <div className="cobbl-form-actions">
                      <Button
                        type="submit"
                        kind="primary"
                        renderIcon={isOtpLoading ? undefined : ArrowRight}
                        disabled={isOtpLoading}
                      >
                        {isOtpLoading ? (
                          <InlineLoading description="Verifying..." />
                        ) : (
                          'Verify and sign in'
                        )}
                      </Button>

                      <Button
                        type="button"
                        kind="secondary"
                        renderIcon={Renew}
                        disabled={resendCooldown > 0 || isOtpLoading}
                        onClick={handleResendOtp}
                      >
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : 'Resend code'}
                      </Button>

                      <Button
                        type="button"
                        kind="ghost"
                        disabled={isOtpLoading}
                        onClick={() => {
                          setOtpStep('request');
                          setOtpCode('');
                          setOtpSubmitted(false);
                          setBannerError(null);
                          setBannerInfo(null);
                        }}
                      >
                        Change email
                      </Button>
                    </div>
                  </Stack>
                </Form>
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          eyebrow="Operator Access"
          title="Sign in to CobblERP"
          subtitle="Loading authentication form..."
        >
          <InlineLoading description="Loading..." />
        </AuthShell>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

