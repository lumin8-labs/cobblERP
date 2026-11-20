import { Module } from '@nestjs/common';
import { BetterAuthGuard } from './guards/better-auth.guard';
import { TenantGuard } from './guards/tenant.guard';

@Module({
  providers: [BetterAuthGuard, TenantGuard],
  exports: [BetterAuthGuard, TenantGuard],
})
export class AuthModule {}
