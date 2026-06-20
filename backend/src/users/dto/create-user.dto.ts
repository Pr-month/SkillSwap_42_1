import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender } from '../enums/user-gender.enum';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'Имя пользователя' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Email пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Пароль', minLength: 6, maxLength: 255 })
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @ApiPropertyOptional({ description: 'О себе' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  about?: string;

  @ApiPropertyOptional({ description: 'Дата рождения (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Пол', enum: UserGender })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @ApiPropertyOptional({ description: 'URL аватара' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional({ description: 'ID города' })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiPropertyOptional({ description: 'Роль пользователя', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
