import { NextResponse } from 'next/server';
import { db, users } from '@repo/db';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return NextResponse.json({ success: true, data: allUsers });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Neon database query fallback (Check DATABASE_URL in .env)',
        error: error.message,
        data: [
          {
            id: 1,
            name: 'Demo Admin',
            email: 'admin@cobblerp.internal',
            role: 'superadmin',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      { status: 200 }
    );
  }
}
