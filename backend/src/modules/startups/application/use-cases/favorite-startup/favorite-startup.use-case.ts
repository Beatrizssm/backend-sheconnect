import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';

type FavoriteStartupInput = {
  userId: string;
  userRole: Role;
  startupId: string;
};

@Injectable()
export class FavoriteStartupUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: FavoriteStartupInput): Promise<{ message: string }> {
    if (input.userRole !== Role.INVESTOR && input.userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only investors can favorite startups.');
    }

    const startup = await this.prisma.startup.findUnique({ where: { id: input.startupId } });

    if (!startup) {
      throw new NotFoundException('Startup not found.');
    }

    await this.prisma.startupFavorite.upsert({
      where: {
        userId_startupId: {
          userId: input.userId,
          startupId: input.startupId,
        },
      },
      create: {
        userId: input.userId,
        startupId: input.startupId,
      },
      update: {},
    });

    return { message: 'Startup favorited successfully.' };
  }
}
