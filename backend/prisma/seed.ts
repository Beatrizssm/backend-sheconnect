import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { runEnterpriseSeed } from '../src/infrastructure/database/seeds/enterprise-seed';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be defined.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

runEnterpriseSeed(prisma)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
