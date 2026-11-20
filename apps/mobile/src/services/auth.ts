import { Platform } from 'react-native';

/**
 * CobblERP Mobile Authentication Service
 * Implements token-based Bearer auth + Email OTP + Profile/Settings flows
 * for bare React Native shop-floor operators.
 */

export interface MobileUserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  defaultDepartment?: string | null;
  preferredTheme?: 'g100' | 'white' | string;
  emailNotifications?: boolean;
}

export interface MobileSessionData {
  user: MobileUserProfile;
  session: {
    id: string;
    token: string;
    activeOrganizationId?: string | null;
  };
}

export interface MobileOrganization {
  id: string;
  name: string;
  slug: string;
}

let _authToken: string | null = null;
let _activeOrganizationId: string | null = null;
let _authBaseUrl: string =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const MobileAuthService = {
  setBaseUrl(url: string) {
    _authBaseUrl = url.replace(/\/+$/, '');
  },

  getBaseUrl(): string {
    return _authBaseUrl;
  },

  setToken(token: string | null) {
    _authToken = token;
  },

  getToken(): string | null {
    return _authToken;
  },

  setActiveOrg(orgId: string | null) {
    _activeOrganizationId = orgId;
  },

  getActiveOrg(): string | null {
    return _activeOrganizationId;
  },

  /**
   * Helper to execute authenticated requests to NestJS or Next.js endpoints
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    if (_authToken) {
      headers.set('Authorization', `Bearer ${_authToken}`);
    }
    if (_activeOrganizationId) {
      headers.set('x-organization-id', _activeOrganizationId);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  },

  async getSession(): Promise<MobileSessionData | null> {
    if (!_authToken) return null;
    const res = await this.authenticatedFetch(`${_authBaseUrl}/api/auth/get-session`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (data?.session?.activeOrganizationId) {
      _activeOrganizationId = data.session.activeOrganizationId;
    }
    return data;
  },

  /**
   * Sign up with name, email, and password (triggers verification email OTP)
   */
  async signUp(name: string, email: string, password: string) {
    const res = await fetch(`${_authBaseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Sign up failed');
    }

    const token = res.headers.get('set-auth-token') || data.token;
    if (token) {
      _authToken = token;
    }
    return data;
  },

  /**
   * Sign in using Better Auth email & password
   */
  async signIn(email: string, password: string) {
    const res = await fetch(`${_authBaseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed');
    }

    const token = res.headers.get('set-auth-token') || data.token;
    if (token) {
      _authToken = token;
    }

    return data;
  },

  /**
   * Send an Email OTP for sign-in, email-verification, or forget-password
   */
  async sendVerificationOTP(
    email: string,
    type: 'sign-in' | 'email-verification' | 'forget-password'
  ) {
    const endpoint =
      type === 'forget-password'
        ? '/api/auth/email-otp/request-password-reset'
        : '/api/auth/email-otp/send-verification-otp';

    const payload = type === 'forget-password' ? { email } : { email, type };

    const res = await fetch(`${_authBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to send verification code');
    }
    return data;
  },

  /**
   * Sign in passwordlessly using Email OTP
   */
  async signInWithEmailOTP(email: string, otp: string, name?: string) {
    const res = await fetch(`${_authBaseUrl}/api/auth/sign-in/email-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, ...(name ? { name } : {}) }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'OTP sign-in failed');
    }

    const token = res.headers.get('set-auth-token') || data.token;
    if (token) {
      _authToken = token;
    }
    return data;
  },

  /**
   * Verify email address using 6-digit OTP
   */
  async verifyEmailOTP(email: string, otp: string) {
    const res = await fetch(`${_authBaseUrl}/api/auth/email-otp/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Email verification failed');
    }

    const token = res.headers.get('set-auth-token') || data.token;
    if (token) {
      _authToken = token;
    }
    return data;
  },

  /**
   * Check password-reset OTP validity before setting a new password
   */
  async checkPasswordResetOTP(email: string, otp: string) {
    const res = await fetch(
      `${_authBaseUrl}/api/auth/email-otp/check-verification-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'forget-password', otp }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Invalid or expired reset code');
    }
    return data;
  },

  /**
   * Complete password reset using Email OTP
   */
  async resetPasswordWithOTP(email: string, otp: string, password: string) {
    const res = await fetch(`${_authBaseUrl}/api/auth/email-otp/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Password reset failed');
    }
    return data;
  },

  /**
   * Update authenticated user profile & workspace preferences
   */
  async updateProfile(payload: {
    name?: string;
    jobTitle?: string;
    phone?: string;
    defaultDepartment?: string;
    preferredTheme?: 'g100' | 'white';
    emailNotifications?: boolean;
  }) {
    const res = await this.authenticatedFetch(`${_authBaseUrl}/api/auth/update-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data;
  },

  /**
   * Change password while signed in
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    revokeOtherSessions = true
  ) {
    const res = await this.authenticatedFetch(
      `${_authBaseUrl}/api/auth/change-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    const token = res.headers.get('set-auth-token') || data.token;
    if (token) {
      _authToken = token;
    }
    return data;
  },

  async listOrganizations(): Promise<MobileOrganization[]> {
    const res = await this.authenticatedFetch(
      `${_authBaseUrl}/api/auth/organization/list`
    );
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  },

  async setActiveOrganization(organizationId: string) {
    const res = await this.authenticatedFetch(
      `${_authBaseUrl}/api/auth/organization/set-active`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to switch organization');
    }
    _activeOrganizationId = organizationId;
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    if (_authToken) {
      await fetch(`${_authBaseUrl}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${_authToken}`,
        },
      }).catch(() => {});
    }
    _authToken = null;
    _activeOrganizationId = null;
  },
};
