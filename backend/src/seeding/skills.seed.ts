import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { createAppDataSource } from '../config/database.config';
import { loadEnv } from '../config/env.config';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { skillsSeed } from './data/skills.seed.data';

export interface SeedSkillsResult {
  created: number;
  skipped: number;
}

export async function seedSkills(
  dataSource: DataSource,
  logger: Logger = new Logger('SeedSkills'),
): Promise<SeedSkillsResult> {
  const skillRepository = dataSource.getRepository(Skill);
  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);

  let created = 0;
  let skipped = 0;

  for (const record of skillsSeed) {
    const owner = await userRepository.findOne({
      where: { email: record.ownerEmail },
    });

    if (!owner) {
      throw new Error(
        `Cannot seed skill "${record.title}": owner "${record.ownerEmail}" was not found.`,
      );
    }

    const category = await categoryRepository.findOne({
      where: { name: record.categoryName },
    });

    if (!category) {
      throw new Error(
        `Cannot seed skill "${record.title}": category "${record.categoryName}" was not found.`,
      );
    }

    const existing = await skillRepository.findOne({
      where: {
        title: record.title,
        owner: { id: owner.id },
      },
      relations: ['owner'],
    });

    if (existing) {
      skipped++;
      continue;
    }

    const skill = skillRepository.create({
      title: record.title,
      description: record.description,
      images: record.images,
      category,
      owner,
    });

    await skillRepository.save(skill);
    created++;
  }

  logger.log(
    `Skill seeding complete: ${created} created, ${skipped} skipped (already exist).`,
  );

  return { created, skipped };
}

export async function runSkillsSeed(): Promise<void> {
  loadEnv();

  const dataSource = createAppDataSource();

  try {
    await dataSource.initialize();
    await seedSkills(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  const logger = new Logger('SeedSkillsCLI');

  runSkillsSeed().catch((error) => {
    logger.error('Skill seeding failed', error);
    process.exit(1);
  });
}
