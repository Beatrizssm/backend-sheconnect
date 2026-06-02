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
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async register(dto: RegisterUserDto): Promise<AuthUserResponse> {
    const user = await this.registerUserUseCase.execute(dto);
    return this.toResponse(user);
  }

  login(dto: LoginDto): Promise<{ accessToken: string; user: AuthUserResponse }> {
    return this.loginUseCase.execute(dto);
  }

  googleLogin(dto: GoogleLoginDto): Promise<{ accessToken: string; user: AuthUserResponse }> {
    return this.googleLoginUseCase.execute(dto);
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
