import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ description: 'ID предлагаемого навыка', example: 1 })
  @IsNumber()
  offeredSkillId: number;

  @ApiProperty({ description: 'ID запрашиваемого навыка', example: 2 })
  @IsNumber()
  requestedSkillId: number;
}
