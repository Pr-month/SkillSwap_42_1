import {
  Controller,
  Post,
  HttpCode,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { HTTP_STATUS_CODE } from '../common/constants/http-status-code.constant';
import { AuthService } from './auth.service';
import { AuthenticatedRequest, RefreshAuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HTTP_STATUS_CODE.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HTTP_STATUS_CODE.OK)
  @UseGuards(AccessTokenGuard)
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.sub);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @HttpCode(HTTP_STATUS_CODE.OK)
  @UseGuards(RefreshTokenGuard)
  refresh(@Req() req: Request & { user: RefreshAuthUser }) {
    return this.authService.refreshSession(req.user);
  }
}
