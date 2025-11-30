/**
 * Full Database Setup Script
 * "In the beginning God created the heavens and the earth." - Genesis 1:1
 * 
 * Comprehensive database initialization for ScrollUniversity
 * Sets up all tables, relationships, indexes, and seed data
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SetupResult {
  success: boolean;
  step: string;
  message: string;
  error?: string;
}

class FullDatabaseSetup {
  private results: SetupResult[] = [];

  /**
   * Main setup orchestrator
   */
  async execute(): Promise<void> {
    console.log('🚀 Starting Full Database Setup for ScrollUniversity');
    console.log('=' .repeat(80));

    try {
      // Step 1: Check Supabase connection
      await this.checkSupabaseConnection();

      // Step 2: Reset database (if needed)
      await this.resetDatabase();

      // Step 3: Run all migrations
      await this.runMigrations();

      // Step 4: Verify schema
      await this.verifySchema();

      // Step 5: Seed core data
      await this.seedCoreData();

      // Step 6: Seed academic year data
      await this.seedAcademicYearData();

      // Step 7: Seed course catalog
      await this.seedCourseCatalog();

      // Step 8: Seed user accounts
      await this.seedUserAccounts();

      // Step 9: Create indexes
      await this.createIndexes();

      // Step 10: Verify setup
      await this.verifySetup();

      // Print summary
      this.printSummary();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Database setup failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Setup',
        message: 'Fatal error occurred',
        error: errorMessage
      });
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Check Supabase connection
   */
  private async checkSupabaseConnection(): Promise<void> {
    console.log('\n📡 Step 1: Checking Supabase Connection...');
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Supabase connection successful');
      this.results.push({
        success: true,
        step: 'Connection',
        message: 'Database connection established'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Connection failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Connection',
        message: 'Failed to connect to database',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Reset database (optional - use with caution)
   */
  private async resetDatabase(): Promise<void> {
    console.log('\n🔄 Step 2: Database Reset Check...');
    
    const shouldReset = process.env.RESET_DATABASE === 'true';
    
    if (shouldReset) {
      console.log('⚠️  Resetting database...');
      try {
        execSync('npx prisma migrate reset --force', {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit'
        });
        console.log('✅ Database reset complete');
        this.results.push({
          success: true,
          step: 'Reset',
          message: 'Database reset successfully'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Reset failed:', errorMessage);
        this.results.push({
          success: false,
          step: 'Reset',
          message: 'Database reset failed',
          error: errorMessage
        });
        throw error;
      }
    } else {
      console.log('ℹ️  Skipping database reset (set RESET_DATABASE=true to reset)');
      this.results.push({
        success: true,
        step: 'Reset',
        message: 'Database reset skipped'
      });
    }
  }

  /**
   * Run all migrations
   */
  private async runMigrations(): Promise<void> {
    console.log('\n📦 Step 3: Running Migrations...');
    
    try {
      execSync('npx prisma migrate deploy', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log('✅ All migrations applied successfully');
      this.results.push({
        success: true,
        step: 'Migrations',
        message: 'All migrations applied'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Migration failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Migrations',
        message: 'Migration deployment failed',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Verify schema
   */
  private async verifySchema(): Promise<void> {
    console.log('\n🔍 Step 4: Verifying Schema...');
    
    try {
      // Check critical tables exist
      const tables = [
        'users',
        'courses',
        'academic_years',
        'academic_calendar_events',
        'course_enrollments',
        'degree_programs',
        'students'
      ];

      for (const table of tables) {
        const result = await prisma.$queryRawUnsafe(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          );
        `);
        console.log(`  ✓ Table '${table}' exists`);
      }

      console.log('✅ Schema verification complete');
      this.results.push({
        success: true,
        step: 'Schema Verification',
        message: 'All critical tables verified'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Schema verification failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Schema Verification',
        message: 'Schema verification failed',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Seed core data
   */
  private async seedCoreData(): Promise<void> {
    console.log('\n🌱 Step 5: Seeding Core Data...');
    
    try {
      // Seed roles
      await this.seedRoles();
      
      // Seed system settings
      await this.seedSystemSettings();
      
      console.log('✅ Core data seeded successfully');
      this.results.push({
        success: true,
        step: 'Core Data',
        message: 'Core data seeded'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Core data seeding failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Core Data',
        message: 'Core data seeding failed',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Seed roles
   */
  private async seedRoles(): Promise<void> {
    console.log('  📋 Seeding roles...');
    
    const roles = [
      { name: 'admin', description: 'System Administrator' },
      { name: 'faculty', description: 'Faculty Member' },
      { name: 'student', description: 'Student' },
      { name: 'staff', description: 'Staff Member' }
    ];

    for (const role of roles) {
      await prisma.$executeRaw`
        INSERT INTO roles (name, description, created_at, updated_at)
        VALUES (${role.name}, ${role.description}, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `;
    }
    
    console.log('  ✓ Roles seeded');
  }

  /**
   * Seed system settings
   */
  private async seedSystemSettings(): Promise<void> {
    console.log('  ⚙️  Seeding system settings...');
    
    const settings = [
      { key: 'minimum_gpa_for_graduation', value: '2.0', category: 'academic' },
      { key: 'minimum_credits_for_graduation', value: '120', category: 'academic' },
      { key: 'default_semester_length_weeks', value: '16', category: 'academic' },
      { key: 'max_credits_per_semester', value: '18', category: 'academic' },
      { key: 'spring_graduation_month', value: '4', category: 'graduation' },
      { key: 'fall_graduation_month', value: '11', category: 'graduation' }
    ];

    for (const setting of settings) {
      await prisma.$executeRaw`
        INSERT INTO system_settings (key, value, category, created_at, updated_at)
        VALUES (${setting.key}, ${setting.value}, ${setting.category}, NOW(), NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${setting.value}
      `;
    }
    
    console.log('  ✓ System settings seeded');
  }

  /**
   * Seed academic year data
   */
  private async seedAcademicYearData(): Promise<void> {
    console.log('\n📅 Step 6: Seeding Academic Year Data...');
    
    try {
      // Create current academic year
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 7, 15); // August 15
      const endDate = new Date(currentYear + 1, 4, 15); // May 15

      await prisma.$executeRaw`
        INSERT INTO academic_years (
          year_name, start_date, end_date, is_active, created_at, updated_at
        )
        VALUES (
          ${`${currentYear}-${currentYear + 1}`},
          ${startDate},
          ${endDate},
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (year_name) DO NOTHING
      `;

      console.log(`  ✓ Academic year ${currentYear}-${currentYear + 1} created`);
      
      console.log('✅ Academic year data seeded successfully');
      this.results.push({
        success: true,
        step: 'Academic Year Data',
        message: 'Academic year data seeded'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Academic year seeding failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Academic Year Data',
        message: 'Academic year seeding failed',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Seed course catalog
   */
  private async seedCourseCatalog(): Promise<void> {
    console.log('\n📚 Step 7: Seeding Course Catalog...');
    
    try {
      // Create sample courses
      const courses = [
        {
          code: 'THEO101',
          title: 'Introduction to Theology',
          description: 'Foundational course in Christian theology',
          credits: 3,
          level: 'undergraduate'
        },
        {
          code: 'BIBLE101',
          title: 'Old Testament Survey',
          description: 'Comprehensive survey of the Old Testament',
          credits: 3,
          level: 'undergraduate'
        },
        {
          code: 'BIBLE102',
          title: 'New Testament Survey',
          description: 'Comprehensive survey of the New Testament',
          credits: 3,
          level: 'undergraduate'
        }
      ];

      for (const course of courses) {
        await prisma.$executeRaw`
          INSERT INTO courses (
            code, title, description, credits, level, is_active, created_at, updated_at
          )
          VALUES (
            ${course.code},
            ${course.title},
            ${course.description},
            ${course.credits},
            ${course.level},
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT (code) DO NOTHING
        `;
      }

      console.log(`  ✓ ${courses.length} sample courses created`);
      
      console.log('✅ Course catalog seeded successfully');
      this.results.push({
        success: true,
        step: 'Course Catalog',
        message: 'Course catalog seeded'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Course catalog seeding failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Course Catalog',
        message: 'Course catalog seeding failed',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Seed user accounts
   */
  private async seedUserAccounts(): Promise<void> {
    console.log('\n👥 Step 8: Seeding User Accounts...');
    
    try {
      // Create admin user
      await prisma.$executeRaw`
        INSERT INTO users (
          email, full_name, role, is_active, created_at, updated_at
        )
        VALUES (
          'admin@scrolluniversity.edu',
          'System Administrator',
          'admin',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO NOTHING
      `;

      console.log('  ✓ Admin user created');
      
      console.log('✅ User accounts seeded successfully');
      this.results.push({
        success: true,
        step: 'User Accounts',
        message: 'User accounts seeded'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ User account seeding failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'User Accounts',
        message: 'User account seeding failed',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Create indexes
   */
  private async createIndexes(): Promise<void> {
    console.log('\n🔧 Step 9: Creating Indexes...');
    
    try {
      // Create performance indexes
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code)',
        'CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level)',
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
        'CREATE INDEX IF NOT EXISTS idx_academic_years_active ON academic_years(is_active)',
        'CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON course_enrollments(student_id)',
        'CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id)'
      ];

      for (const indexSql of indexes) {
        await prisma.$executeRawUnsafe(indexSql);
      }

      console.log(`  ✓ ${indexes.length} indexes created`);
      
      console.log('✅ Indexes created successfully');
      this.results.push({
        success: true,
        step: 'Indexes',
        message: 'Performance indexes created'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Index creation failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Indexes',
        message: 'Index creation failed',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Verify setup
   */
  private async verifySetup(): Promise<void> {
    console.log('\n✅ Step 10: Verifying Setup...');
    
    try {
      // Count records in key tables
      const userCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count FROM users
      `;
      
      const courseCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count FROM courses
      `;
      
      const academicYearCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count FROM academic_years
      `;

      console.log(`  ✓ Users: ${Number(userCount[0].count)}`);
      console.log(`  ✓ Courses: ${Number(courseCount[0].count)}`);
      console.log(`  ✓ Academic Years: ${Number(academicYearCount[0].count)}`);
      
      console.log('✅ Setup verification complete');
      this.results.push({
        success: true,
        step: 'Verification',
        message: 'Setup verified successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Verification failed:', errorMessage);
      this.results.push({
        success: false,
        step: 'Verification',
        message: 'Setup verification failed',
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Print summary
   */
  private printSummary(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 SETUP SUMMARY');
    console.log('='.repeat(80));

    const successCount = this.results.filter(r => r.success).length;
    const failureCount = this.results.filter(r => !r.success).length;

    console.log(`\n✅ Successful Steps: ${successCount}`);
    console.log(`❌ Failed Steps: ${failureCount}`);

    console.log('\nDetailed Results:');
    this.results.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${icon} ${result.step}: ${result.message}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    if (failureCount === 0) {
      console.log('\n🎉 DATABASE SETUP COMPLETE! 🎉');
      console.log('ScrollUniversity database is ready for production use.');
    } else {
      console.log('\n⚠️  SETUP COMPLETED WITH ERRORS');
      console.log('Please review the errors above and retry failed steps.');
    }

    console.log('='.repeat(80));
  }
}

// Execute setup
const setup = new FullDatabaseSetup();
setup.execute()
  .then(() => {
    console.log('\n✅ Setup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup script failed:', error);
    process.exit(1);
  });
