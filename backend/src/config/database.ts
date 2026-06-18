import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database Connected via Prisma');
  } catch (error) {
    console.error('❌ PostgreSQL Database connection error:', error);
    // Render/Node standard failure exit
    process.exit(1);
  }
};
