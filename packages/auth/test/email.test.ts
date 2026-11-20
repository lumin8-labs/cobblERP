import { afterEach, describe, expect, it, vi } from "vitest";
import { sendAuthOtpEmail } from "../src/email";

describe("sendAuthOtpEmail", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalResendKey = process.env.RESEND_API_KEY;
  const originalDevLog = process.env.AUTH_DEV_LOG_OTP;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalResendKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendKey;
    }
    if (originalDevLog === undefined) {
      delete process.env.AUTH_DEV_LOG_OTP;
    } else {
      process.env.AUTH_DEV_LOG_OTP = originalDevLog;
    }
    vi.restoreAllMocks();
  });

  it("logs the OTP to the console when no Resend key is configured", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.RESEND_API_KEY;
    delete process.env.AUTH_DEV_LOG_OTP;

    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendAuthOtpEmail({
      email: "operator@factory.com",
      otp: "123456",
      type: "sign-in",
    });

    expect(info).toHaveBeenCalledTimes(1);
    expect(info.mock.calls[0][0]).toContain("otp=123456");
    expect(info.mock.calls[0][0]).toContain("operator@factory.com");
  });

  it("skips delivery in production when email is not configured", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.RESEND_API_KEY;
    delete process.env.AUTH_DEV_LOG_OTP;

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendAuthOtpEmail({
      email: "operator@factory.com",
      otp: "654321",
      type: "forget-password",
    });

    expect(info).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("treats placeholder Resend keys as unconfigured", async () => {
    process.env.NODE_ENV = "test";
    process.env.RESEND_API_KEY = "re_xxxxxxxxxxxxxxxxxxxxxxxxxx";

    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await sendAuthOtpEmail({
      email: "operator@factory.com",
      otp: "111111",
      type: "email-verification",
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledTimes(1);
  });
});
