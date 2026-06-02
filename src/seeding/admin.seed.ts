import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { AppDataSource } from '../config/database.config';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { getAdminSeedConfig } from './config/admin.seed.config';

async function seedAdmin(): Promise<void> {
  config();

  const adminConfig = getAdminSeedConfig();
  const saltRounds = parseInt(process.env.HASH_SALT ?? '10', 10) || 10;

  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    const existing = await userRepository.findOne({
      where: { email: adminConfig.email },
    });

    if (existing) {
      console.log(
        `Admin user with email "${adminConfig.email}" already exists, skipping.`,
      );
      return;
    }

    const passwordHash = await bcrypt.hash(adminConfig.password, saltRounds);

    const admin = userRepository.create({
      name: 'Admin',
      email: adminConfig.email,
      passwordHash,
      role: UserRole.ADMIN,
    });

    await userRepository.save(admin);
    console.log(
      `Admin user created: ${adminConfig.email} (role: ${UserRole.ADMIN})`,
    );
  } catch (error) {
    console.error('Admin seeding failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
