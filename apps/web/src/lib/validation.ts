export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Enter your email address.';
  }
  // Standard practical check without overly restrictive ASCII-only rules
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return 'Enter an email address in the format you@company.com.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Enter a password.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (password.length > 128) {
    return 'Password must be 128 characters or fewer.';
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return 'Include at least one uppercase letter, one lowercase letter, and one number.';
  }
  return null;
}

export function validateOtp(otp: string): string | null {
  const cleaned = otp.trim();
  if (!cleaned) {
    return 'Enter the 6-digit verification code.';
  }
  if (!/^\d{6}$/.test(cleaned)) {
    return 'Verification code must be exactly 6 digits.';
  }
  return null;
}

export function validateFullName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Enter your full name.';
  }
  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters long.';
  }
  return null;
}

export function validateOptionalUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'URL must start with https:// or http://.';
    }
    return null;
  } catch {
    return 'Enter a valid URL starting with https:// or http://.';
  }
}

export function toOrganizationSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'factory'}-${suffix}`;
}

