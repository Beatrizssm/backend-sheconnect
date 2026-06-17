import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { JwtStrategy } from './jwt.strategy';
import { VerifiedUserGuard } from './verified-user.guard';

@Module({
  imports: [
    DatabaseModule,
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
  ],
  providers: [JwtStrategy, VerifiedUserGuard],
  exports: [JwtStrategy, VerifiedUserGuard, PassportModule, JwtModule],
})
export class JwtAuthModule {}
