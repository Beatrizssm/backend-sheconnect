import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { VerificationStatus as PrismaVerificationStatus } from '@prisma/client';
import { Role } from '../../domains/user/enums/role.enum';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: { id: string; role: Role } }>();
    const user = request.user;

    if (!user?.id) {
      return false;
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    const record = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { verificationStatus: true },
    });

    if (record?.verificationStatus === PrismaVerificationStatus.VERIFIED) {
      return true;
    }

    throw new ForbiddenException(
      'Verifique seu perfil para acessar esta funcionalidade. Solicite a verificação em /profile.',
    );
  }
}
