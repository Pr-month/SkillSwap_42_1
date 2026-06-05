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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthenticatedRequest, RefreshAuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { HTTP_STATUS_CODE } from '../common/constants/http-status-code.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../files/image-upload.options';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HTTP_STATUS_CODE.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HTTP_STATUS_CODE.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.sub);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar', imageUploadOptions))
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterDto })
  register(
    @Body() dto: RegisterDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.authService.register(dto, avatar);
  }

  @Post('refresh')
  @HttpCode(HTTP_STATUS_CODE.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({ status: 200, description: 'New tokens issued' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refresh(@Req() req: Request & { user: RefreshAuthUser }) {
    return this.authService.refreshSession(req.user);
  }
}
