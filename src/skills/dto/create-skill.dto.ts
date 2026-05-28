import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'Название навыка не может быть пустым' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Описание навыка не может быть пустым' })
  description: string;

  @IsNumber({}, { message: 'ID категории должно быть числом' })
  @IsNotEmpty({ message: 'Категория обязательна' })
  categoryId: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
