import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be defined.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const password = await bcrypt.hash('Senha123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sheconnect.com' },
    update: {},
    create: {
      name: 'Admin SheConnect',
      email: 'admin@sheconnect.com',
      password,
      role: Role.ADMIN,
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: 'mentora@sheconnect.com' },
    update: {},
    create: {
      name: 'Ana Clara Lima',
      email: 'mentora@sheconnect.com',
      password,
      role: Role.MENTOR,
    },
  });

  const entrepreneur = await prisma.user.upsert({
    where: { email: 'empreendedora@sheconnect.com' },
    update: {},
    create: {
      name: 'Beatriz Souza',
      email: 'empreendedora@sheconnect.com',
      password,
      role: Role.ENTREPRENEUR,
    },
  });

  await prisma.startup.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'TechGirls',
      description: 'Plataforma de educação tecnológica para mulheres.',
      category: 'Education',
      stage: 'MVP',
      website: 'https://techgirls.example.com',
      pitch: 'Educação tecnológica acessível para mulheres em início de carreira.',
      founderId: entrepreneur.id,
    },
  });

  await prisma.mentorship.create({
    data: {
      mentorId: mentor.id,
      entrepreneurId: entrepreneur.id,
      title: 'Estratégia de crescimento',
      description: 'Mentoria para estruturar aquisição de clientes e próximos passos de tração.',
      category: 'Growth',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log({ admin: admin.email, mentor: mentor.email, entrepreneur: entrepreneur.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
