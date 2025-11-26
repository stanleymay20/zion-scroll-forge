/**
 * Database Connection Checker
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnection(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✓ Database connection successful');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

checkConnection();
