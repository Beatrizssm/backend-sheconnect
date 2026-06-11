import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../../../../../domains/user/enums/role.enum';
import { PrismaService } from '../../../../../infrastructure/prisma/prisma.service';
import { StartupMapper } from '../../../infrastructure/mappers/startup.mapper';

type ListFavoriteStartupsInput = {
  userId: string;
  userRole: Role;
};

@Injectable()
export class ListFavoriteStartupsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: ListFavoriteStartupsInput) {
    if (input.userRole !== Role.INVESTOR && input.userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only investors can list favorite startups.');
    }

    const favorites = await this.prisma.startupFavorite.findMany({
      where: { userId: input.userId },
      include: { startup: true },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((favorite: (typeof favorites)[number]) => ({
      ...StartupMapper.toResponse(StartupMapper.toDomain(favorite.startup)),
      favoritedAt: favorite.createdAt,
    }));
  }
}
