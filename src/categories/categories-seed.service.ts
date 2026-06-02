import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { seedCategories } from '../database/seeds/seed-categories';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesSeedService implements OnModuleInit {
  private readonly logger = new Logger(CategoriesSeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    await seedCategories(this.categoriesRepository, this.logger);
  }
}
