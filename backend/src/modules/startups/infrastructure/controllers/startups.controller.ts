import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../../../domains/user/enums/role.enum';
import { AuthenticatedUser } from '../../../auth/jwt.strategy';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { JwtGuard } from '../../../auth/jwt.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { CreateStartupUseCase } from '../../application/use-cases/create-startup/create-startup.use-case';
import { DeleteStartupUseCase } from '../../application/use-cases/delete-startup/delete-startup.use-case';
import { GetStartupUseCase } from '../../application/use-cases/get-startup/get-startup.use-case';
import { ListStartupsUseCase } from '../../application/use-cases/list-startups/list-startups.use-case';
import { UpdateStartupUseCase } from '../../application/use-cases/update-startup/update-startup.use-case';
import { CreateStartupDto } from '../dto/create-startup.dto';
import { ListStartupsQueryDto } from '../dto/list-startups-query.dto';
import { UpdateStartupDto } from '../dto/update-startup.dto';
import { StartupMapper } from '../mappers/startup.mapper';

@UseGuards(JwtGuard, RolesGuard)
@Controller('startups')
export class StartupsController {
  constructor(
    private readonly createStartup: CreateStartupUseCase,
    private readonly listStartups: ListStartupsUseCase,
    private readonly getStartup: GetStartupUseCase,
    private readonly updateStartup: UpdateStartupUseCase,
    private readonly deleteStartup: DeleteStartupUseCase,
  ) {}

  @Post()
  @Roles(Role.ENTREPRENEUR)
  async create(@Body() dto: CreateStartupDto, @CurrentUser() user: AuthenticatedUser) {
    const startup = await this.createStartup.execute({
      ...dto,
      founderId: user.id,
      founderRole: user.role,
    });

    return StartupMapper.toResponse(startup);
  }

  @Get()
  async list(@Query() query: ListStartupsQueryDto) {
    const result = await this.listStartups.execute({
      category: query.category,
      stage: query.stage,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.data.map(StartupMapper.toResponse),
      meta: result.meta,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const startup = await this.getStartup.execute(id);
    return StartupMapper.toResponse(startup);
  }

  @Patch(':id')
  @Roles(Role.ENTREPRENEUR, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStartupDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const startup = await this.updateStartup.execute({
      ...dto,
      id,
      userId: user.id,
      userRole: user.role,
    });

    return StartupMapper.toResponse(startup);
  }

  @Delete(':id')
  @Roles(Role.ENTREPRENEUR, Role.ADMIN)
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.deleteStartup.execute({
      id,
      userId: user.id,
      userRole: user.role,
    });

    return { message: 'Startup deleted successfully.' };
  }
}
