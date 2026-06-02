import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { AppDataSource } from '../config/database.config';
import { UserRole } from '../users/enums/user-role.enum';
import { UserGender } from '../users/enums/user-gender.enum';
import { User } from '../users/entities/user.entity';
import { usersSeed } from './data/user.seed.data';

/**
 * Known plaintext password for all seeded regular users.
 * This allows developers to sign in as any seeded user during
 * local testing by using this password with the user's email.
 */
const SEED_USER_PASSWORD = 'user123';

async function seedUsers(): Promise<void> {
  config();

  const saltRounds = parseInt(process.env.HASH_SALT ?? '10', 10) || 10;

  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, saltRounds);
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

    console.log(
      `User seeding complete: ${created} created, ${skipped} skipped (already exist).`,
    );
  } catch (error) {
    console.error('User seeding failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seedUsers().catch((error) => {
  console.error(error);
  process.exit(1);
});
