import {
  Controller,
  Post,
  HttpCode,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticatedRequest, RefreshAuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { HTTP_STATUS_CODE } from '../common/constants/http-status-code.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../files/image-upload.options';
import {
  ApiAuthLogin,
  ApiAuthLogout,
  ApiAuthRegister,
  ApiAuthRefresh,
} from './auth.swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HTTP_STATUS_CODE.OK)
  @ApiAuthLogin()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HTTP_STATUS_CODE.OK)
  @UseGuards(AccessTokenGuard)
  @ApiAuthLogout()
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.sub);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar', imageUploadOptions))
  @ApiAuthRegister()
  register(
    @Body() dto: RegisterDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.authService.register(dto, avatar);
  }

  @Post('refresh')
  @HttpCode(HTTP_STATUS_CODE.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiAuthRefresh()
  refresh(@Req() req: Request & { user: RefreshAuthUser }) {
    return this.authService.refreshSession(req.user);
  }
}
