import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { createAppDataSource } from '../config/database.config';
import { loadEnv } from '../config/env.config';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { getAdminSeedConfig } from './config/admin.seed.config';

export interface SeedAdminResult {
  created: number;
  skipped: number;
}

export async function seedAdmin(
  dataSource: DataSource,
  logger: Logger = new Logger('SeedAdmin'),
): Promise<SeedAdminResult> {
  const adminConfig = getAdminSeedConfig();
  const saltRounds = parseInt(process.env.HASH_SALT ?? '10', 10) || 10;
  const userRepository = dataSource.getRepository(User);

  const existing = await userRepository.findOne({
    where: { email: adminConfig.email },
  });

  if (existing) {
    logger.log(
      `Admin user with email "${adminConfig.email}" already exists, skipping.`,
    );
    return { created: 0, skipped: 1 };
  }

  const passwordHash = await bcrypt.hash(adminConfig.password, saltRounds);

  const admin = userRepository.create({
    name: 'Admin',
    email: adminConfig.email,
    passwordHash,
    role: UserRole.ADMIN,
  });

  await userRepository.save(admin);
  logger.log(
    `Admin user created: ${adminConfig.email} (role: ${UserRole.ADMIN})`,
  );

  return { created: 1, skipped: 0 };
}

export async function runAdminSeed(): Promise<void> {
  loadEnv();

  const dataSource = createAppDataSource();

  try {
    await dataSource.initialize();
    await seedAdmin(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  const logger = new Logger('SeedAdminCLI');

  runAdminSeed().catch((error) => {
    logger.error('Admin seeding failed', error);
    process.exit(1);
  });
}
