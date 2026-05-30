import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Skill]), FilesModule],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [TypeOrmModule, SkillsService],
})
export class SkillsModule {}
