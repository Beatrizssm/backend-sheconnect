import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../../../domains/user/enums/role.enum';
import { AuthenticatedUser } from '../../../auth/jwt.strategy';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { JwtGuard } from '../../../auth/jwt.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { DashboardMetricsService } from '../../application/services/dashboard-metrics.service';
import { MetricsQueryDto } from '../dto/metrics-query.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MENTOR)
@Controller('metrics')
export class EnterpriseMetricsController {
  constructor(private readonly dashboardMetrics: DashboardMetricsService) {}

  @Get('dashboard')
  dashboard(@Query() _query: MetricsQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.dashboardMetrics.getDashboard(user.id);
  }
}
