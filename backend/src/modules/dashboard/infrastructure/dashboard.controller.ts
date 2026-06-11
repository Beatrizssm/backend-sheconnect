import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '../../../domains/user/enums/role.enum';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/jwt.strategy';
import { JwtGuard } from '../../auth/jwt.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { GetAdminDashboardUseCase } from '../application/use-cases/get-admin-dashboard.use-case';

@UseGuards(JwtGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getAdminDashboard: GetAdminDashboardUseCase) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  getAdmin(@CurrentUser() _user: AuthenticatedUser) {
    return this.getAdminDashboard.execute();
  }
}
