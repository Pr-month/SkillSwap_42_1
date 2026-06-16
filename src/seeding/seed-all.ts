import { Logger } from '@nestjs/common';
import { Category } from '../categories/entities/category.entity';
import { createAppDataSource } from '../config/database.config';
import { loadEnv } from '../config/env.config';
import { seedAdmin } from './admin.seed';
import { seedCategories } from './seed-categories';
import { seedSkills } from './skills.seed';
import { seedUsers } from './user.seed';

function assertSafeTestDatabase(): void {
  const databaseName = process.env.POSTGRES_DB ?? '';

  if (process.env.NODE_ENV === 'test' && !databaseName.includes('test')) {
    throw new Error(
      `Refusing to run test seed against non-test database "${databaseName}".`,
    );
  }
}

export async function seedAll(): Promise<void> {
  loadEnv();
  assertSafeTestDatabase();

  const dataSource = createAppDataSource();

  try {
    await dataSource.initialize();

    await seedCategories(dataSource.getRepository(Category));
    await seedAdmin(dataSource);
    await seedUsers(dataSource);
    await seedSkills(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  const logger = new Logger('SeedAllCLI');

  seedAll().catch((error) => {
    logger.error('Seed chain failed', error);
    process.exit(1);
  });
}
