import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const plan = await prisma.plan.upsert({
    where: { id: 'plano-basico' },
    update: {},
    create: {
      id: 'plano-basico',
      name: 'Plano Mensal',
      description: 'Acesso mensal ao conteúdo.',
      amount: 49.9,
      durationDays: 30,
      active: true,
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'troque-esta-senha';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Administrador',
    },
  });

  console.log('Seed ok. Plano:', plan.name, '| Admin:', adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());