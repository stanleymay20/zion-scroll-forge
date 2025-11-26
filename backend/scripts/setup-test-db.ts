#!/usr/bin/env ts-node
/**
 * Setup Test Database
 * Creates and migrates the test database for property-based tests
 */

import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../.env.test') });

async function setupTestDatabase() {
  console.log('🔧 Setting up test database...\n');
  
  try {
    // Step 1: Create test database if it doesn't exist
    console.log('1. Creating test database (if needed)...');
    try {
      execSync('createdb scrolluniversity_test', {
        stdio: 'inherit',
        env: process.env
      });
      console.log('✓ Test database created\n');
    } catch (error) {
      // Database might already exist, that's okay
      console.log('✓ Test database already exists\n');
    }
    
    // Step 2: Run migrations
    console.log('2. Running database migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL
      }
    });
    console.log('✓ Migrations complete\n');
    
    // Step 3: Generate Prisma client
    console.log('3. Generating Prisma client...');
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: process.env
    });
    console.log('✓ Prisma client generated\n');
    
    console.log('✅ Test database setup complete!');
    console.log('\nYou can now run property-based tests with:');
    console.log('  npm run test:property\n');
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    process.exit(1);
  }
}

setupTestDatabase();
