import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [TypeOrmModule.forFeature([Request]), SkillsModule],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [TypeOrmModule, RequestsService],
})
export class RequestsModule {}
