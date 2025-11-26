/**
 * Test Database Setup for Property-Based Tests
 * Provides a real Prisma client for integration testing
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Create a singleton Prisma client for tests
let prisma: PrismaClient | null = null;

export function getPrismaTestClient(): PrismaClient {
  if (!prisma) {
    // Use test database URL
    const testDatabaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl
        }
      },
      log: process.env.DEBUG_TESTS ? ['query', 'error', 'warn'] : ['error']
    });
  }
  
  return prisma;
}

export async function setupTestDatabase(): Promise<void> {
  try {
    const client = getPrismaTestClient();
    await client.$connect();
    console.log('✓ Test database connected');
  } catch (error) {
    console.error('✗ Failed to connect to test database:', error);
    throw error;
  }
}

export async function cleanupTestDatabase(): Promise<void> {
  if (prisma) {
    try {
      // Clean up test data in reverse order of dependencies
      // Only clean up models that exist in the Prisma schema
      const cleanupOperations = [];
      
      if (prisma.phaseProgress) cleanupOperations.push(prisma.phaseProgress.deleteMany());
      if (prisma.courseProject) cleanupOperations.push(prisma.courseProject.deleteMany());
      if (prisma.qualityReview) cleanupOperations.push(prisma.qualityReview.deleteMany());
      if (prisma.pilotProgram) cleanupOperations.push(prisma.pilotProgram.deleteMany());
      if (prisma.deploymentPathway) cleanupOperations.push(prisma.deploymentPathway.deleteMany());
      if (prisma.projectConnection) cleanupOperations.push(prisma.projectConnection.deleteMany());
      if (prisma.readinessReport) cleanupOperations.push(prisma.readinessReport.deleteMany());
      if (prisma.portfolioAsset) cleanupOperations.push(prisma.portfolioAsset.deleteMany());
      if (prisma.outcomeData) cleanupOperations.push(prisma.outcomeData.deleteMany());
      
      if (cleanupOperations.length > 0) {
        await prisma.$transaction(cleanupOperations);
      }
      
      await prisma.$disconnect();
      console.log('✓ Test database cleaned up');
    } catch (error) {
      console.error('✗ Failed to cleanup test database:', error);
      // Don't throw - cleanup errors shouldn't fail tests
    }
  }
}

export async function resetTestDatabase(): Promise<void> {
  try {
    // Run migrations on test database
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
      },
      stdio: 'inherit'
    });
    
    console.log('✓ Test database reset complete');
  } catch (error) {
    console.error('✗ Failed to reset test database:', error);
    throw error;
  }
}

// Global setup for all property tests
beforeAll(async () => {
  await setupTestDatabase();
});

// Global cleanup for all property tests
afterAll(async () => {
  await cleanupTestDatabase();
});

export { prisma };
