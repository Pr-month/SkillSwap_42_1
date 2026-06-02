export function getAdminSeedConfig() {
  return {
    email: process.env.ADMIN_EMAIL ?? 'admin@skillswap.ru',
    password: process.env.ADMIN_PASSWORD ?? 'admin123',
  };
}
