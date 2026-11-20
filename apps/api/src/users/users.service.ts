import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { db, user, member } from '@repo/db';
import { desc, eq } from 'drizzle-orm';
import { UpdateProfileDto } from './dto/update-profile.dto';

const SAFE_USER_COLUMNS = {
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  image: user.image,
  jobTitle: user.jobTitle,
  phone: user.phone,
  defaultDepartment: user.defaultDepartment,
  preferredTheme: user.preferredTheme,
  emailNotifications: user.emailNotifications,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

@Injectable()
export class UsersService {
  async findMe(userId: string, activeOrganizationId?: string) {
    const [currentUser] = await db
      .select(SAFE_USER_COLUMNS)
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!currentUser) {
      throw new NotFoundException('Authenticated user not found');
    }

    return {
      ...currentUser,
      activeOrganizationId: activeOrganizationId ?? null,
    };
  }

  async findAllByOrganization(organizationId: string) {
    return db
      .select({
        ...SAFE_USER_COLUMNS,
        role: member.role,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId))
      .orderBy(desc(user.createdAt));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updatePayload: Partial<typeof user.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Name cannot be empty');
      }
      updatePayload.name = trimmed;
    }

    if (dto.image !== undefined) {
      if (dto.image === null || dto.image === '') {
        updatePayload.image = null;
      } else {
        try {
          const parsed = new URL(dto.image);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new BadRequestException('Avatar URL must use http or https');
          }
          updatePayload.image = parsed.toString();
        } catch {
          throw new BadRequestException('Avatar URL must be a valid URL');
        }
      }
    }

    if (dto.jobTitle !== undefined) {
      const trimmed = dto.jobTitle?.trim();
      updatePayload.jobTitle = trimmed ? trimmed : null;
    }

    if (dto.phone !== undefined) {
      const trimmed = dto.phone?.trim();
      updatePayload.phone = trimmed ? trimmed : null;
    }

    if (dto.defaultDepartment !== undefined) {
      const trimmed = dto.defaultDepartment?.trim();
      updatePayload.defaultDepartment = trimmed || 'Production Floor';
    }

    if (dto.preferredTheme !== undefined) {
      if (dto.preferredTheme !== 'g100' && dto.preferredTheme !== 'white') {
        throw new BadRequestException('preferredTheme must be "g100" or "white"');
      }
      updatePayload.preferredTheme = dto.preferredTheme;
    }

    if (dto.emailNotifications !== undefined) {
      updatePayload.emailNotifications = Boolean(dto.emailNotifications);
    }

    const [updated] = await db
      .update(user)
      .set(updatePayload)
      .where(eq(user.id, userId))
      .returning(SAFE_USER_COLUMNS);

    if (!updated) {
      throw new NotFoundException('Authenticated user not found');
    }

    return updated;
  }
}
