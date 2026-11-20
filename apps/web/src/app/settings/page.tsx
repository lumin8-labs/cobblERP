'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Checkbox,
  Column,
  Form,
  Grid,
  InlineLoading,
  InlineNotification,
  PasswordInput,
  Select,
  SelectItem,
  Stack,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TextInput,
  Tile,
  Toggle,
  preview__IconIndicator as IconIndicator,
} from '@carbon/react';
import {
  Add,
  CheckmarkFilled,
  Email,
  Renew,
  Security,
  TrashCan,
} from '@carbon/icons-react';
import { AppShell } from '@/components/AppShell';
import { useAppTheme, type CarbonThemeMode } from '@/components/ThemeProvider';
import { authClient, organization, useSession } from '@/lib/auth-client';
import {
  toOrganizationSlug,
  validateEmail,
  validateFullName,
  validateOptionalUrl,
  validateOtp,
  validatePassword,
} from '@/lib/validation';

interface SessionItem {
  id: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: string | Date;
  createdAt: string | Date;
}

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

const DEPARTMENTS = [
  'Production Floor',
  'Clicking & Cutting',
  'Closing & Stitching',
  'Lasting & Bottoming',
  'Assembly & Soling',
  'Finishing & QC',
  'Management',
];

const TAB_MAP: Record<string, number> = {
  profile: 0,
  email: 1,
  security: 2,
  organizations: 3,
};

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTheme } = useAppTheme();
  const { data: session, isPending, refetch } = useSession();

  const initialTab = useMemo(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && tabParam in TAB_MAP ? TAB_MAP[tabParam] : 0;
  }, [searchParams]);

  const [selectedTab, setSelectedTab] = useState(initialTab);

  useEffect(() => {
    setSelectedTab(initialTab);
  }, [initialTab]);

  // Global feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile & preferences state
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultDepartment, setDefaultDepartment] = useState('Production Floor');
  const [preferredTheme, setPreferredTheme] = useState<CarbonThemeMode>('g100');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileTouched, setProfileTouched] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email verification & email change state
  const [verifyOtp, setVerifyOtp] = useState('');
  const [verifyOtpSent, setVerifyOtpSent] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newEmailOtp, setNewEmailOtp] = useState('');
  const [emailChangeStep, setEmailChangeStep] = useState<'request' | 'confirm'>('request');
  const [newEmailTouched, setNewEmailTouched] = useState(false);
  const [newEmailOtpTouched, setNewEmailOtpTouched] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Password & sessions state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [revokeOthersOnPwChange, setRevokeOthersOnPwChange] = useState(true);
  const [pwSubmitted, setPwSubmitted] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Organization state
  const [orgs, setOrgs] = useState<OrganizationItem[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);

  // Hydrate profile form when session loads
  useEffect(() => {
    if (!session?.user) return;
    setName(session.user.name || '');
    setImage(session.user.image || '');
    setJobTitle(session.user.jobTitle || '');
    setPhone(session.user.phone || '');
    setDefaultDepartment(session.user.defaultDepartment || 'Production Floor');
    setPreferredTheme(
      session.user.preferredTheme === 'white' ? 'white' : 'g100'
    );
    setEmailNotifications(session.user.emailNotifications ?? true);
  }, [session?.user]);

  useEffect(() => {
    if (searchParams.get('billing') === 'success') {
      setSuccessMsg('Billing checkout completed successfully.');
    }
  }, [searchParams]);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await authClient.listSessions();
      if (res.data) {
        setSessions(res.data as SessionItem[]);
      }
    } catch {
      // Handled silently if session expired
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const loadOrganizations = useCallback(async () => {
    setLoadingOrgs(true);
    try {
      const res = await organization.list();
      if (res.data) {
        setOrgs(res.data as OrganizationItem[]);
      }
    } catch {
      // Ignore transient load error
    } finally {
      setLoadingOrgs(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    void loadSessions();
    void loadOrganizations();
  }, [session?.user, loadSessions, loadOrganizations]);

  if (isPending) {
    return (
      <AppShell>
        <Grid className="cobbl-grid-group">
          <Column sm={4} md={8} lg={16}>
            <Tile className="cobbl-auth-tile">
              <InlineLoading description="Loading your operator settings..." />
            </Tile>
          </Column>
        </Grid>
      </AppShell>
    );
  }

  if (!session?.user) {
    return (
      <AppShell>
        <Grid className="cobbl-grid-group">
          <Column sm={4} md={{ span: 6, offset: 1 }} lg={{ span: 8, offset: 4 }}>
            <Tile className="cobbl-auth-tile">
              <Stack gap={5}>
                <h1 className="cobbl-auth-title">Sign in required</h1>
                <p className="cobbl-auth-subtitle">
                  Sign in to update your profile, manage email verification, reset
                  your password, or switch factory workspaces.
                </p>
                <div className="cobbl-form-actions">
                  <Button
                    as={Link}
                    href="/sign-in?callbackUrl=/settings"
                    kind="primary"
                  >
                    Sign in
                  </Button>
                  <Button as={Link} href="/sign-up" kind="secondary">
                    Create account
                  </Button>
                </div>
              </Stack>
            </Tile>
          </Column>
        </Grid>
      </AppShell>
    );
  }

  const nameError = profileTouched ? validateFullName(name) : null;
  const imageError = profileTouched ? validateOptionalUrl(image) : null;
  const newEmailError = newEmailTouched ? validateEmail(newEmail) : null;
  const newEmailOtpError = newEmailOtpTouched
    ? validateOtp(newEmailOtp)
    : null;
  const currentPwError =
    pwSubmitted && !currentPassword ? 'Enter your current password.' : null;
  const newPwError =
    pwTouched || pwSubmitted ? validatePassword(newPassword) : null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileTouched(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (validateFullName(name) || validateOptionalUrl(image)) {
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() ? image.trim() : undefined,
        jobTitle: jobTitle.trim() || undefined,
        phone: phone.trim() || undefined,
        defaultDepartment,
        preferredTheme,
        emailNotifications,
      });

      if (result.error) {
        setErrorMsg(result.error.message || 'Unable to update profile settings.');
        return;
      }

      setTheme(preferredTheme);
      await refetch();
      setSuccessMsg('Profile and workspace preferences saved.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to save profile settings.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendVerifyOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsVerifyingEmail(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: session.user.email,
        type: 'email-verification',
      });
      if (result.error) {
        setErrorMsg(
          result.error.message || 'Failed to send verification code.'
        );
        return;
      }
      setVerifyOtpSent(true);
      setSuccessMsg(`Verification code sent to ${session.user.email}.`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to send verification code.'
      );
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleConfirmCurrentEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const err = validateOtp(verifyOtp);
    if (err) {
      setErrorMsg(err);
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const result = await authClient.emailOtp.verifyEmail({
        email: session.user.email,
        otp: verifyOtp.trim(),
      });
      if (result.error) {
        setErrorMsg(result.error.message || 'Invalid verification code.');
        return;
      }
      setVerifyOtp('');
      setVerifyOtpSent(false);
      await refetch();
      setSuccessMsg('Email address verified.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to verify email.'
      );
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewEmailTouched(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (validateEmail(newEmail)) {
      return;
    }

    setIsChangingEmail(true);
    try {
      const result = await authClient.emailOtp.requestEmailChange({
        newEmail: newEmail.trim(),
      });
      if (result.error) {
        setErrorMsg(
          result.error.message || 'Unable to send email change verification code.'
        );
        return;
      }
      setEmailChangeStep('confirm');
      setNewEmailOtpTouched(false);
      setSuccessMsg(
        `A 6-digit confirmation code was sent to ${newEmail.trim()}.`
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to request email change.'
      );
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewEmailOtpTouched(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (validateOtp(newEmailOtp)) {
      return;
    }

    setIsChangingEmail(true);
    try {
      const result = await authClient.emailOtp.changeEmail({
        newEmail: newEmail.trim(),
        otp: newEmailOtp.trim(),
      });
      if (result.error) {
        setErrorMsg(
          result.error.message || 'Invalid or expired confirmation code.'
        );
        return;
      }
      setEmailChangeStep('request');
      setNewEmail('');
      setNewEmailOtp('');
      setNewEmailTouched(false);
      setNewEmailOtpTouched(false);
      await refetch();
      setSuccessMsg('Primary email address updated and verified.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to change email address.'
      );
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSubmitted(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword || validatePassword(newPassword)) {
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOthersOnPwChange,
      });

      if (result.error) {
        setErrorMsg(
          result.error.message || 'Unable to change password. Check your current password.'
        );
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setPwSubmitted(false);
      setPwTouched(false);
      await refetch();
      await loadSessions();
      setSuccessMsg('Password updated successfully.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to update password.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionToken: string, sessionId: string) => {
    setRevokingId(sessionId);
    setErrorMsg(null);
    try {
      const result = await authClient.revokeSession({ token: sessionToken });
      if (result.error) {
        setErrorMsg(result.error.message || 'Unable to revoke session.');
        return;
      }
      await loadSessions();
      setSuccessMsg('Session revoked.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to revoke session.'
      );
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOtherSessions = async () => {
    setErrorMsg(null);
    setLoadingSessions(true);
    try {
      const result = await authClient.revokeOtherSessions();
      if (result.error) {
        setErrorMsg(
          result.error.message || 'Unable to revoke other sessions.'
        );
        return;
      }
      await loadSessions();
      setSuccessMsg('All other active sessions were signed out.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to revoke sessions.'
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSwitchOrg = async (orgId: string) => {
    setIsUpdatingOrg(true);
    setErrorMsg(null);
    try {
      const result = await organization.setActive({ organizationId: orgId });
      if (result.error) {
        setErrorMsg(
          result.error.message || 'Unable to switch active factory workspace.'
        );
        return;
      }
      await refetch();
      router.refresh();
      setSuccessMsg('Active factory organization updated.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to switch organization.'
      );
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setIsUpdatingOrg(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const created = await organization.create({
        name: newOrgName.trim(),
        slug: toOrganizationSlug(newOrgName),
      });
      if (created.error) {
        setErrorMsg(
          created.error.message || 'Unable to create factory workspace.'
        );
        return;
      }
      if (created.data?.id) {
        await organization.setActive({ organizationId: created.data.id });
      }
      setNewOrgName('');
      await loadOrganizations();
      await refetch();
      setSuccessMsg('Factory workspace created and activated.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to create workspace.'
      );
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  const activeOrgId = session.session.activeOrganizationId;
  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  return (
    <AppShell>
      <Grid className="cobbl-grid-group">
        <Column sm={4} md={8} lg={16}>
          <Tile className="cobbl-hero-tile">
            <div className="cobbl-inline-row">
              <div>
                <div className="cobbl-auth-eyebrow">Account &amp; Workspace Settings</div>
                <h1 className="cobbl-hero-title">
                  {session.user.name || session.user.email}
                </h1>
                <div className="cobbl-hero-meta">
                  <span className="cobbl-body-muted">{session.user.email}</span>
                  <IconIndicator
                    kind={session.user.emailVerified ? 'succeeded' : 'caution-minor'}
                    label={
                      session.user.emailVerified
                        ? 'Email verified'
                        : 'Email verification required'
                    }
                  />
                  {activeOrg ? (
                    <Tag type="outline">Factory: {activeOrg.name}</Tag>
                  ) : (
                    <Tag type="cool-gray">No active factory selected</Tag>
                  )}
                </div>
              </div>
              <Button as={Link} href="/" kind="tertiary" size="md">
                Back to Production Floor
              </Button>
            </div>
          </Tile>
        </Column>
      </Grid>

      {errorMsg || successMsg ? (
        <Grid className="cobbl-grid-group">
          <Column sm={4} md={8} lg={16}>
            {errorMsg ? (
              <InlineNotification
                kind="error"
                role="alert"
                title="Action failed"
                subtitle={errorMsg}
                onCloseButtonClick={() => setErrorMsg(null)}
              />
            ) : null}
            {successMsg ? (
              <InlineNotification
                kind="success"
                role="status"
                title="Updated"
                subtitle={successMsg}
                onCloseButtonClick={() => setSuccessMsg(null)}
              />
            ) : null}
          </Column>
        </Grid>
      ) : null}

      <Grid className="cobbl-grid-group">
        <Column sm={4} md={8} lg={16}>
          <Tabs
            selectedIndex={selectedTab}
            onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
          >
            <TabList aria-label="Account settings sections">
              <Tab>Profile &amp; Preferences</Tab>
              <Tab>Email &amp; OTP Verification</Tab>
              <Tab>Security &amp; Sessions</Tab>
              <Tab>Factory Workspaces</Tab>
            </TabList>

            <TabPanels>
              {/* Tab 0: Profile & Preferences */}
              <TabPanel>
                <div className="cobbl-settings-panel">
                  <Tile className="cobbl-settings-card">
                    <h2 className="cobbl-section-heading">
                      Operator Profile &amp; Display Settings
                    </h2>
                    <Form onSubmit={handleSaveProfile} noValidate>
                      <Stack gap={6}>
                        <TextInput
                          id="profile-name"
                          name="name"
                          type="text"
                          labelText="Full name"
                          autoComplete="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => setProfileTouched(true)}
                          invalid={Boolean(nameError)}
                          invalidText={nameError || undefined}
                        />

                        <TextInput
                          id="profile-job-title"
                          name="jobTitle"
                          type="text"
                          labelText="Job title / shop-floor role"
                          placeholder="e.g. Master Lasting Supervisor"
                          autoComplete="organization-title"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />

                        <TextInput
                          id="profile-phone"
                          name="phone"
                          type="tel"
                          labelText="Phone number"
                          placeholder="+1 555 014 8890"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />

                        <Select
                          id="profile-department"
                          name="defaultDepartment"
                          labelText="Primary footwear department"
                          value={defaultDepartment}
                          onChange={(e) => setDefaultDepartment(e.target.value)}
                        >
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept} text={dept} />
                          ))}
                        </Select>

                        <TextInput
                          id="profile-image"
                          name="image"
                          type="url"
                          labelText="Profile avatar URL (optional)"
                          placeholder="https://example.com/avatar.png"
                          autoComplete="photo"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          onBlur={() => setProfileTouched(true)}
                          invalid={Boolean(imageError)}
                          invalidText={imageError || undefined}
                        />

                        <Select
                          id="profile-theme"
                          name="preferredTheme"
                          labelText="Carbon interface theme"
                          helperText="Applied immediately across your web session."
                          value={preferredTheme}
                          onChange={(e) => {
                            const next =
                              e.target.value === 'white' ? 'white' : 'g100';
                            setPreferredTheme(next);
                            setTheme(next);
                          }}
                        >
                          <SelectItem
                            value="g100"
                            text="Gray 100 (Dark — Shop Floor)"
                          />
                          <SelectItem
                            value="white"
                            text="White (Light — Corporate)"
                          />
                        </Select>

                        <Toggle
                          id="profile-email-notifications"
                          labelText="Production & QC email notifications"
                          labelA="Off"
                          labelB="On"
                          toggled={emailNotifications}
                          onToggle={(checked) => setEmailNotifications(checked)}
                        />

                        <div className="cobbl-form-actions">
                          <Button
                            type="submit"
                            kind="primary"
                            renderIcon={
                              isSavingProfile ? undefined : CheckmarkFilled
                            }
                            disabled={isSavingProfile}
                          >
                            {isSavingProfile ? (
                              <InlineLoading description="Saving..." />
                            ) : (
                              'Save profile settings'
                            )}
                          </Button>
                        </div>
                      </Stack>
                    </Form>
                  </Tile>
                </div>
              </TabPanel>

              {/* Tab 1: Email & Verification */}
              <TabPanel>
                <div className="cobbl-settings-panel">
                  <Tile className="cobbl-settings-card">
                    <h2 className="cobbl-section-heading">
                      Email Verification Status
                    </h2>
                    <Stack gap={5}>
                      <div className="cobbl-inline-row">
                        <div>
                          <div className="cobbl-stat-label">Current email</div>
                          <p className="cobbl-subsection-heading">
                            {session.user.email}
                          </p>
                        </div>
                        <IconIndicator
                          kind={
                            session.user.emailVerified
                              ? 'succeeded'
                              : 'caution-minor'
                          }
                          label={
                            session.user.emailVerified
                              ? 'Verified'
                              : 'Unverified'
                          }
                        />
                      </div>

                      {!session.user.emailVerified ? (
                        <>
                          <div className="cobbl-form-actions">
                            <Button
                              type="button"
                              kind="secondary"
                              renderIcon={Email}
                              disabled={isVerifyingEmail}
                              onClick={handleSendVerifyOtp}
                            >
                              {verifyOtpSent
                                ? 'Resend verification code'
                                : 'Send verification OTP'}
                            </Button>
                          </div>

                          <Form onSubmit={handleConfirmCurrentEmail} noValidate>
                            <Stack gap={5}>
                              <TextInput
                                id="settings-verify-otp"
                                name="otp"
                                className="cobbl-otp-input"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                labelText="6-digit verification code"
                                placeholder="123456"
                                value={verifyOtp}
                                onChange={(e) =>
                                  setVerifyOtp(
                                    e.target.value.replace(/\D/g, '').slice(0, 6)
                                  )
                                }
                              />
                              <div className="cobbl-form-actions">
                                <Button
                                  type="submit"
                                  kind="primary"
                                  disabled={isVerifyingEmail}
                                >
                                  Verify email address
                                </Button>
                              </div>
                            </Stack>
                          </Form>
                        </>
                      ) : null}
                    </Stack>
                  </Tile>

                  <Tile className="cobbl-settings-card">
                    <h2 className="cobbl-section-heading">
                      Change Email via OTP
                    </h2>
                    {emailChangeStep === 'request' ? (
                      <Form onSubmit={handleRequestEmailChange} noValidate>
                        <Stack gap={5}>
                          <TextInput
                            id="settings-new-email"
                            name="newEmail"
                            type="email"
                            labelText="New email address"
                            helperText="We will send a 6-digit OTP to your new address to confirm ownership."
                            placeholder="new.address@footwearco.com"
                            autoComplete="email"
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="none"
                            required
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onBlur={() => setNewEmailTouched(true)}
                            invalid={Boolean(newEmailError)}
                            invalidText={newEmailError || undefined}
                          />
                          <div className="cobbl-form-actions">
                            <Button
                              type="submit"
                              kind="primary"
                              renderIcon={Email}
                              disabled={isChangingEmail}
                            >
                              {isChangingEmail ? (
                                <InlineLoading description="Sending code..." />
                              ) : (
                                'Send confirmation OTP'
                              )}
                            </Button>
                          </div>
                        </Stack>
                      </Form>
                    ) : (
                      <Form onSubmit={handleConfirmEmailChange} noValidate>
                        <Stack gap={5}>
                          <TextInput
                            id="settings-new-email-otp"
                            name="otp"
                            className="cobbl-otp-input"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            labelText="Confirmation code"
                            helperText={`Enter the 6-digit code sent to ${newEmail.trim()}.`}
                            placeholder="123456"
                            required
                            value={newEmailOtp}
                            onChange={(e) =>
                              setNewEmailOtp(
                                e.target.value.replace(/\D/g, '').slice(0, 6)
                              )
                            }
                            onBlur={() => setNewEmailOtpTouched(true)}
                            invalid={Boolean(newEmailOtpError)}
                            invalidText={newEmailOtpError || undefined}
                          />
                          <div className="cobbl-form-actions">
                            <Button
                              type="submit"
                              kind="primary"
                              disabled={isChangingEmail}
                            >
                              {isChangingEmail ? (
                                <InlineLoading description="Confirming..." />
                              ) : (
                                'Confirm email change'
                              )}
                            </Button>
                            <Button
                              type="button"
                              kind="ghost"
                              disabled={isChangingEmail}
                              onClick={() => {
                                setEmailChangeStep('request');
                                setNewEmailOtp('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Stack>
                      </Form>
                    )}
                  </Tile>
                </div>
              </TabPanel>

              {/* Tab 2: Security & Sessions */}
              <TabPanel>
                <div className="cobbl-settings-panel">
                  <Tile className="cobbl-settings-card">
                    <h2 className="cobbl-section-heading">Change Password</h2>
                    <Form onSubmit={handleChangePassword} noValidate>
                      <Stack gap={6}>
                        <PasswordInput
                          id="settings-current-password"
                          name="currentPassword"
                          labelText="Current password"
                          autoComplete="current-password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          invalid={Boolean(currentPwError)}
                          invalidText={currentPwError || undefined}
                        />

                        <PasswordInput
                          id="settings-new-password"
                          name="newPassword"
                          labelText="New password"
                          helperText="At least 8 characters with uppercase, lowercase, and a number."
                          autoComplete="new-password"
                          minLength={8}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          onBlur={() => setPwTouched(true)}
                          invalid={Boolean(newPwError)}
                          invalidText={newPwError || undefined}
                        />

                        <Checkbox
                          id="settings-revoke-other-sessions"
                          labelText="Sign out of all other devices after updating password"
                          checked={revokeOthersOnPwChange}
                          onChange={(_evt, { checked }) =>
                            setRevokeOthersOnPwChange(checked)
                          }
                        />

                        <div className="cobbl-form-actions">
                          <Button
                            type="submit"
                            kind="primary"
                            renderIcon={
                              isChangingPassword ? undefined : Security
                            }
                            disabled={isChangingPassword}
                          >
                            {isChangingPassword ? (
                              <InlineLoading description="Updating..." />
                            ) : (
                              'Update password'
                            )}
                          </Button>
                        </div>
                      </Stack>
                    </Form>
                  </Tile>

                  <Tile className="cobbl-settings-card">
                    <div className="cobbl-inline-row">
                      <div>
                        <h2 className="cobbl-section-heading">
                          Active Sessions
                        </h2>
                        <p className="cobbl-body-muted">
                          Devices and shop-floor terminals currently signed in to
                          your account.
                        </p>
                      </div>
                      <div className="cobbl-inline-cluster">
                        <Button
                          type="button"
                          kind="ghost"
                          size="sm"
                          renderIcon={Renew}
                          disabled={loadingSessions}
                          onClick={() => void loadSessions()}
                        >
                          Refresh
                        </Button>
                        <Button
                          type="button"
                          kind="danger--tertiary"
                          size="sm"
                          disabled={loadingSessions || sessions.length <= 1}
                          onClick={handleRevokeOtherSessions}
                        >
                          Sign out other sessions
                        </Button>
                      </div>
                    </div>

                    <hr className="cobbl-divider" />

                    {loadingSessions ? (
                      <InlineLoading description="Loading active sessions..." />
                    ) : sessions.length === 0 ? (
                      <p className="cobbl-body-muted">
                        No active session records found.
                      </p>
                    ) : (
                      <StructuredListWrapper aria-label="Active login sessions">
                        <StructuredListHead>
                          <StructuredListRow head>
                            <StructuredListCell head>
                              Device / Client
                            </StructuredListCell>
                            <StructuredListCell head>
                              IP Address
                            </StructuredListCell>
                            <StructuredListCell head>
                              Expires
                            </StructuredListCell>
                            <StructuredListCell head>
                              Status / Action
                            </StructuredListCell>
                          </StructuredListRow>
                        </StructuredListHead>
                        <StructuredListBody>
                          {sessions.map((item) => {
                            const isCurrent = item.id === session.session.id;
                            return (
                              <StructuredListRow key={item.id}>
                                <StructuredListCell>
                                  {item.userAgent || 'Unknown browser/device'}
                                </StructuredListCell>
                                <StructuredListCell>
                                  {item.ipAddress || 'Unavailable'}
                                </StructuredListCell>
                                <StructuredListCell>
                                  {new Date(item.expiresAt).toLocaleDateString()}
                                </StructuredListCell>
                                <StructuredListCell>
                                  {isCurrent ? (
                                    <IconIndicator
                                      kind="succeeded"
                                      label="Current session"
                                    />
                                  ) : (
                                    <Button
                                      type="button"
                                      kind="danger--ghost"
                                      size="sm"
                                      renderIcon={TrashCan}
                                      disabled={revokingId === item.id}
                                      onClick={() =>
                                        void handleRevokeSession(
                                          item.token,
                                          item.id
                                        )
                                      }
                                    >
                                      Revoke
                                    </Button>
                                  )}
                                </StructuredListCell>
                              </StructuredListRow>
                            );
                          })}
                        </StructuredListBody>
                      </StructuredListWrapper>
                    )}
                  </Tile>
                </div>
              </TabPanel>

              {/* Tab 3: Factory Workspaces */}
              <TabPanel>
                <div className="cobbl-settings-panel">
                  <Tile className="cobbl-settings-card">
                    <h2 className="cobbl-section-heading">
                      Factory Organizations (Tenants)
                    </h2>
                    <Stack gap={5}>
                      {loadingOrgs ? (
                        <InlineLoading description="Loading factory workspaces..." />
                      ) : orgs.length === 0 ? (
                        <p className="cobbl-body-muted">
                          You do not belong to any factory workspace yet. Create
                          one below to scope products, work orders, and
                          inventory.
                        </p>
                      ) : (
                        <StructuredListWrapper aria-label="Factory organizations">
                          <StructuredListHead>
                            <StructuredListRow head>
                              <StructuredListCell head>
                                Factory Name
                              </StructuredListCell>
                              <StructuredListCell head>
                                Workspace Slug
                              </StructuredListCell>
                              <StructuredListCell head>
                                Status
                              </StructuredListCell>
                            </StructuredListRow>
                          </StructuredListHead>
                          <StructuredListBody>
                            {orgs.map((org) => {
                              const isActive = org.id === activeOrgId;
                              return (
                                <StructuredListRow key={org.id}>
                                  <StructuredListCell>
                                    {org.name}
                                  </StructuredListCell>
                                  <StructuredListCell>
                                    <span className="cobbl-mono-code">
                                      {org.slug}
                                    </span>
                                  </StructuredListCell>
                                  <StructuredListCell>
                                    {isActive ? (
                                      <IconIndicator
                                        kind="succeeded"
                                        label="Active workspace"
                                      />
                                    ) : (
                                      <Button
                                        type="button"
                                        kind="secondary"
                                        size="sm"
                                        disabled={isUpdatingOrg}
                                        onClick={() =>
                                          void handleSwitchOrg(org.id)
                                        }
                                      >
                                        Set active
                                      </Button>
                                    )}
                                  </StructuredListCell>
                                </StructuredListRow>
                              );
                            })}
                          </StructuredListBody>
                        </StructuredListWrapper>
                      )}

                      <hr className="cobbl-divider" />

                      <Form onSubmit={handleCreateOrg}>
                        <Stack gap={5}>
                          <TextInput
                            id="new-factory-name"
                            name="factoryName"
                            type="text"
                            labelText="Create new factory workspace"
                            placeholder="Florence Artisanal Sole Plant"
                            required
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                          />
                          <div className="cobbl-form-actions">
                            <Button
                              type="submit"
                              kind="primary"
                              renderIcon={Add}
                              disabled={isUpdatingOrg}
                            >
                              Create &amp; activate factory
                            </Button>
                          </div>
                        </Stack>
                      </Form>
                    </Stack>
                  </Tile>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Grid>
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <Grid className="cobbl-grid-group">
            <Column sm={4} md={8} lg={16}>
              <Tile className="cobbl-auth-tile">
                <InlineLoading description="Loading settings..." />
              </Tile>
            </Column>
          </Grid>
        </AppShell>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

