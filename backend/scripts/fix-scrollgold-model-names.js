#!/usr/bin/env node
/**
 * Fix ScrollGold Billing Service - Update Prisma Model Names
 * "Whatever you do, work at it with all your heart" - Colossians 3:23
 * 
 * Converts snake_case table names to PascalCase Prisma model names
 * with comprehensive error handling and backup creation
 */

const fs = require('fs');
const path = require('path');

const serviceFile = path.join(__dirname, '../src/services/ScrollGoldBillingIntegrationService.ts');
const backupFile = `${serviceFile}.backup`;

console.log('🔧 Fixing ScrollGold Billing Integration Service...\n');

// Validate file exists
if (!fs.existsSync(serviceFile)) {
  console.error(`❌ Error: Service file not found at ${serviceFile}`);
  process.exit(1);
}

// Create backup before modification
try {
  fs.copyFileSync(serviceFile, backupFile);
  console.log(`✓ Backup created: ${path.basename(backupFile)}\n`);
} catch (error) {
  console.error(`❌ Error creating backup: ${error.message}`);
  process.exit(1);
}

// Read the file
let content;
try {
  content = fs.readFileSync(serviceFile, 'utf8');
} catch (error) {
  console.error(`❌ Error reading file: ${error.message}`);
  process.exit(1);
}

// Model name replacements
const replacements = [
  {
    from: /prisma\.scrollgold_earning_rules/g,
    to: 'prisma.scrollGoldEarningRule',
    name: 'scrollgold_earning_rules → ScrollGoldEarningRule'
  },
  {
    from: /prisma\.scrollgold_wallet_balances/g,
    to: 'prisma.scrollGoldWalletBalance',
    name: 'scrollgold_wallet_balances → ScrollGoldWalletBalance'
  },
  {
    from: /prisma\.scrollgold_earning_events/g,
    to: 'prisma.scrollGoldEarningEvent',
    name: 'scrollgold_earning_events → ScrollGoldEarningEvent'
  },
  {
    from: /prisma\.scrollgold_transactions/g,
    to: 'prisma.scrollGoldTransaction',
    name: 'scrollgold_transactions → ScrollGoldTransaction'
  },
  {
    from: /prisma\.scrollgold_spending_options/g,
    to: 'prisma.scrollGoldSpendingOption',
    name: 'scrollgold_spending_options → ScrollGoldSpendingOption'
  },
  {
    from: /prisma\.scrollgold_usage_history/g,
    to: 'prisma.scrollGoldUsageHistory',
    name: 'scrollgold_usage_history → ScrollGoldUsageHistory'
  }
];

// Field name replacements (snake_case to camelCase)
const fieldReplacements = [
  { from: /rule_type/g, to: 'ruleType' },
  { from: /is_active/g, to: 'isActive' },
  { from: /rule_name/g, to: 'ruleName' },
  { from: /base_amount/g, to: 'baseAmount' },
  { from: /max_amount/g, to: 'maxAmount' },
  { from: /earning_rule_id/g, to: 'earningRuleId' },
  { from: /user_id/g, to: 'userId' },
  { from: /event_type/g, to: 'eventType' },
  { from: /amount_earned/g, to: 'amountEarned' },
  { from: /course_id/g, to: 'courseId' },
  { from: /module_id/g, to: 'moduleId' },
  { from: /score_percentage/g, to: 'scorePercentage' },
  { from: /streak_days/g, to: 'streakDays' },
  { from: /verification_status/g, to: 'verificationStatus' },
  { from: /duplicate_check_hash/g, to: 'duplicateCheckHash' },
  { from: /current_balance/g, to: 'currentBalance' },
  { from: /lifetime_earned/g, to: 'lifetimeEarned' },
  { from: /lifetime_spent/g, to: 'lifetimeSpent' },
  { from: /total_module_completions/g, to: 'totalModuleCompletions' },
  { from: /total_streak_days/g, to: 'totalStreakDays' },
  { from: /transaction_type/g, to: 'transactionType' },
  { from: /balance_after/g, to: 'balanceAfter' },
  { from: /spending_option_id/g, to: 'spendingOptionId' },
  { from: /billing_related/g, to: 'billingRelated' },
  { from: /fraud_check_passed/g, to: 'fraudCheckPassed' }
];

// Apply model name replacements
let changeCount = 0;
replacements.forEach(({ from, to, name }) => {
  const matches = content.match(from);
  if (matches) {
    console.log(`✓ ${name}: ${matches.length} occurrences`);
    content = content.replace(from, to);
    changeCount += matches.length;
  }
});

console.log(`\n📝 Updated ${changeCount} model references\n`);

// Apply field name replacements
let fieldChangeCount = 0;
fieldReplacements.forEach(({ from, to }) => {
  const matches = content.match(from);
  if (matches) {
    content = content.replace(from, to);
    fieldChangeCount += matches.length;
  }
});

console.log(`📝 Updated ${fieldChangeCount} field references\n`);

// Validate that changes were made
const totalChanges = changeCount + fieldChangeCount;
if (totalChanges === 0) {
  console.log('⚠️  Warning: No changes were made. File may already be fixed or patterns not found.');
  console.log('Restoring from backup...\n');
  try {
    fs.copyFileSync(backupFile, serviceFile);
    fs.unlinkSync(backupFile);
  } catch (error) {
    console.error(`❌ Error restoring backup: ${error.message}`);
  }
  process.exit(0);
}

// Write the fixed file
try {
  fs.writeFileSync(serviceFile, content, 'utf8');
  console.log('✅ ScrollGold Billing Integration Service fixed!');
  console.log(`   Total changes: ${totalChanges} (${changeCount} models + ${fieldChangeCount} fields)\n`);
} catch (error) {
  console.error(`❌ Error writing file: ${error.message}`);
  console.log('Restoring from backup...');
  try {
    fs.copyFileSync(backupFile, serviceFile);
    console.log('✓ Backup restored successfully');
  } catch (restoreError) {
    console.error(`❌ Error restoring backup: ${restoreError.message}`);
  }
  process.exit(1);
}

// Keep backup for safety
console.log(`💾 Backup preserved at: ${path.basename(backupFile)}`);
console.log('   (Delete manually after verification)\n');

console.log('Next steps:');
console.log('1. Run: cd backend && npx tsc --noEmit');
console.log('2. Run: npm test ScrollGoldBillingIntegrationService');
console.log('3. Verify all functionality works correctly');
console.log('4. Delete backup file if everything works\n');

console.log('🙏 "Whatever you do, work at it with all your heart" - Colossians 3:23\n');
