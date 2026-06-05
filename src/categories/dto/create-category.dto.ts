import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Название категории', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, {
    message: 'Название категории не может превышать 255 символов',
  })
  name: string;

  @ApiPropertyOptional({ description: 'ID родительской категории' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;
}
