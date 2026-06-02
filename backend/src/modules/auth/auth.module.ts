import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { USER_REPOSITORY } from '../../domains/user/repositories/user.repository.port';
import { AuditModule } from '../../infrastructure/audit/audit.module';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PersistenceModule } from '../persistence.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
    PersistenceModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegisterUserUseCase,
    LoginUseCase,
    GoogleLoginUseCase,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AuthModule {}
