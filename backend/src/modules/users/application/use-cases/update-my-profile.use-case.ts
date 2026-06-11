import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import {
  USER_PROFILE_REPOSITORY,
  UpdateUserProfileInput,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';
import { sanitizeText } from '../../../../shared/utils/sanitize-text.util';
import { normalizeProfileImage } from '../../infrastructure/utils/profile-image.validator';
import { UpdateProfileDto } from '../../infrastructure/dto/update-profile.dto';

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profiles: UserProfileRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<UserProfileEntity> {
    const existing = await this.profiles.findById(userId);

    if (!existing) {
      throw new NotFoundException('User profile not found.');
    }

    const payload: UpdateUserProfileInput = {
      fullName: sanitizeText(dto.fullName, 120) ?? dto.fullName.trim(),
      professionalName: sanitizeText(dto.professionalName, 120) ?? null,
      bio: sanitizeText(dto.bio, 300) ?? null,
      area: sanitizeText(dto.area, 120) ?? null,
      city: sanitizeText(dto.city, 120) ?? null,
      state: sanitizeText(dto.state, 80) ?? null,
      linkedin: sanitizeText(dto.linkedin, 300) ?? null,
      instagram: sanitizeText(dto.instagram, 120) ?? null,
      website: sanitizeText(dto.website, 300) ?? null,
    };

    if (dto.profileImage !== undefined) {
      try {
        payload.profileImage = normalizeProfileImage(dto.profileImage);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }

        throw new BadRequestException('Não foi possível processar a imagem de perfil.');
      }
    }

    return this.profiles.update(userId, payload);
  }
}
