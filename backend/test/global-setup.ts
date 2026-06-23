import { seedAll } from '../src/seeding/seed-all';

export default async function globalSetup(): Promise<void> {
  await seedAll();
}
