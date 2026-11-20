import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BetterAuthGuard } from '../auth/guards/better-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(BetterAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(
    @CurrentUser('id') userId: string,
    @CurrentTenant() organizationId?: string
  ) {
    return this.usersService.findMe(userId, organizationId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Get()
  @UseGuards(TenantGuard)
  findAll(@CurrentTenant() currentTenant: string) {
    return this.usersService.findAllByOrganization(currentTenant);
  }
}
