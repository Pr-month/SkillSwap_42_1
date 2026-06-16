import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { createAppDataSource } from '../config/database.config';
import { loadEnv } from '../config/env.config';
import { UserRole } from '../users/enums/user-role.enum';
import { UserGender } from '../users/enums/user-gender.enum';
import { User } from '../users/entities/user.entity';
import { usersSeed } from './data/user.seed.data';

function getSeedUserPassword(): string {
  return process.env.SEED_USER_PASSWORD ?? 'user123';
}

export interface SeedUsersResult {
  created: number;
  skipped: number;
}

export async function seedUsers(
  dataSource: DataSource,
  logger: Logger = new Logger('SeedUsers'),
): Promise<SeedUsersResult> {
  const saltRounds = parseInt(process.env.HASH_SALT ?? '10', 10) || 10;
  const userRepository = dataSource.getRepository(User);

  const passwordHash = await bcrypt.hash(getSeedUserPassword(), saltRounds);
  let created = 0;
  let skipped = 0;

  for (const record of usersSeed) {
    const existing = await userRepository.findOne({
      where: { email: record.email },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const user = userRepository.create({
      name: record.name,
      email: record.email,
      about: record.about,
      birthDate: record.birthDate,
      gender: record.gender as UserGender,
      avatar: record.avatar,
      cityId: record.cityId,
      passwordHash,
      role: UserRole.USER,
    } as Partial<User>);

    await userRepository.save(user);
    created++;
  }

  logger.log(
    `User seeding complete: ${created} created, ${skipped} skipped (already exist).`,
  );

  return { created, skipped };
}

export async function runUsersSeed(): Promise<void> {
  loadEnv();

  const dataSource = createAppDataSource();

  try {
    await dataSource.initialize();
    await seedUsers(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  const logger = new Logger('SeedUsersCLI');

  runUsersSeed().catch((error) => {
    logger.error('User seeding failed', error);
    process.exit(1);
  });
}
