import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserGender } from '../enums/user-gender.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Имя пользователя' })
  name?: string;

  @ApiPropertyOptional({ description: 'Email пользователя' })
  email?: string;

  @ApiPropertyOptional({ description: 'О себе' })
  about?: string;

  @ApiPropertyOptional({ description: 'Дата рождения' })
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Пол', enum: UserGender })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @ApiPropertyOptional({ description: 'URL аватара' })
  avatar?: string;

  @ApiPropertyOptional({ description: 'ID города' })
  cityId?: number;
}
