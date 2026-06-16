import { Logger } from '@nestjs/common';
import { Category } from '../categories/entities/category.entity';
import { createAppDataSource } from '../config/database.config';
import { loadEnv } from '../config/env.config';
import { seedCategories } from './seed-categories';

export async function runCategoriesSeed(): Promise<void> {
  loadEnv();

  const logger = new Logger('SeedCategoriesCLI');
  const dataSource = createAppDataSource();

  try {
    await dataSource.initialize();
    const repository = dataSource.getRepository(Category);
    await seedCategories(repository, logger);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  runCategoriesSeed().catch((error) => {
    const logger = new Logger('SeedCategoriesCLI');
    logger.error('Categories seed failed', error);
    process.exit(1);
  });
}
