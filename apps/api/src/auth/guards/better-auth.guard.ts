import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from '@repo/auth';
import { and, db, eq, member } from '@repo/db';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = new Headers();

    // Forward Express request headers to Web standard Headers for Better Auth
    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          headers.append(key, v);
        }
      }
    }

    try {
      const session = await auth.api.getSession({ headers });
      if (!session || !session.user) {
        throw new UnauthorizedException('Authentication required');
      }

      const headerOrgId =
        typeof request.headers['x-organization-id'] === 'string'
          ? request.headers['x-organization-id'].trim()
          : '';

      let activeOrganizationId = session.session.activeOrganizationId || undefined;

      if (headerOrgId && headerOrgId !== activeOrganizationId) {
        const [membership] = await db
          .select({ id: member.id })
          .from(member)
          .where(
            and(
              eq(member.userId, session.user.id),
              eq(member.organizationId, headerOrgId)
            )
          )
          .limit(1);

        if (!membership) {
          throw new ForbiddenException(
            'You do not have access to the requested organization.'
          );
        }
        activeOrganizationId = headerOrgId;
      }

      request.user = session.user;
      request.session = session.session;
      request.activeOrganizationId = activeOrganizationId;

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired authentication session');
    }
  }
}
