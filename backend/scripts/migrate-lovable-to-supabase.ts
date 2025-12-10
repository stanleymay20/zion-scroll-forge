/**
 * Lovable Cloud to Supabase Migration Script
 * "The Lord will guide you always" - Isaiah 58:11
 * 
 * Migrates all data from Lovable Cloud database to Supabase Cloud
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

interface MigrationStats {
  table: string;
  recordsExported: number;
  recordsImported: number;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

interface PrismaRecord {
  [key: string]: unknown;
}

class LovableToSupabaseMigration {
  private sourcePrisma: PrismaClient;
  private targetPrisma: PrismaClient;
  private stats: MigrationStats[] = [];
  private exportDir: string;

  constructor() {
    // Validate required environment variables
    if (!process.env.SUPABASE_DATABASE_URL) {
      throw new Error('SUPABASE_DATABASE_URL environment variable is required');
    }

    const sourceDatabaseUrl = process.env.LOVABLE_DATABASE_URL || process.env.DATABASE_URL;
    if (!sourceDatabaseUrl) {
      throw new Error('LOVABLE_DATABASE_URL or DATABASE_URL environment variable is required');
    }

    // Source: Lovable Cloud connection
    this.sourcePrisma = new PrismaClient({
      datasources: {
        db: {
          url: sourceDatabaseUrl
        }
      }
    });

    // Target: Supabase Cloud connection
    this.targetPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.SUPABASE_DATABASE_URL
        }
      }
    });

    this.exportDir = path.join(__dirname, '../../data/migration-export');
  }

  /**
   * Main migration workflow
   */
  async migrate(): Promise<void> {
    console.log('🚀 Starting Lovable Cloud → Supabase Migration');
    console.log('='.repeat(60));
    console.log('');

    try {
      // Step 1: Verify connections
      await this.verifyConnections();

      // Step 2: Create export directory
      await this.createExportDirectory();

      // Step 3: Export data from Lovable Cloud
      await this.exportData();

      // Step 4: Import data to Supabase
      await this.importData();

      // Step 5: Verify migration
      await this.verifyMigration();

      // Step 6: Print summary
      this.printSummary();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Migration failed:', errorMessage);
      throw error;
    } finally {
      await this.sourcePrisma.$disconnect();
      await this.targetPrisma.$disconnect();
    }
  }

  /**
   * Verify database connections
   */
  private async verifyConnections(): Promise<void> {
    console.log('🔍 Verifying database connections...');

    try {
      // Test source connection
      await this.sourcePrisma.$queryRaw`SELECT 1`;
      console.log('  ✅ Source (Lovable Cloud) connection successful');

      // Test target connection
      await this.targetPrisma.$queryRaw`SELECT 1`;
      console.log('  ✅ Target (Supabase) connection successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('  ❌ Connection verification failed:', errorMessage);
      throw error;
    }

    console.log('');
  }

  /**
   * Create export directory
   */
  private createExportDirectory(): void {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
    console.log(`📁 Export directory: ${this.exportDir}`);
    console.log('');
  }

  /**
   * Export data from Lovable Cloud
   */
  private async exportData(): Promise<void> {
    console.log('📤 Exporting data from Lovable Cloud...');
    console.log('');

    // Define Prisma model names in dependency order (important for foreign keys)
    // Note: These are Prisma model names, not database table names
    const models = [
      'user',
      'userProfile',
      'course',
      'courseModule',
      'lecture',
      'enrollment',
      'assignment',
      'submission',
      'payment',
      'scrollGoldTransaction',
      'scrollBadge',
      'prayerEntry',
      'dailyDevotion',
      'spiritualCheckIn',
      'studyGroup',
      'message',
      'communityPost',
      'notification'
    ];

    for (const model of models) {
      await this.exportModel(model);
    }

    console.log('');
  }

  /**
   * Export a single Prisma model
   */
  private async exportModel(modelName: string): Promise<void> {
    try {
      console.log(`  📊 Exporting ${modelName}...`);

      // Access Prisma model dynamically with proper typing
      const prismaModel = (this.sourcePrisma as Record<string, { findMany: () => Promise<PrismaRecord[]> }>)[modelName];
      
      if (!prismaModel || typeof prismaModel.findMany !== 'function') {
        console.log(`    ⚠️  Model ${modelName} not found in Prisma schema`);
        this.stats.push({
          table: modelName,
          recordsExported: 0,
          recordsImported: 0,
          status: 'skipped'
        });
        return;
      }

      // Get all records from the model
      const records = await prismaModel.findMany();

      if (records.length === 0) {
        console.log(`    ⚠️  No records found in ${modelName}`);
        this.stats.push({
          table: modelName,
          recordsExported: 0,
          recordsImported: 0,
          status: 'skipped'
        });
        return;
      }

      // Save to JSON file
      const filePath = path.join(this.exportDir, `${modelName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8');

      console.log(`    ✅ Exported ${records.length} records`);

      this.stats.push({
        table: modelName,
        recordsExported: records.length,
        recordsImported: 0,
        status: 'success'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`    ❌ Failed to export ${modelName}: ${errorMessage}`);

      this.stats.push({
        table: modelName,
        recordsExported: 0,
        recordsImported: 0,
        status: 'failed',
        error: errorMessage
      });
    }
  }

  /**
   * Import data to Supabase
   */
  private async importData(): Promise<void> {
    console.log('📥 Importing data to Supabase...');
    console.log('');

    // Get all exported files
    const files = fs.readdirSync(this.exportDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const modelName = file.replace('.json', '');
      await this.importModel(modelName);
    }

    console.log('');
  }

  /**
   * Import a single Prisma model
   */
  private async importModel(modelName: string): Promise<void> {
    try {
      console.log(`  📊 Importing ${modelName}...`);

      // Read exported data
      const filePath = path.join(this.exportDir, `${modelName}.json`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`    ⚠️  Export file not found for ${modelName}`);
        return;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent) as PrismaRecord[];

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`    ⚠️  No records to import for ${modelName}`);
        return;
      }

      // Access Prisma model dynamically with proper typing
      const prismaModel = (this.targetPrisma as Record<string, { createMany: (args: { data: PrismaRecord[]; skipDuplicates: boolean }) => Promise<{ count: number }> }>)[modelName];
      
      if (!prismaModel || typeof prismaModel.createMany !== 'function') {
        console.log(`    ⚠️  Model ${modelName} not found in target Prisma schema`);
        return;
      }

      // Import records in batches
      const batchSize = 100;
      let imported = 0;

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        const result = await prismaModel.createMany({
          data: batch,
          skipDuplicates: true
        });

        imported += result.count;
        console.log(`    📈 Progress: ${imported}/${data.length} records`);
      }

      console.log(`    ✅ Imported ${imported} records`);

      // Update stats
      const stat = this.stats.find(s => s.table === modelName);
      if (stat) {
        stat.recordsImported = imported;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`    ❌ Failed to import ${modelName}: ${errorMessage}`);

      const stat = this.stats.find(s => s.table === modelName);
      if (stat) {
        stat.status = 'failed';
        stat.error = errorMessage;
      }
    }
  }

  /**
   * Verify migration success
   */
  private async verifyMigration(): Promise<void> {
    console.log('🔍 Verifying migration...');
    console.log('');

    for (const stat of this.stats) {
      if (stat.status === 'skipped') continue;

      try {
        // Access Prisma model dynamically with proper typing
        const prismaModel = (this.targetPrisma as Record<string, { count: () => Promise<number> }>)[stat.table];
        
        if (!prismaModel || typeof prismaModel.count !== 'function') {
          console.log(`  ⚠️  ${stat.table}: Model not found for verification`);
          continue;
        }

        // Count records in target database
        const count = await prismaModel.count();

        if (count >= stat.recordsExported) {
          console.log(`  ✅ ${stat.table}: ${count} records verified`);
        } else {
          console.log(`  ⚠️  ${stat.table}: Expected ${stat.recordsExported}, found ${count}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`  ❌ ${stat.table}: Verification failed - ${errorMessage}`);
      }
    }

    console.log('');
  }

  /**
   * Print migration summary
   */
  private printSummary(): void {
    console.log('='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log('');

    const successful = this.stats.filter(s => s.status === 'success').length;
    const failed = this.stats.filter(s => s.status === 'failed').length;
    const skipped = this.stats.filter(s => s.status === 'skipped').length;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    console.log('');

    // Detailed table stats
    console.log('Table Details:');
    console.log('-'.repeat(60));

    this.stats.forEach(stat => {
      const icon = stat.status === 'success' ? '✅' : 
                   stat.status === 'failed' ? '❌' : '⚠️';
      
      console.log(`${icon} ${stat.table.padEnd(30)} | Exported: ${stat.recordsExported.toString().padStart(6)} | Imported: ${stat.recordsImported.toString().padStart(6)}`);
      
      if (stat.error) {
        console.log(`   Error: ${stat.error}`);
      }
    });

    console.log('');
    console.log('='.repeat(60));

    if (failed === 0) {
      console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Update your .env file to use SUPABASE_DATABASE_URL');
      console.log('2. Test your application with the new database');
      console.log('3. Keep the Lovable Cloud backup for 30 days');
    } else {
      console.log('⚠️  MIGRATION COMPLETED WITH ERRORS');
      console.log('');
      console.log('Please review the errors above and:');
      console.log('1. Check the exported JSON files in:', this.exportDir);
      console.log('2. Manually import failed tables if needed');
      console.log('3. Verify data integrity before switching');
    }

    console.log('');
    console.log('='.repeat(60));
  }
}

// Execute migration
const migration = new LovableToSupabaseMigration();
migration.migrate()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
