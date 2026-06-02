import { Logger } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { CategoriesData } from './categories.data';

export interface SeedCategoriesResult {
  created: number;
  skipped: number;
}

export async function seedCategories(
  repository: Repository<Category>,
  logger: Logger = new Logger('SeedCategories'),
): Promise<SeedCategoriesResult> {
  let created = 0;
  let skipped = 0;

  for (const { name, children } of CategoriesData) {
    let parent = await repository.findOne({
      where: { name, parent: IsNull() },
    });

    if (!parent) {
      parent = await repository.save(repository.create({ name, parent: null }));
      created++;
    } else {
      skipped++;
    }

    for (const childName of children) {
      const existingChild = await repository.findOne({
        where: { name: childName, parent: { id: parent.id } },
        relations: ['parent'],
      });

      if (!existingChild) {
        await repository.save(repository.create({ name: childName, parent }));
        created++;
      } else {
        skipped++;
      }
    }
  }

  logger.log(
    `Categories seed completed: ${created} created, ${skipped} skipped`,
  );

  return { created, skipped };
}
