import { Module } from '@nestjs/common';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { USER_REPOSITORY } from '../../domains/user/repositories/user.repository.port';
import { AuditLoggerModule } from '../../infrastructure/audit/audit-logger.module';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PersistenceModule } from '../persistence.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthModule } from './jwt-auth.module';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [JwtAuthModule, PersistenceModule, AuditLoggerModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenService,
    RegisterUserUseCase,
    LoginUseCase,
    GoogleLoginUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [JwtAuthModule],
})
export class AuthModule {}
