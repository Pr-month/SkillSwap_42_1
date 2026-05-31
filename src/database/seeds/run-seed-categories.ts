import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { Category } from '../../categories/entities/category.entity';
import { AppDataSource } from '../data-source';
import { seedCategories } from './seed-categories';

async function run() {
  const logger = new Logger('SeedCategoriesCLI');

  try {
    await AppDataSource.initialize();
    const repository = AppDataSource.getRepository(Category);
    await seedCategories(repository, logger);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error('Categories seed failed', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

void run();
