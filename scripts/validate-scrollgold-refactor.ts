/**
 * ScrollGold Refactor Validation Script
 * Validates that the ScrollGold → ScrollGold refactor was successful
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  category: string;
  passed: boolean;
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function addResult(category: string, passed: boolean, message: string, details?: string[]): void {
  results.push({ category, passed, message, details });
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  log(`${icon} ${category}: ${message}`, color);
  if (details && details.length > 0) {
    details.forEach(detail => log(`   - ${detail}`, colors.yellow));
  }
}

// Validation 1: Check for remaining ScrollGold references
function validateNoScrollGoldReferences(): void {
  log('\n📝 Checking for remaining ScrollGold references...', colors.cyan);
  
  const excludeDirs = ['node_modules', 'dist', 'build', '.git', 'coverage'];
  const searchPatterns = ['ScrollGold', 'ScrollGold', 'ScrollGold'];
  const allowedFiles = [
    'ScrollGold_TO_SCROLLGOLD_REFACTOR_COMPLETE.md',
    'validate-scrollgold-refactor.ts',
    'refactor-ScrollGold-to-scrollgold.ps1',
    '20251130000001_ScrollGold_to_scrollgold.sql'
  ];
  
  let foundReferences: string[] = [];
  
  searchPatterns.forEach(pattern => {
    try {
      const result = execSync(
        `grep -r "${pattern}" . --exclude-dir={${excludeDirs.join(',')}} --exclude="*.{log,lock}" || true`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );
      
      const lines = result.split('\n').filter(line => {
        if (!line.trim()) return false;
        // Exclude allowed documentation files
        return !allowedFiles.some(allowed => line.includes(allowed));
      });
      
      foundReferences = foundReferences.concat(lines);
    } catch (error) {
      // grep returns non-zero if no matches, which is what we want
    }
  });
  
  if (foundReferences.length === 0) {
    addResult('References', true, 'No remaining ScrollGold references found');
  } else {
    addResult(
      'References',
      false,
      `Found ${foundReferences.length} remaining ScrollGold references`,
      foundReferences.slice(0, 10) // Show first 10
    );
  }
}

// Validation 2: Check TypeScript compilation
function validateTypeScriptCompilation(): void {
  log('\n🔨 Validating TypeScript compilation...', colors.cyan);
  
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    addResult('TypeScript', true, 'All TypeScript files compile successfully');
  } catch (error) {
    addResult('TypeScript', false, 'TypeScript compilation errors found', [
      'Run: npm run type-check for details'
    ]);
  }
}

// Validation 3: Check Prisma schema
function validatePrismaSchema(): void {
  log('\n🗄️  Validating Prisma schema...', colors.cyan);
  
  try {
    execSync('cd backend && npx prisma validate', { stdio: 'pipe' });
    addResult('Prisma', true, 'Prisma schema is valid');
  } catch (error) {
    addResult('Prisma', false, 'Prisma schema validation failed', [
      'Run: cd backend && npx prisma validate for details'
    ]);
  }
}

// Validation 4: Check for renamed files
function validateFileRenames(): void {
  log('\n📁 Validating file renames...', colors.cyan);
  
  const expectedFiles = [
    'backend/src/services/ScrollGoldService.ts',
    'backend/src/routes/scrollgold.ts',
    'backend/src/types/scrollgold.types.ts',
    'backend/src/config/scrollgold.config.ts',
    'backend/contracts/ScrollGold.sol',
    'src/types/scrollgold.ts',
    'src/pages/ScrollGoldWallet.tsx',
    'src/hooks/useScrollGold.ts'
  ];
  
  const missingFiles: string[] = [];
  const foundFiles: string[] = [];
  
  expectedFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      foundFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length === 0) {
    addResult('File Renames', true, `All ${expectedFiles.length} expected files found`);
  } else {
    addResult(
      'File Renames',
      false,
      `${missingFiles.length} expected files not found`,
      missingFiles
    );
  }
}

// Validation 5: Check for renamed directories
function validateDirectoryRenames(): void {
  log('\n📂 Validating directory renames...', colors.cyan);
  
  const expectedDirs = [
    'src/components/scrollgold',
    'backend/src/services/scrollgold'
  ];
  
  const oldDirs = [
    'src/components/ScrollGold',
    'backend/src/services/ScrollGold'
  ];
  
  const missingDirs: string[] = [];
  const oldDirsStillExist: string[] = [];
  
  expectedDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      missingDirs.push(dir);
    }
  });
  
  oldDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      oldDirsStillExist.push(dir);
    }
  });
  
  if (missingDirs.length === 0 && oldDirsStillExist.length === 0) {
    addResult('Directory Renames', true, 'All directories renamed correctly');
  } else {
    const issues = [...missingDirs.map(d => `Missing: ${d}`), ...oldDirsStillExist.map(d => `Old dir exists: ${d}`)];
    addResult('Directory Renames', false, 'Directory rename issues found', issues);
  }
}

// Validation 6: Check environment variables
function validateEnvironmentVariables(): void {
  log('\n🔐 Validating environment variables...', colors.cyan);
  
  const envFiles = ['.env.example', 'backend/.env.example'];
  const oldVars = ['ScrollGold_CONTRACT_ADDRESS', 'ScrollGold_NETWORK'];
  const newVars = ['SCROLLGOLD_CONTRACT_ADDRESS', 'SCROLLGOLD_NETWORK'];
  
  let hasOldVars = false;
  let hasMissingNewVars = false;
  const issues: string[] = [];
  
  envFiles.forEach(envFile => {
    const fullPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      oldVars.forEach(oldVar => {
        if (content.includes(oldVar)) {
          hasOldVars = true;
          issues.push(`${envFile} still contains ${oldVar}`);
        }
      });
      
      newVars.forEach(newVar => {
        if (!content.includes(newVar)) {
          hasMissingNewVars = true;
          issues.push(`${envFile} missing ${newVar}`);
        }
      });
    }
  });
  
  if (!hasOldVars && !hasMissingNewVars) {
    addResult('Environment Variables', true, 'All environment variables updated');
  } else {
    addResult('Environment Variables', false, 'Environment variable issues found', issues);
  }
}

// Validation 7: Check API routes
function validateAPIRoutes(): void {
  log('\n🌐 Validating API routes...', colors.cyan);
  
  const routeFile = 'backend/src/index.ts';
  const fullPath = path.join(process.cwd(), routeFile);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const hasOldRoute = content.includes('/api/ScrollGold');
    const hasNewRoute = content.includes('/api/scrollgold');
    
    if (!hasOldRoute && hasNewRoute) {
      addResult('API Routes', true, 'API routes updated to /api/scrollgold');
    } else if (hasOldRoute) {
      addResult('API Routes', false, 'Old /api/ScrollGold route still exists');
    } else {
      addResult('API Routes', false, 'New /api/scrollgold route not found');
    }
  } else {
    addResult('API Routes', false, 'Could not find backend/src/index.ts');
  }
}

// Validation 8: Check smart contracts
function validateSmartContracts(): void {
  log('\n⛓️  Validating smart contracts...', colors.cyan);
  
  const contractFile = 'backend/contracts/ScrollGold.sol';
  const fullPath = path.join(process.cwd(), contractFile);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    const hasScrollGold = content.includes('ScrollGold');
    const hasOldName = content.includes('ScrollGold');
    
    if (hasScrollGold && !hasOldName) {
      addResult('Smart Contracts', true, 'Smart contract renamed to ScrollGold');
    } else {
      addResult('Smart Contracts', false, 'Smart contract still contains ScrollGold references');
    }
  } else {
    addResult('Smart Contracts', false, 'ScrollGold.sol not found');
  }
}

// Generate summary report
function generateSummary(): void {
  log('\n' + '='.repeat(60), colors.cyan);
  log('📊 VALIDATION SUMMARY', colors.cyan);
  log('='.repeat(60), colors.cyan);
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => r.passed === false).length;
  const total = results.length;
  
  log(`\nTotal Checks: ${total}`, colors.cyan);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  
  const percentage = Math.round((passed / total) * 100);
  log(`\nSuccess Rate: ${percentage}%`, percentage === 100 ? colors.green : colors.yellow);
  
  if (failed === 0) {
    log('\n🎉 All validations passed! ScrollGold refactor is complete.', colors.green);
    log('✅ Ready for production deployment.', colors.green);
  } else {
    log('\n⚠️  Some validations failed. Please review and fix issues.', colors.yellow);
    log('❌ Not ready for production deployment.', colors.red);
  }
  
  log('\n' + '='.repeat(60), colors.cyan);
}

// Main execution
async function main(): Promise<void> {
  log('🚀 Starting ScrollGold Refactor Validation...', colors.cyan);
  log('='.repeat(60), colors.cyan);
  
  validateNoScrollGoldReferences();
  validateFileRenames();
  validateDirectoryRenames();
  validateEnvironmentVariables();
  validateAPIRoutes();
  validateSmartContracts();
  validateTypeScriptCompilation();
  validatePrismaSchema();
  
  generateSummary();
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Validation script error: ${error.message}`, colors.red);
  process.exit(1);
});
