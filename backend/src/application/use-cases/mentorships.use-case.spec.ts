import { ForbiddenException } from '@nestjs/common';
import { AuditLoggerPort } from '../ports/audit-log.port';
import { Role } from '../../domains/user/enums/role.enum';
import { UserEntity } from '../../domains/user/entities/user.entity';
import { UserRepositoryPort } from '../../domains/user/repositories/user.repository.port';
import { AcceptMentorshipUseCase } from '../../modules/mentorships/application/use-cases/accept-mentorship/accept-mentorship.use-case';
import { ChangeMentorshipStatusUseCase } from '../../modules/mentorships/application/use-cases/change-mentorship-status/change-mentorship-status.use-case';
import { CreateMentorshipUseCase } from '../../modules/mentorships/application/use-cases/create-mentorship/create-mentorship.use-case';
import { GetMentorshipUseCase } from '../../modules/mentorships/application/use-cases/get-mentorship/get-mentorship.use-case';
import { ListMentorshipsUseCase } from '../../modules/mentorships/application/use-cases/list-mentorships/list-mentorships.use-case';
import { MentorshipEntity, MentorshipStatus } from '../../modules/mentorships/domain/entities/mentorship.entity';
import { MentorshipRepository } from '../../modules/mentorships/domain/repositories/mentorship.repository';

describe('Mentorships use cases', () => {
  const mentorships = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    updateStatus: jest.fn(),
  } satisfies jest.Mocked<MentorshipRepository>;
  const users = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  } satisfies jest.Mocked<UserRepositoryPort>;
  const auditLogger = {
    log: jest.fn(),
  } satisfies jest.Mocked<AuditLoggerPort>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows an entrepreneur to create a mentorship request', async () => {
    const mentor = UserEntity.create({
      id: 'mentor-id',
      name: 'Mentora',
      email: 'mentor@email.com',
      password: 'hashed',
      role: Role.MENTOR,
    });
    users.findById.mockResolvedValue(mentor);
    mentorships.create.mockImplementation(async (mentorship) => mentorship);
    const useCase = new CreateMentorshipUseCase(mentorships, users, auditLogger);

    const mentorship = await useCase.execute({
      entrepreneurId: 'entrepreneur-id',
      entrepreneurRole: Role.ENTREPRENEUR,
      mentorId: mentor.id,
      title: 'Growth',
      description: 'Preciso estruturar crescimento.',
      category: 'Growth',
    });

    expect(mentorship.status).toBe(MentorshipStatus.PENDING);
    expect(mentorship.entrepreneurId).toBe('entrepreneur-id');
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'MENTORSHIP_CREATED',
      userId: 'entrepreneur-id',
      entity: 'Mentorship',
      entityId: mentorship.id,
      afterData: expect.objectContaining({
        mentorId: mentor.id,
        entrepreneurId: 'entrepreneur-id',
      }),
    }));
  });

  it('allows the responsible mentor to accept a mentorship', async () => {
    const mentorship = MentorshipEntity.create({
      id: 'mentorship-id',
      entrepreneurId: 'entrepreneur-id',
      mentorId: 'mentor-id',
      title: 'Growth',
      description: 'Preciso estruturar crescimento.',
      category: 'Growth',
    });
    const acceptedMentorship = MentorshipEntity.create({
      ...mentorship.toPrimitives(),
      status: MentorshipStatus.ACCEPTED,
    });
    mentorships.findById.mockResolvedValue(mentorship);
    mentorships.updateStatus.mockResolvedValue(acceptedMentorship);
    const useCase = new AcceptMentorshipUseCase(
      new ChangeMentorshipStatusUseCase(mentorships, auditLogger, new GetMentorshipUseCase(mentorships)),
    );

    await expect(
      useCase.execute({
        id: mentorship.id,
        userId: 'mentor-id',
        userRole: Role.MENTOR,
      }),
    ).resolves.toMatchObject({ status: MentorshipStatus.ACCEPTED });
    expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'MENTORSHIP_ACCEPTED',
      userId: 'mentor-id',
      entity: 'Mentorship',
      entityId: mentorship.id,
      beforeData: expect.objectContaining({ status: MentorshipStatus.PENDING }),
      afterData: expect.objectContaining({ status: MentorshipStatus.ACCEPTED }),
    }));
  });

  it('prevents a different mentor from accepting a mentorship', async () => {
    mentorships.findById.mockResolvedValue(
      MentorshipEntity.create({
        id: 'mentorship-id',
        entrepreneurId: 'entrepreneur-id',
        mentorId: 'mentor-id',
        title: 'Growth',
        description: 'Preciso estruturar crescimento.',
        category: 'Growth',
      }),
    );
    const useCase = new AcceptMentorshipUseCase(
      new ChangeMentorshipStatusUseCase(mentorships, auditLogger, new GetMentorshipUseCase(mentorships)),
    );

    await expect(
      useCase.execute({
        id: 'mentorship-id',
        userId: 'another-mentor-id',
        userRole: Role.MENTOR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prevents an investor from creating a mentorship request', async () => {
    const useCase = new CreateMentorshipUseCase(mentorships, users, auditLogger);

    await expect(
      useCase.execute({
        entrepreneurId: 'investor-id',
        entrepreneurRole: Role.INVESTOR,
        mentorId: 'mentor-id',
        title: 'Growth',
        description: 'Tentativa sem permissão.',
        category: 'Growth',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admin to list all mentorships', async () => {
    mentorships.findMany.mockResolvedValue([]);
    const useCase = new ListMentorshipsUseCase(mentorships);

    await expect(
      useCase.execute({
        userId: 'admin-id',
        userRole: Role.ADMIN,
      }),
    ).resolves.toEqual([]);
    expect(mentorships.findMany).toHaveBeenCalledWith({
      userId: 'admin-id',
      userRole: Role.ADMIN,
    });
  });
});
