import { prisma } from '../src/prisma';

async function main() {
  const existing = await prisma.admin.findFirst();
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  await prisma.admin.create({
    data: {
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash: process.env.ADMIN_PASSWORD_HASH!,
    },
  });

  console.log('Admin created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
