import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { UserEntity } from '../../domains/user/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domains/user/repositories/user.repository.port';
import { GoogleLoginDto, LoginDto, RegisterUserDto } from '../../shared/dto/auth.dto';
import { RefreshTokenService } from './refresh-token.service';

export type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserEntity['role'];
  createdAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly refreshTokenService: RefreshTokenService,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async register(dto: RegisterUserDto): Promise<AuthUserResponse> {
    const user = await this.registerUserUseCase.execute(dto);
    return this.toResponse(user);
  }

  async login(
    dto: LoginDto,
    context?: { ip?: string; userAgent?: string },
  ): Promise<{ accessToken: string; refreshToken: string; user: AuthUserResponse }> {
    const result = await this.loginUseCase.execute(dto);
    const refreshToken = await this.refreshTokenService.createSession({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      ip: context?.ip,
      userAgent: context?.userAgent,
    });

    return { ...result, refreshToken };
  }

  googleLogin(dto: GoogleLoginDto): Promise<{ accessToken: string; user: AuthUserResponse }> {
    return this.googleLoginUseCase.execute(dto);
  }

  refresh(refreshToken: string) {
    return this.refreshTokenService.refresh(refreshToken);
  }

  async me(userId: string): Promise<AuthUserResponse> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new NotFoundException('Authenticated user was not found.');
    }

    return this.toResponse(user);
  }

  private toResponse(user: UserEntity): AuthUserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
