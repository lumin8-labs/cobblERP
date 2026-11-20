import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/db", () => {
  const user = {
    id: "user.id",
    name: "user.name",
    email: "user.email",
    emailVerified: "user.emailVerified",
    image: "user.image",
    jobTitle: "user.jobTitle",
    phone: "user.phone",
    defaultDepartment: "user.defaultDepartment",
    preferredTheme: "user.preferredTheme",
    emailNotifications: "user.emailNotifications",
    createdAt: "user.createdAt",
    updatedAt: "user.updatedAt",
  };
  const member = {
    id: "member.id",
    userId: "member.userId",
    organizationId: "member.organizationId",
    role: "member.role",
  };
  return {
    db: { update: vi.fn(), select: vi.fn() },
    user,
    member,
  };
});

import { db } from "@repo/db";
import { UsersService } from "../src/users/users.service";

const mockedDb = vi.mocked(db, true);

function mockReturning(row: Record<string, unknown>) {
  const returning = vi.fn().mockResolvedValue([row]);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  mockedDb.update.mockReturnValue({ set } as never);
  return { set, where, returning };
}

describe("UsersService.updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an empty name", async () => {
    const service = new UsersService();
    await expect(
      service.updateProfile("user-1", { name: "   " })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedDb.update).not.toHaveBeenCalled();
  });

  it("rejects non-http avatar URLs", async () => {
    const service = new UsersService();
    await expect(
      service.updateProfile("user-1", { image: "javascript:alert(1)" })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedDb.update).not.toHaveBeenCalled();
  });

  it("rejects unsupported themes", async () => {
    const service = new UsersService();
    await expect(
      service.updateProfile("user-1", { preferredTheme: "g90" as never })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("trims text fields before persisting", async () => {
    const { set } = mockReturning({ id: "user-1", name: "Amina Patel" });
    const service = new UsersService();

    const result = await service.updateProfile("user-1", {
      name: "  Amina Patel  ",
      jobTitle: "  Lasting Supervisor ",
      phone: " +1 555 014 8890 ",
      defaultDepartment: "  Lasting & Bottoming ",
      preferredTheme: "white",
      emailNotifications: false,
    });

    expect(result).toEqual({ id: "user-1", name: "Amina Patel" });
    const payload = set.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: "Amina Patel",
      jobTitle: "Lasting Supervisor",
      phone: "+1 555 014 8890",
      defaultDepartment: "Lasting & Bottoming",
      preferredTheme: "white",
      emailNotifications: false,
    });
    expect(payload.updatedAt).toBeInstanceOf(Date);
  });

  it("clears optional fields when given null or blank values", async () => {
    const { set } = mockReturning({ id: "user-1" });
    const service = new UsersService();

    await service.updateProfile("user-1", {
      image: null,
      jobTitle: "",
      phone: "   ",
      defaultDepartment: "",
    });

    expect(set.mock.calls[0][0]).toMatchObject({
      image: null,
      jobTitle: null,
      phone: null,
      defaultDepartment: "Production Floor",
    });
  });
});
