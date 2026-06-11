import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms';
import { Role } from '../../domains/user/enums/role.enum';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthUserResponse } from './auth.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(input: { userId: string; email: string; role: string; ip?: string; userAgent?: string }) {
    const refreshToken = await this.jwtService.signAsync(
      { sub: input.userId, email: input.email, role: input.role, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', this.configService.getOrThrow<string>('JWT_SECRET')),
        expiresIn: this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.userSession.create({
      data: {
        userId: input.userId,
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        ip: input.ip,
        userAgent: input.userAgent,
        expiresAt,
      },
    });

    return refreshToken;
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: AuthUserResponse }> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    const session = await this.findMatchingSession(sessions, refreshToken);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const nextRefreshToken = await this.createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role,
        createdAt: user.createdAt,
      },
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<{ sub: string; email: string; role: string }> {
    try {
      return await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', this.configService.getOrThrow<string>('JWT_SECRET')),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private async findMatchingSession<T extends { refreshTokenHash: string }>(sessions: T[], refreshToken: string): Promise<T | null> {
    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refreshTokenHash)) {
        return session;
      }
    }

    return null;
  }
}
