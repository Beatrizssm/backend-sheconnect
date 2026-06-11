import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GoogleLoginDto, LoginDto, RefreshTokenDto, RegisterUserDto } from '../../shared/dto/auth.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtGuard } from './jwt.guard';

type JwtUser = {
  id: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('google')
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.id);
  }
}
