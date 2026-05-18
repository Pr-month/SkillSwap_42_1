import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticatedRequest, RefreshAuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Controller, HttpCode, Post, Req, UseGuards, Body } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RefreshAuthUser } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.sub);
  }
  
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(RefreshTokenGuard)
  refresh(@Req() req: Request & { user: RefreshAuthUser }) {
    return this.authService.refreshSession(req.user);
  }
}
