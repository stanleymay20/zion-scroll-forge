/**
 * Export Database Tables to CSV
 * "Let all things be done decently and in order" - 1 Corinthians 14:40
 * 
 * Exports all tables from Supabase database to CSV files with proper formatting
 * and error handling. Follows ScrollUniversity zero-hardcoding and type safety standards.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Interface for export configuration
 */
interface ExportConfig {
  supabaseUrl: string;
  supabaseKey: string;
  exportDir: string;
  tables: string[];
}

/**
 * Interface for export result
 */
interface ExportResult {
  tableName: string;
  success: boolean;
  rowCount: number;
  filePath?: string;
  error?: string;
}

/**
 * Interface for CSV row data
 */
interface RowData {
  [key: string]: string | number | boolean | null | object;
}

/**
 * Get export configuration from environment variables
 */
function getExportConfig(): ExportConfig {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing required environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)'
    );
  }

  return {
    supabaseUrl,
    supabaseKey,
    exportDir: path.join(process.cwd(), 'database-exports'),
    tables: [
      'user_profiles',
      'courses',
      'course_modules',
      'lectures',
      'enrollments',
      'assignments',
      'submissions',
      'payments',
      'scrollgold_transactions',
      'scrollbadges',
      'prayer_journal_entries',
      'devotions',
      'study_groups',
      'community_posts',
      'messages',
      'academic_calendar',
      'degree_programs',
      'scholarships',
      'applications',
      'certifications',
      'research_papers',
      'ai_tutor_sessions'
    ]
  };
}

/**
 * Escape CSV value properly
 * Handles quotes, commas, newlines, and special characters
 */
function escapeCSVValue(value: string | number | boolean | null | object): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert objects and arrays to JSON strings
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  const stringValue = String(value);
  
  // Check if value needs quoting (contains comma, quote, newline, or carriage return)
  const needsQuoting = /[",\n\r]/.test(stringValue);
  
  if (needsQuoting) {
    // Escape quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return stringValue;
}

/**
 * Convert data rows to CSV format
 */
function convertToCSV(data: RowData[]): string {
  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.map(escapeCSVValue).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => escapeCSVValue(row[header]));
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Export a single table to CSV
 */
async function exportTableToCSV(
  supabase: SupabaseClient,
  tableName: string,
  exportDir: string
): Promise<ExportResult> {
  console.log(`\nExporting ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`  ✗ Error exporting ${tableName}:`, error.message);
      return {
        tableName,
        success: false,
        rowCount: 0,
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      console.log(`  ⚠ ${tableName} is empty (no data to export)`);
      return {
        tableName,
        success: true,
        rowCount: 0
      };
    }

    // Convert to CSV
    const csvContent = convertToCSV(data as RowData[]);

    // Ensure export directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = path.join(exportDir, `${tableName}-${timestamp}.csv`);
    
    // Write to file with UTF-8 encoding
    fs.writeFileSync(filename, csvContent, { encoding: 'utf-8' });

    console.log(`  ✓ Exported ${data.length} rows to ${filename}`);
    
    return {
      tableName,
      success: true,
      rowCount: data.length,
      filePath: filename
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ Error processing ${tableName}:`, errorMessage);
    
    return {
      tableName,
      success: false,
      rowCount: 0,
      error: errorMessage
    };
  }
}

/**
 * Export all tables to CSV files
 */
async function exportAllTables(): Promise<void> {
  console.log('=== ScrollUniversity Database Export to CSV ===');
  console.log('"Let all things be done decently and in order" - 1 Corinthians 14:40\n');

  try {
    // Get configuration
    const config = getExportConfig();
    
    console.log(`Supabase URL: ${config.supabaseUrl}`);
    console.log(`Export Directory: ${config.exportDir}`);
    console.log(`Tables to export: ${config.tables.length}\n`);

    // Create Supabase client
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);

    // Export all tables
    const results: ExportResult[] = [];
    
    for (const table of config.tables) {
      const result = await exportTableToCSV(supabase, table, config.exportDir);
      results.push(result);
    }

    // Print summary
    console.log('\n=== Export Summary ===');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalRows = results.reduce((sum, r) => sum + r.rowCount, 0);

    console.log(`\nSuccessful: ${successful.length}/${results.length} tables`);
    console.log(`Total rows exported: ${totalRows}`);
    
    if (failed.length > 0) {
      console.log(`\nFailed exports (${failed.length}):`);
      failed.forEach(f => {
        console.log(`  - ${f.tableName}: ${f.error}`);
      });
    }

    console.log(`\n✓ Export complete!`);
    console.log(`Files saved to: ${config.exportDir}`);

    // Exit with appropriate code
    process.exit(failed.length > 0 ? 1 : 0);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n✗ Export failed:', errorMessage);
    console.error('\nPlease ensure:');
    console.error('1. SUPABASE_URL is set in your .env file');
    console.error('2. SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is set');
    console.error('3. You have network connectivity to Supabase');
    console.error('4. The database tables exist and are accessible');
    
    process.exit(1);
  }
}

// Run export
exportAllTables().catch((error: Error) => {
  console.error('Unhandled error:', error.message);
  process.exit(1);
});
