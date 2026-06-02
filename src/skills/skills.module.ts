import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { FilesModule } from 'src/files/files.module';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, Category, User]), FilesModule],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [TypeOrmModule, SkillsService],
})
export class SkillsModule {}
