import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

export interface ICategoryTree {
  id: number;
  name: string;
  children: ICategoryTree[];
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { parentId, ...categoryDto } = createCategoryDto;
    const category = this.categoriesRepository.create(categoryDto);

    if (parentId !== undefined && parentId !== null) {
      category.parent = await this.findOne(parentId);
    } else {
      category.parent = null;
    }

    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<ICategoryTree[]> {
    const allCategories = await this.categoriesRepository.find({
      relations: ['parent'],
    });

    const categoryMap = new Map<number, ICategoryTree>();
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        children: [],
      });
    });

    const rootCategories: ICategoryTree[] = [];

    for (const cat of allCategories) {
      const mappedCat = categoryMap.get(cat.id);
      if (!mappedCat) continue;

      if (!cat.parent) {
        rootCategories.push(mappedCat);
      } else {
        const parentId = cat.parent.id;
        const parent = categoryMap.get(parentId);

        if (parent) {
          parent.children.push(mappedCat);
        }
      }
    }

    return rootCategories;
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    const { parentId, ...updateDto } = updateCategoryDto;
    Object.assign(category, updateDto);

    if (parentId !== undefined) {
      const newParentId = parentId;

      if (newParentId === id) {
        throw new BadRequestException(
          'Категория не может быть родителем самой себе',
        );
      }

      if (newParentId === null) {
        category.parent = null;
      } else {
        const newParent = await this.findOne(newParentId);
        let currentParent: Category | null = newParent;

        while (currentParent !== null) {
          if (currentParent.id === id) {
            throw new BadRequestException(
              'Невозможно назначить родителя: это действие создаст циклическую зависимость',
            );
          }

          if (currentParent.parent) {
            currentParent = currentParent.parent;
          } else {
            const fetchedParent = await this.categoriesRepository.findOne({
              where: { id: currentParent.id },
              relations: ['parent'],
            });
            currentParent = fetchedParent ? fetchedParent.parent : null;
          }
        }

        category.parent = newParent;
      }
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: number) {
    const result = await this.categoriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Category not found');
    }
  }
}
