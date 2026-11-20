import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import * as authSchema from "../src/schema/auth";
import {
  account,
  invitation,
  member,
  organization,
  session,
  user,
  verification,
} from "../src/schema/auth";

function columnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((column) => column.name);
}

describe("auth & multitenancy schema", () => {
  it("stores footwear operator profile fields on the user", () => {
    expect(columnNames(user)).toEqual(
      expect.arrayContaining([
        "id",
        "email",
        "email_verified",
        "job_title",
        "phone",
        "default_department",
        "preferred_theme",
        "email_notifications",
        "dodo_customer_id",
      ])
    );

    const theme = getTableConfig(user).columns.find(
      (column) => column.name === "preferred_theme"
    );
    expect(theme?.default).toBe("g100");
  });

  it("models sessions, accounts and verification codes", () => {
    expect(columnNames(session)).toEqual(
      expect.arrayContaining([
        "id",
        "token",
        "user_id",
        "active_organization_id",
        "expires_at",
      ])
    );
    expect(columnNames(account)).toEqual(
      expect.arrayContaining(["provider_id", "password", "user_id"])
    );
    expect(columnNames(verification)).toEqual(
      expect.arrayContaining(["identifier", "value", "expires_at"])
    );
  });

  it("models factories as organizations with members and invitations", () => {
    expect(columnNames(organization)).toEqual(
      expect.arrayContaining(["id", "name", "slug", "metadata"])
    );
    expect(columnNames(member)).toEqual(
      expect.arrayContaining(["organization_id", "user_id", "role"])
    );
    expect(columnNames(invitation)).toEqual(
      expect.arrayContaining([
        "organization_id",
        "email",
        "role",
        "status",
        "inviter_id",
      ])
    );
  });

  it("keeps the legacy users alias pointed at the Better Auth user table", () => {
    expect(authSchema.users).toBe(authSchema.user);
  });
});
