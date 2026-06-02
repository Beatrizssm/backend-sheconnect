import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '../../domains/user/enums/role.enum';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtGuard } from '../../modules/auth/jwt.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('metrics')
export class MetricsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  async users() {
    return { total: await this.prisma.user.count() };
  }

  @Get('startups')
  async startups() {
    return { total: await this.prisma.startup.count() };
  }

  @Get('mentorships')
  async mentorships() {
    return { total: await this.prisma.mentorship.count() };
  }
}
