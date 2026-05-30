import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Skill } from './entities/skill.entity';
import { FilesService } from 'src/files/files.service';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly filesService: FilesService,
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

  async update(id: number, userId: number, updateSkillDto: UpdateSkillDto) {
    const skill = await this.skillsRepository.findOneOrFail({
      where: { id },
      relations: ['owner'],
    });
    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Вы можете обновлять только свои навыки');
    }

    const newImages = updateSkillDto.images;
    if (newImages) {
      const urlsToDelete = skill.images.filter(
        (oldUrl) => !newImages.includes(oldUrl),
      );
      if (urlsToDelete.length > 0) {
        await Promise.all(
          urlsToDelete.map((url) => this.filesService.deleteFile(url)),
        );
      }
    }

    const updatedSkill = this.skillsRepository.merge(skill, updateSkillDto);
    return await this.skillsRepository.save(updatedSkill);
  }

  async remove(id: number, userId: number) {
    const skill = await this.skillsRepository.findOneOrFail({
      where: { id },
      relations: ['owner'],
    });
    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои навыки');
    }
    if (skill.images.length) {
      await Promise.all(
        skill.images.map((url) => this.filesService.deleteFile(url)),
      );
    }
    await this.skillsRepository.delete(id);
  }

  async addFavorite(id: number, userId: number) {
    const skill = await this.skillsRepository.findOneOrFail({
      where: { id },
    });

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    const isAlreadyFavorite = user.favoriteSkills.some((s) => s.id === id);
    if (!isAlreadyFavorite) {
      user.favoriteSkills.push(skill);
      await this.userRepository.save(user);
    }
    return { success: true };
  }

  async removeFavorite(id: number, userId: number) {
    await this.skillsRepository.findOneOrFail({
      where: { id },
    });

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    user.favoriteSkills = user.favoriteSkills.filter((s) => s.id !== id);
    await this.userRepository.save(user);
    return { success: true };
  }
}
