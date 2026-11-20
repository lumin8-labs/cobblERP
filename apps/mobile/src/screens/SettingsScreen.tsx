import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
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
import {
  MobileAuthService,
  type MobileOrganization,
  type MobileSessionData,
} from '../services/auth';

interface SettingsScreenProps {
  session: MobileSessionData;
  onRefreshSession: () => Promise<void>;
  onSignedOut: () => void;
}

const DEPARTMENTS = [
  'Production Floor',
  'Clicking & Cutting',
  'Closing & Stitching',
  'Lasting & Bottoming',
  'Assembly & Soling',
  'Finishing & QC',
];

export function SettingsScreen({
  session,
  onRefreshSession,
  onSignedOut,
}: SettingsScreenProps) {
  const { mode, colors, setTheme } = useCarbonTheme();
  const styles = createStyles(colors);

  const [name, setName] = useState(session.user.name || '');
  const [jobTitle, setJobTitle] = useState(session.user.jobTitle || '');
  const [phone, setPhone] = useState(session.user.phone || '');
  const [department, setDepartment] = useState(
    session.user.defaultDepartment || 'Production Floor'
  );
  const [emailNotifications, setEmailNotifications] = useState(
    session.user.emailNotifications ?? true
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [orgs, setOrgs] = useState<MobileOrganization[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(session.user.name || '');
    setJobTitle(session.user.jobTitle || '');
    setPhone(session.user.phone || '');
    setDepartment(session.user.defaultDepartment || 'Production Floor');
    setEmailNotifications(session.user.emailNotifications ?? true);
  }, [session.user]);

  useEffect(() => {
    MobileAuthService.listOrganizations().then(setOrgs).catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await MobileAuthService.updateProfile({
        name: name.trim(),
        jobTitle: jobTitle.trim() || undefined,
        phone: phone.trim() || undefined,
        defaultDepartment: department,
        preferredTheme: mode,
        emailNotifications,
      });
      await onRefreshSession();
      setSuccessMsg('Profile and shop-floor settings saved.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!currentPassword || newPassword.length < 8) {
      setErrorMsg('Provide current password and an 8+ character new password.');
      return;
    }
    setSaving(true);
    try {
      await MobileAuthService.changePassword(currentPassword, newPassword, true);
      setCurrentPassword('');
      setNewPassword('');
      await onRefreshSession();
      setSuccessMsg('Password updated.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchOrg = async (orgId: string) => {
    setErrorMsg(null);
    setSaving(true);
    try {
      await MobileAuthService.setActiveOrganization(orgId);
      await onRefreshSession();
      setSuccessMsg('Active factory organization switched.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not switch organization.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await MobileAuthService.signOut();
    onSignedOut();
  };

  return (
    <View style={styles.stack}>
      {errorMsg ? (
        <View style={[styles.notice, { backgroundColor: colors.supportErrorBg, borderLeftColor: colors.supportError }]}>
          <Text style={[styles.noticeText, { color: colors.supportError }]}>{errorMsg}</Text>
        </View>
      ) : null}

      {successMsg ? (
        <View style={[styles.notice, { backgroundColor: colors.supportSuccessBg, borderLeftColor: colors.supportSuccess }]}>
          <Text style={[styles.noticeText, { color: colors.supportSuccess }]}>{successMsg}</Text>
        </View>
      ) : null}

      {/* Profile & Preferences */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>OPERATOR PROFILE</Text>
            <Text style={styles.title}>{session.user.email}</Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: session.user.emailVerified
                  ? colors.supportSuccessBg
                  : colors.supportWarningBg,
                borderColor: session.user.emailVerified
                  ? colors.supportSuccess
                  : colors.supportWarning,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: session.user.emailVerified
                    ? colors.supportSuccess
                    : colors.supportWarning,
                },
              ]}
            >
              {session.user.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Operator Name"
          placeholderTextColor={colors.textPlaceholder}
        />

        <Text style={styles.label}>Job Title</Text>
        <TextInput
          style={styles.input}
          value={jobTitle}
          onChangeText={setJobTitle}
          placeholder="Master Lasting Supervisor"
          placeholderTextColor={colors.textPlaceholder}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 555 014 8890"
          placeholderTextColor={colors.textPlaceholder}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Primary Department</Text>
        <View style={styles.chipWrap}>
          {DEPARTMENTS.map((dept) => {
            const active = department === dept;
            return (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.interactive01 : colors.layer02,
                    borderColor: active ? colors.interactive01 : colors.borderSubtle,
                  },
                ]}
                onPress={() => setDepartment(dept)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.textOnColor : colors.textSecondary },
                  ]}
                >
                  {dept}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Carbon Theme</Text>
        <View style={styles.chipWrap}>
          {(
            [
              ['g100', 'Gray 100 (Dark)'],
              ['white', 'White (Light)'],
            ] as ['g100' | 'white', string][]
          ).map(([themeKey, label]) => {
            const active = mode === themeKey;
            return (
              <TouchableOpacity
                key={themeKey}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.interactive01 : colors.layer02,
                    borderColor: active ? colors.interactive01 : colors.borderSubtle,
                  },
                ]}
                onPress={() => setTheme(themeKey)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.textOnColor : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Production & QC Email Alerts</Text>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: colors.layer03, true: colors.interactive01 }}
            thumbColor={colors.textOnColor}
          />
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textOnColor} />
          ) : (
            <Text style={styles.primaryBtnText}>Save Profile Settings</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Change Password */}
      <View style={styles.card}>
        <Text style={styles.title}>Security — Change Password</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry
        />

        <Text style={styles.label}>New Password (min 8 chars)</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleChangePassword}
          disabled={saving}
        >
          <Text style={styles.secondaryBtnText}>Update Password</Text>
        </TouchableOpacity>
      </View>

      {/* Active Factory Organizations */}
      {orgs.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.title}>Factory Workspaces</Text>
          {orgs.map((org) => {
            const isActive = org.id === session.session.activeOrganizationId;
            return (
              <View key={org.id} style={styles.orgRow}>
                <View>
                  <Text style={styles.orgName}>{org.name}</Text>
                  <Text style={styles.orgSlug}>{org.slug}</Text>
                </View>
                {isActive ? (
                  <Text style={[styles.badgeText, { color: colors.supportSuccess }]}>
                    ACTIVE
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={styles.switchOrgBtn}
                    onPress={() => handleSwitchOrg(org.id)}
                  >
                    <Text style={styles.switchOrgText}>Activate</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      ) : null}

      <TouchableOpacity style={styles.dangerBtn} onPress={handleSignOut}>
        <Text style={styles.primaryBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors: CarbonThemeColors) {
  return StyleSheet.create({
    stack: {
      gap: CarbonSpacing.lg,
    },
    card: {
      backgroundColor: colors.layer01,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: CarbonSpacing.lg,
      gap: CarbonSpacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: CarbonSpacing.sm,
    },
    eyebrow: {
      fontSize: CarbonTypography.caption.fontSize,
      color: colors.textPlaceholder,
      letterSpacing: 1,
      fontWeight: '600',
    },
    title: {
      fontSize: CarbonTypography.body02.fontSize,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    badge: {
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    notice: {
      borderLeftWidth: 3,
      padding: CarbonSpacing.sm,
    },
    noticeText: {
      fontSize: CarbonTypography.caption.fontSize,
      fontWeight: '500',
    },
    label: {
      fontSize: CarbonTypography.caption.fontSize,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: CarbonSpacing.xs,
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
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: CarbonSpacing.sm,
    },
    chip: {
      borderWidth: 1,
      paddingVertical: 6,
      paddingHorizontal: CarbonSpacing.sm,
    },
    chipText: {
      fontSize: CarbonTypography.caption.fontSize,
      fontWeight: '500',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: CarbonSpacing.sm,
    },
    switchLabel: {
      fontSize: CarbonTypography.body01.fontSize,
      color: colors.textPrimary,
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
      marginTop: CarbonSpacing.sm,
    },
    secondaryBtnText: {
      color: colors.textPrimary,
      fontSize: CarbonTypography.body01.fontSize,
      fontWeight: '600',
    },
    dangerBtn: {
      backgroundColor: colors.buttonDanger,
      paddingVertical: CarbonSpacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orgRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: CarbonSpacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
    orgName: {
      fontSize: CarbonTypography.body01.fontSize,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    orgSlug: {
      fontSize: CarbonTypography.caption.fontSize,
      fontFamily: 'Courier',
      color: colors.textSecondary,
    },
    switchOrgBtn: {
      borderWidth: 1,
      borderColor: colors.interactive01,
      paddingHorizontal: CarbonSpacing.md,
      paddingVertical: 6,
    },
    switchOrgText: {
      fontSize: CarbonTypography.caption.fontSize,
      color: colors.interactive01,
      fontWeight: '600',
    },
  });
}

