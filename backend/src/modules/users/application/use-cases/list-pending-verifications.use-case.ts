import { Inject, Injectable } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import {
  USER_PROFILE_REPOSITORY,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';

@Injectable()
export class ListPendingVerificationsUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly profiles: UserProfileRepository,
  ) {}

  execute(): Promise<UserProfileEntity[]> {
    return this.profiles.listPendingVerifications();
  }
}
