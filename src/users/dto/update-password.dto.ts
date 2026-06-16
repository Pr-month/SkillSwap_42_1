import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Текущий пароль', minLength: 6, maxLength: 255 })
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  oldPassword: string;

  @ApiProperty({ description: 'Новый пароль', minLength: 6, maxLength: 255 })
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  newPassword: string;
}
