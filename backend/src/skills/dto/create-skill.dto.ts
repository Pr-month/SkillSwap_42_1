import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ description: 'Название навыка' })
  @IsString()
  @IsNotEmpty({ message: 'Название навыка не может быть пустым' })
  title: string;

  @ApiProperty({ description: 'Описание навыка' })
  @IsString()
  @IsNotEmpty({ message: 'Описание навыка не может быть пустым' })
  description: string;

  @ApiProperty({ description: 'ID категории' })
  @IsNumber({}, { message: 'ID категории должно быть числом' })
  @IsNotEmpty({ message: 'Категория обязательна' })
  categoryId: number;

  @ApiPropertyOptional({ description: 'Список URL изображений' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
