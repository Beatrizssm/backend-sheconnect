import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profiles: UserProfileRepository,
  ) {}

  async execute(userId: string): Promise<UserProfileEntity> {
    const profile = await this.profiles.findById(userId);

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    return profile;
  }
}
