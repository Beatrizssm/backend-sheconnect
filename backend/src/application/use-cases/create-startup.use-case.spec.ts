import { ForbiddenException } from '@nestjs/common';
import { AuditLoggerPort } from '../ports/audit-log.port';
import { Role } from '../../domains/user/enums/role.enum';
import { StartupEntity } from '../../modules/startups/domain/entities/startup.entity';
import { StartupRepository } from '../../modules/startups/domain/repositories/startup.repository';
import { CreateStartupUseCase } from '../../modules/startups/application/use-cases/create-startup/create-startup.use-case';
import { UpdateStartupUseCase } from '../../modules/startups/application/use-cases/update-startup/update-startup.use-case';
import { GetStartupUseCase } from '../../modules/startups/application/use-cases/get-startup/get-startup.use-case';

describe('Startups use cases', () => {
  const startups = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } satisfies jest.Mocked<StartupRepository>;
  const auditLogger = {
    log: jest.fn(),
  } satisfies jest.Mocked<AuditLoggerPort>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a startup for an entrepreneur', async () => {
    startups.create.mockImplementation(async (startup) => startup);
    const useCase = new CreateStartupUseCase(startups, auditLogger);

    const startup = await useCase.execute({
      name: 'TechGirls',
      description: 'Educação tecnológica para mulheres.',
      category: 'Education',
      stage: 'MVP',
      founderId: 'founder-id',
      founderRole: Role.ENTREPRENEUR,
    });

    expect(startup.name).toBe('TechGirls');
    expect(startup.founderId).toBe('founder-id');
    expect(startups.create).toHaveBeenCalledWith(expect.any(StartupEntity));
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'STARTUP_CREATED',
      entity: 'Startup',
      entityId: startup.id,
      userId: 'founder-id',
      afterData: expect.objectContaining({ founderId: 'founder-id' }),
    }));
  });

  it('prevents a mentor from creating a startup', async () => {
    const useCase = new CreateStartupUseCase(startups, auditLogger);

    await expect(
      useCase.execute({
        name: 'Mentor Startup',
        description: 'Tentativa sem permissão.',
        category: 'Mentoria',
        stage: 'Idea',
        founderId: 'mentor-id',
        founderRole: Role.MENTOR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prevents an investor from creating a startup', async () => {
    const useCase = new CreateStartupUseCase(startups, auditLogger);

    await expect(
      useCase.execute({
        name: 'Investor Startup',
        description: 'Tentativa sem permissão.',
        category: 'Investimento',
        stage: 'Idea',
        founderId: 'investor-id',
        founderRole: Role.INVESTOR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prevents an entrepreneur from editing another founder startup', async () => {
    const existingStartup = StartupEntity.create({
      id: 'startup-id',
      founderId: 'founder-id',
      name: 'TechGirls',
      description: 'Educação tecnológica para mulheres.',
      category: 'Education',
      stage: 'MVP',
    });
    startups.findById.mockResolvedValue(existingStartup);
    const useCase = new UpdateStartupUseCase(startups, new GetStartupUseCase(startups), auditLogger);

    await expect(
      useCase.execute({
        id: existingStartup.id,
        userId: 'another-founder-id',
        userRole: Role.ENTREPRENEUR,
        name: 'New name',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admin to edit any startup', async () => {
    const existingStartup = StartupEntity.create({
      id: 'startup-id',
      founderId: 'founder-id',
      name: 'TechGirls',
      description: 'Educação tecnológica para mulheres.',
      category: 'Education',
      stage: 'MVP',
    });
    const updatedStartup = existingStartup.update({ name: 'Updated by admin' });
    startups.findById.mockResolvedValue(existingStartup);
    startups.update.mockResolvedValue(updatedStartup);
    const useCase = new UpdateStartupUseCase(startups, new GetStartupUseCase(startups), auditLogger);

    await expect(
      useCase.execute({
        id: existingStartup.id,
        userId: 'admin-id',
        userRole: Role.ADMIN,
        name: 'Updated by admin',
      }),
    ).resolves.toMatchObject({ name: 'Updated by admin' });
    expect(startups.update).toHaveBeenCalledWith(existingStartup.id, expect.objectContaining({ name: 'Updated by admin' }));
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'STARTUP_UPDATED',
      entity: 'Startup',
      entityId: existingStartup.id,
      beforeData: expect.objectContaining({ name: 'TechGirls' }),
      afterData: expect.objectContaining({ name: 'Updated by admin' }),
    }));
  });
});
