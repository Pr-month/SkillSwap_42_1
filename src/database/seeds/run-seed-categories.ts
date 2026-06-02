import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { Category } from '../../categories/entities/category.entity';
import { AppDataSource } from '../data-source';
import { seedCategories } from './seed-categories';

async function run() {
  const logger = new Logger('SeedCategoriesCLI');
  let exitCode = 0;

  try {
    await AppDataSource.initialize();
    const repository = AppDataSource.getRepository(Category);
    await seedCategories(repository, logger);
  } catch (error) {
    logger.error('Categories seed failed', error);
    exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }

  process.exit(exitCode);
}

void run();
