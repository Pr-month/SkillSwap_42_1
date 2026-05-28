import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Skill } from './entities/skill.entity';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: number, createSkillDto: CreateSkillDto) {
    const category = await this.categoryRepository.findOneByOrFail({
      id: createSkillDto.categoryId,
    });

    const owner = await this.userRepository.findOneByOrFail({
      id: userId,
    });

    const skill = this.skillsRepository.create({
      title: createSkillDto.title,
      description: createSkillDto.description,
      images: createSkillDto.images || [],
      category: category,
      owner: owner,
    });

    return await this.skillsRepository.save(skill);
  }

  async findAll(paginationDto: PaginationDto) {
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.skillsRepository
      .createQueryBuilder('skill')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && total > 0) {
      throw new NotFoundException('Page not found');
    }

    return { data, page, totalPages };
  }

  async findOne(id: number) {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    await this.skillsRepository.update(id, updateSkillDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.skillsRepository.delete(id);
  }
}
