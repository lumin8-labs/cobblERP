export type AuthOtpType =
  | 'sign-in'
  | 'email-verification'
  | 'forget-password'
  | 'change-email';

interface SendAuthOtpEmailParams {
  email: string;
  otp: string;
  type: AuthOtpType;
}

const OTP_EMAIL_COPY: Record<
  AuthOtpType,
  { subject: string; heading: string; action: string }
> = {
  'sign-in': {
    subject: 'Your CobblERP sign-in verification code',
    heading: 'Sign in to CobblERP',
    action: 'Use the verification code below to sign in to your workspace:',
  },
  'email-verification': {
    subject: 'Verify your CobblERP email address',
    heading: 'Verify your email address',
    action: 'Enter this 6-digit code to verify your CobblERP account:',
  },
  'forget-password': {
    subject: 'Reset your CobblERP password',
    heading: 'Password reset verification',
    action: 'Enter this 6-digit code to reset your CobblERP password:',
  },
  'change-email': {
    subject: 'Confirm your new CobblERP email address',
    heading: 'Confirm email address change',
    action: 'Enter this 6-digit code to confirm updating your account email:',
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendAuthOtpEmail({
  email,
  otp,
  type,
}: SendAuthOtpEmailParams): Promise<void> {
  const copy = OTP_EMAIL_COPY[type];
  const safeOtp = escapeHtml(otp);
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.AUTH_EMAIL_FROM || 'CobblERP <onboarding@resend.dev>';

  const text = `${copy.heading}\n\n${copy.action}\n\nCode: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, you can safely ignore this message.`;
  const html = `
    <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #161616; color: #f4f4f4; border: 1px solid #393939;">
      <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #c6c6c6; margin: 0 0 8px;">CobblERP Footwear Manufacturing</p>
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px; color: #ffffff;">${escapeHtml(copy.heading)}</h1>
      <p style="font-size: 14px; line-height: 1.5; color: #c6c6c6; margin: 0 0 20px;">${escapeHtml(copy.action)}</p>
      <div style="background: #262626; border-left: 3px solid #0f62fe; padding: 16px; font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: 700; letter-spacing: 0.24em; color: #ffffff; text-align: center; margin-bottom: 20px;">
        ${safeOtp}
      </div>
      <p style="font-size: 12px; line-height: 1.5; color: #8d8d8d; margin: 0;">This code expires in 10 minutes. Never share verification codes with anyone else.</p>
    </div>
  `.trim();

  const hasResendKey = Boolean(
    resendApiKey && !resendApiKey.includes('xxxxx') && !resendApiKey.startsWith('re_test_dummy')
  );

  if (hasResendKey && resendApiKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: copy.subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown email provider error');
      throw new Error(`Failed to send auth OTP email: ${response.status} ${errorText}`);
    }
    return;
  }

  if (process.env.NODE_ENV !== 'production' || process.env.AUTH_DEV_LOG_OTP === 'true') {
    console.info(
      `[CobblERP Auth][DEV OTP] type=${type} email=${email} otp=${otp}`
    );
    return;
  }

  console.warn(
    `[CobblERP Auth] RESEND_API_KEY is not configured; skipped email delivery for type=${type}.`
  );
}

