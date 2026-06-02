import { Startup } from '@prisma/client';
import { StartupEntity } from '../../domain/entities/startup.entity';

export class StartupMapper {
  static toDomain(startup: Startup): StartupEntity {
    return StartupEntity.create({
      id: startup.id,
      founderId: startup.founderId,
      name: startup.name,
      description: startup.description,
      category: startup.category,
      stage: startup.stage,
      website: startup.website,
      linkedin: startup.linkedin,
      instagram: startup.instagram,
      pitch: startup.pitch,
      createdAt: startup.createdAt,
      updatedAt: startup.updatedAt,
    });
  }

  static toPersistence(startup: StartupEntity) {
    return startup.toPrimitives();
  }

  static toResponse(startup: StartupEntity) {
    return startup.toPrimitives();
  }
}
