import { IsNumber } from 'class-validator';

export class CreateRequestDto {
  @IsNumber()
  offeredSkillId: number;

  @IsNumber()
  requestedSkillId: number;
}
