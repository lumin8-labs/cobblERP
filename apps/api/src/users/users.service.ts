import { Injectable, Logger } from '@nestjs/common';
import { db, users } from '@repo/db';
import { desc } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findAll() {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error: any) {
      this.logger.warn(`Could not fetch users from Neon DB: ${error.message}`);
      return [
        {
          id: 0,
          name: 'Demo User (Database not yet connected)',
          email: 'demo@example.com',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
          note: 'Configure DATABASE_URL in .env with your Neon connection string to query live data.',
        },
      ];
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          name: createUserDto.name,
          email: createUserDto.email,
          role: createUserDto.role || 'user',
        })
        .returning();
      return newUser;
    } catch (error: any) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }
}
