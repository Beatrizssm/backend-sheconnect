import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';

type UnfavoriteStartupInput = {
  userId: string;
  userRole: Role;
  startupId: string;
};

@Injectable()
export class UnfavoriteStartupUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: UnfavoriteStartupInput): Promise<{ message: string }> {
    if (input.userRole !== Role.INVESTOR && input.userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only investors can manage favorite startups.');
    }

    await this.prisma.startupFavorite.deleteMany({
      where: {
        userId: input.userId,
        startupId: input.startupId,
      },
    });

    return { message: 'Startup removed from favorites.' };
  }
}
