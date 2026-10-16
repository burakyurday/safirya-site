import { PrismaClient } from '@prisma/client';

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.surzgnggpubyiiqwuxvu:bimjys-Rawpu6-ryrhuf!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const DEFAULT_DIRECT_URL =
  process.env.DIRECT_URL ||
  'postgresql://postgres.surzgnggpubyiiqwuxvu:bimjys-Rawpu6-ryrhuf!@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = DEFAULT_DIRECT_URL;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

