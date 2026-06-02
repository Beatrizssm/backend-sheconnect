import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../domains/user/enums/role.enum';
import { JwtGuard } from '../../modules/auth/jwt.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { AuditLogQueryService } from './audit-log-query.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogs: AuditLogQueryService) {}

  @Get()
  list(@Query() query: ListAuditLogsQueryDto) {
    return this.auditLogs.findMany({
      action: query.action,
      entity: query.entity,
      userId: query.userId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.auditLogs.findById(id);
  }
}
