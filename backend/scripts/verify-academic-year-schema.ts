/**
 * Academic Year Database Schema Verification Script
 * "Let all things be done decently and in order" - 1 Corinthians 14:40
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  table: string;
  exists: boolean;
  columns: string[];
  issues: string[];
}

async function verifyTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `;
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    return result.map(r => r.column_name);
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error);
    return [];
  }
}

async function validateTable(
  tableName: string,
  requiredColumns: string[]
): Promise<ValidationResult> {
  const result: ValidationResult = {
    table: tableName,
    exists: false,
    columns: [],
    issues: []
  };

  result.exists = await verifyTableExists(tableName);
  if (!result.exists) {
    result.issues.push(`Table ${tableName} does not exist`);
    return result;
  }

  result.columns = await getTableColumns(tableName);
  
  for (const requiredColumn of requiredColumns) {
    if (!result.columns.includes(requiredColumn)) {
      result.issues.push(`Missing required column: ${requiredColumn}`);
    }
  }

  return result;
}

async function runValidation() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 ACADEMIC YEAR SCHEMA VALIDATION');
  console.log('='.repeat(80) + '\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    const results: ValidationResult[] = [];

    // Validate tables
    console.log('📅 Validating Academic Calendar Engine...');
    results.push(await validateTable('academic_years', ['id', 'name', 'start_date', 'end_date', 'calendar_type']));
    results.push(await validateTable('semesters', ['id', 'academic_year_id', 'name', 'start_date', 'end_date']));
    results.push(await validateTable('academic_events', ['id', 'name', 'event_type', 'start_date', 'end_date']));

    console.log('🎓 Validating Student Lifecycle Engine...');
    results.push(await validateTable('admissions', ['id', 'student_id', 'program_id', 'status']));
    results.push(await validateTable('enrollments', ['id', 'student_id', 'course_id', 'status']));
    results.push(await validateTable('graduation_records', ['id', 'student_id', 'degree_id', 'graduation_date']));

    console.log('👨‍🏫 Validating Faculty Teaching Operations...');
    results.push(await validateTable('teaching_assignments', ['id', 'faculty_id', 'course_id', 'semester_id']));

    console.log('📚 Validating Course Execution Engine...');
    results.push(await validateTable('course_modules', ['id', 'course_id', 'title', 'sequence_number']));
    results.push(await validateTable('lectures', ['id', 'module_id', 'title', 'content']));

    console.log('⚙️ Validating Workflow & Notifications...');
    results.push(await validateTable('workflows', ['id', 'name', 'description', 'definition']));
    results.push(await validateTable('workflow_instances', ['id', 'workflow_id', 'status', 'context']));
    results.push(await validateTable('notifications', ['id', 'user_id', 'type', 'title', 'message']));

    // Summary
    const passed = results.filter(r => r.issues.length === 0).length;
    const failed = results.filter(r => !r.exists).length;
    const warnings = results.filter(r => r.exists && r.issues.length > 0).length;
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

    console.log('\n' + '='.repeat(80));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Tables Validated: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total Issues: ${totalIssues}`);
    console.log('='.repeat(80) + '\n');

    // Detailed results
    results.forEach(result => {
      console.log(`📋 ${result.table}: ${result.exists ? '✅' : '❌'}`);
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
      }
    });

    console.log('\n' + '='.repeat(80));
    if (totalIssues === 0) {
      console.log('🎉 ALL SCHEMA VALIDATIONS PASSED!');
    } else {
      console.log('❌ SCHEMA VALIDATION FAILED');
    }
    console.log('='.repeat(80) + '\n');

    await prisma.$disconnect();
    process.exit(totalIssues > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Fatal error during validation:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runValidation();
