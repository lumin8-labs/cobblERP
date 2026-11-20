import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { db, desc, eq, member, user } from '@repo/db';

const PUBLIC_USER_SELECT = {
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  image: user.image,
  jobTitle: user.jobTitle,
  defaultDepartment: user.defaultDepartment,
  createdAt: user.createdAt,
};

export async function GET() {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const activeOrganizationId = session.session.activeOrganizationId;

    if (activeOrganizationId) {
      const orgMembers = await db
        .select({
          ...PUBLIC_USER_SELECT,
          role: member.role,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(eq(member.organizationId, activeOrganizationId))
        .orderBy(desc(user.createdAt));

      return NextResponse.json({
        success: true,
        scope: 'organization',
        organizationId: activeOrganizationId,
        data: orgMembers,
      });
    }

    const [currentUser] = await db
      .select(PUBLIC_USER_SELECT)
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      scope: 'self',
      organizationId: null,
      data: currentUser ? [currentUser] : [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
