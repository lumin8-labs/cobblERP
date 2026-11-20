import { describe, expect, it } from "vitest";
import {
  toOrganizationSlug,
  validateEmail,
  validateFullName,
  validateOptionalUrl,
  validateOtp,
  validatePassword,
} from "../src/lib/validation";

describe("validateEmail", () => {
  it("accepts a normal work email", () => {
    expect(validateEmail("operator@factory.com")).toBeNull();
  });

  it("rejects empty and malformed addresses", () => {
    expect(validateEmail("   ")).toMatch(/Enter your email/);
    expect(validateEmail("not-an-email")).toMatch(/format/);
    expect(validateEmail("a@b")).toMatch(/format/);
  });
});

describe("validatePassword", () => {
  it("requires length and mixed character classes", () => {
    expect(validatePassword("Short1")).toMatch(/at least 8/);
    expect(validatePassword("alllowercase1")).toMatch(/uppercase/);
    expect(validatePassword("ALLUPPERCASE1")).toMatch(/lowercase/);
    expect(validatePassword("NoNumbersHere")).toMatch(/number/);
  });

  it("accepts a compliant password", () => {
    expect(validatePassword("CobblERP2026")).toBeNull();
  });
});

describe("validateOtp", () => {
  it("only accepts exactly six digits", () => {
    expect(validateOtp("12345")).toMatch(/6 digits/);
    expect(validateOtp("12345a")).toMatch(/6 digits/);
    expect(validateOtp("123456")).toBeNull();
  });
});

describe("validateFullName", () => {
  it("requires at least two characters", () => {
    expect(validateFullName(" ")).toMatch(/Enter your full name/);
    expect(validateFullName("A")).toMatch(/at least 2/);
    expect(validateFullName("Amina Patel")).toBeNull();
  });
});

describe("validateOptionalUrl", () => {
  it("allows blank values", () => {
    expect(validateOptionalUrl("")).toBeNull();
  });

  it("requires http(s) URLs", () => {
    expect(validateOptionalUrl("ftp://example.com")).toMatch(/https/);
    expect(validateOptionalUrl("example.com")).toMatch(/valid URL/);
    expect(validateOptionalUrl("https://example.com/a.png")).toBeNull();
  });
});

describe("toOrganizationSlug", () => {
  it("normalizes a factory name and appends a random suffix", () => {
    const slug = toOrganizationSlug("Northampton Goodyear Works");
    expect(slug).toMatch(/^northampton-goodyear-works-[a-z0-9]{4}$/);
  });

  it("falls back to a factory slug for symbol-only names", () => {
    expect(toOrganizationSlug("***")).toMatch(/^factory-[a-z0-9]{4}$/);
  });
});
