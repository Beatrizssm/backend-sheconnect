import { Mentorship, MentorshipStatus as PrismaMentorshipStatus } from '@prisma/client';
import { MentorshipEntity, MentorshipStatus } from '../../domain/entities/mentorship.entity';

export class MentorshipMapper {
  static toDomain(mentorship: Mentorship): MentorshipEntity {
    return MentorshipEntity.create({
      id: mentorship.id,
      entrepreneurId: mentorship.entrepreneurId,
      mentorId: mentorship.mentorId,
      title: mentorship.title,
      description: mentorship.description,
      category: mentorship.category,
      status: mentorship.status as MentorshipStatus,
      scheduledAt: mentorship.scheduledAt,
      createdAt: mentorship.createdAt,
      updatedAt: mentorship.updatedAt,
    });
  }

  static toPersistence(mentorship: MentorshipEntity) {
    const data = mentorship.toPrimitives();

    return {
      id: data.id,
      entrepreneurId: data.entrepreneurId,
      mentorId: data.mentorId,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status as PrismaMentorshipStatus,
      scheduledAt: data.scheduledAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  static toResponse(mentorship: MentorshipEntity) {
    return mentorship.toPrimitives();
  }
}
