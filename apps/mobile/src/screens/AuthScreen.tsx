import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CarbonSpacing,
  CarbonTypography,
  type CarbonThemeColors,
  useCarbonTheme,
} from '../theme/carbon';
import { MobileAuthService } from '../services/auth';

type AuthMode = 'signin' | 'otp' | 'signup' | 'reset';

interface AuthScreenProps {
  onAuthenticated: () => Promise<void> | void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { colors } = useCarbonTheme();
  const styles = createStyles(colors);

  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Shared fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sub-steps
  const [otpSent, setOtpSent] = useState(false);
  const [signupVerifyStep, setSignupVerifyStep] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>('email');

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMsg(null);
    setInfoMsg(null);
    setOtp('');
    setOtpSent(false);
    setSignupVerifyStep(false);
    setResetStep('email');
  };

  const handlePasswordSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await MobileAuthService.signIn(email.trim(), password);
      await onAuthenticated();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSignInOtp = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setErrorMsg('Enter your work email address.');
      return;
    }
    setLoading(true);
    try {
      await MobileAuthService.sendVerificationOTP(email.trim(), 'sign-in');
      setOtpSent(true);
      setInfoMsg(`6-digit sign-in code sent to ${email.trim()}.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignInOtp = async () => {
    setErrorMsg(null);
    if (otp.trim().length !== 6) {
      setErrorMsg('Enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await MobileAuthService.signInWithEmailOTP(
        email.trim(),
        otp.trim(),
        name.trim() || undefined
      );
      await onAuthenticated();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!name.trim() || !email.trim() || password.length < 8) {
      setErrorMsg('Enter your full name, valid email, and an 8+ character password.');
      return;
    }
    setLoading(true);
    try {
      await MobileAuthService.signUp(name.trim(), email.trim(), password);
      setSignupVerifyStep(true);
      setInfoMsg(`Account created. Enter the 6-digit OTP sent to ${email.trim()}.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupEmail = async () => {
    setErrorMsg(null);
    if (otp.trim().length !== 6) {
      setErrorMsg('Enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await MobileAuthService.verifyEmailOTP(email.trim(), otp.trim());
      await onAuthenticated();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Email verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setErrorMsg('Enter your account email.');
      return;
    }
    setLoading(true);
    try {
      await MobileAuthService.sendVerificationOTP(email.trim(), 'forget-password');
      setResetStep('otp');
      setInfoMsg(`Reset code sent to ${email.trim()}.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckResetOtp = async () => {
    setErrorMsg(null);
    if (otp.trim().length !== 6) {
      setErrorMsg('Enter the 6-digit reset code.');
      return;
    }
    setLoading(true);
    try {
      await MobileAuthService.checkPasswordResetOTP(email.trim(), otp.trim());
      setResetStep('password');
      setInfoMsg(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    if (password.length < 8) {
      setErrorMsg('New password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await MobileAuthService.resetPasswordWithOTP(email.trim(), otp.trim(), password);
      switchMode('signin');
      setInfoMsg('Password reset complete. Sign in with your new password.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>OPERATOR ACCESS</Text>
      <Text style={styles.title}>CobblERP Shop-Floor Auth</Text>
      <Text style={styles.subtitle}>
        Sign in with password or Email OTP, register new operators, or reset credentials.
      </Text>

      {/* Carbon-styled tab chips */}
      <View style={styles.tabRow}>
        {(
          [
            ['signin', 'Sign In'],
            ['otp', 'Email OTP'],
            ['signup', 'Sign Up'],
            ['reset', 'Reset'],
          ] as [AuthMode, string][]
        ).map(([key, label]) => {
          const active = mode === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.tabChip,
                {
                  backgroundColor: active ? colors.interactive01 : colors.layer02,
                  borderColor: active ? colors.interactive01 : colors.borderSubtle,
                },
              ]}
              onPress={() => switchMode(key)}
            >
              <Text
                style={[
                  styles.tabChipText,
                  { color: active ? colors.textOnColor : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {errorMsg ? (
        <View style={[styles.notice, { backgroundColor: colors.supportErrorBg, borderLeftColor: colors.supportError }]}>
          <Text style={[styles.noticeText, { color: colors.supportError }]}>{errorMsg}</Text>
        </View>
      ) : null}

      {infoMsg ? (
        <View style={[styles.notice, { backgroundColor: colors.supportInfoBg, borderLeftColor: colors.supportInfo }]}>
          <Text style={[styles.noticeText, { color: colors.supportInfo }]}>{infoMsg}</Text>
        </View>
      ) : null}

      {mode === 'signin' ? (
        <View style={styles.formStack}>
          <Text style={styles.label}>Work Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="operator@factory.com"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Text style={styles.linkText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.textPlaceholder}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePasswordSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnColor} />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {mode === 'otp' ? (
        <View style={styles.formStack}>
          <Text style={styles.label}>Work Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="operator@factory.com"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!otpSent}
          />

          {otpSent ? (
            <>
              <Text style={styles.label}>6-Digit Email Code</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="number-pad"
                maxLength={6}
              />

              <Text style={styles.label}>Display Name (first-time operators)</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Amina Patel"
                placeholderTextColor={colors.textPlaceholder}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleVerifySignInOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnColor} />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify & Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleSendSignInOtp}
                disabled={loading}
              >
                <Text style={styles.secondaryBtnText}>Resend Code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSendSignInOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textOnColor} />
              ) : (
                <Text style={styles.primaryBtnText}>Send 6-Digit Code</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {mode === 'signup' ? (
        <View style={styles.formStack}>
          {!signupVerifyStep ? (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Amina Patel"
                placeholderTextColor={colors.textPlaceholder}
              />

              <Text style={styles.label}>Work Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="amina@footwearco.com"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.labelRow}>
                <Text style={styles.label}>Password (min 8 chars)</Text>
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                  <Text style={styles.linkText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create strong password"
                placeholderTextColor={colors.textPlaceholder}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnColor} />
                ) : (
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>6-Digit Email Verification Code</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleVerifySignupEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnColor} />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify Email</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : null}

      {mode === 'reset' ? (
        <View style={styles.formStack}>
          {resetStep === 'email' ? (
            <>
              <Text style={styles.label}>Account Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="operator@factory.com"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleRequestPasswordReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnColor} />
                ) : (
                  <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}

          {resetStep === 'otp' ? (
            <>
              <Text style={styles.label}>6-Digit Reset Code</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleCheckResetOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnColor} />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify Reset Code</Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}

          {resetStep === 'password' ? (
            <>
              <View style={styles.labelRow}>
                <Text style={styles.label}>New Password (min 8 chars)</Text>
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                  <Text style={styles.linkText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.textPlaceholder}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnColor} />
                ) : (
                  <Text style={styles.primaryBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: CarbonThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.layer01,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: CarbonSpacing.lg,
      gap: CarbonSpacing.md,
    },
    eyebrow: {
      fontSize: CarbonTypography.caption.fontSize,
      color: colors.textPlaceholder,
      letterSpacing: 1,
      fontWeight: '600',
    },
    title: {
      fontSize: CarbonTypography.heading02.fontSize,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: CarbonTypography.body01.fontSize,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    tabRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: CarbonSpacing.sm,
    },
    tabChip: {
      borderWidth: 1,
      paddingVertical: 6,
      paddingHorizontal: CarbonSpacing.md,
    },
    tabChipText: {
      fontSize: CarbonTypography.caption.fontSize,
      fontWeight: '600',
    },
    notice: {
      borderLeftWidth: 3,
      padding: CarbonSpacing.sm,
    },
    noticeText: {
      fontSize: CarbonTypography.caption.fontSize,
      fontWeight: '500',
    },
    formStack: {
      gap: CarbonSpacing.sm,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: CarbonTypography.caption.fontSize,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: CarbonSpacing.xs,
    },
    linkText: {
      fontSize: CarbonTypography.caption.fontSize,
      color: colors.interactive01,
      fontWeight: '600',
    },
    input: {
      backgroundColor: colors.layer02,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderStrong,
      color: colors.textPrimary,
      paddingHorizontal: CarbonSpacing.md,
      paddingVertical: CarbonSpacing.md,
      fontSize: CarbonTypography.body01.fontSize,
    },
    otpInput: {
      fontFamily: 'Courier',
      letterSpacing: 6,
      fontSize: CarbonTypography.heading01.fontSize,
    },
    primaryBtn: {
      backgroundColor: colors.interactive01,
      paddingVertical: CarbonSpacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: CarbonSpacing.sm,
    },
    primaryBtnText: {
      color: colors.textOnColor,
      fontSize: CarbonTypography.body01.fontSize,
      fontWeight: '600',
    },
    secondaryBtn: {
      backgroundColor: colors.layer02,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      paddingVertical: CarbonSpacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnText: {
      color: colors.textPrimary,
      fontSize: CarbonTypography.body01.fontSize,
      fontWeight: '600',
    },
  });
}

