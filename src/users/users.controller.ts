import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import {
  ApiFindMe,
  ApiUpdateMe,
  ApiUpdatePassword,
  ApiGetAllUsers,
  ApiGetUserById,
  ApiUpdateUserById,
  ApiDeleteUserById,
} from './users.swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiFindMe()
  async findMe(@Req() req: AuthenticatedRequest) {
    return await this.usersService.findMe(req.user.sub);
  }

  @Patch('me')
  @UseGuards(AccessTokenGuard)
  @ApiUpdateMe()
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  @Patch('me/password')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUpdatePassword()
  async updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(
      req.user.sub,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword,
    );
    return { message: 'Password updated successfully' };
  }

  @Get()
  @ApiGetAllUsers()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiGetUserById()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiUpdateUserById()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiDeleteUserById()
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
