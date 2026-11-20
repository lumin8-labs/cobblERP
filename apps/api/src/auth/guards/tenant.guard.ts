import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const activeOrganizationId =
      request.activeOrganizationId || request.session?.activeOrganizationId;

    if (!activeOrganizationId) {
      throw new ForbiddenException(
        'No active organization (tenant) selected. Please select or switch to an organization context.'
      );
    }

    return true;
  }
}
