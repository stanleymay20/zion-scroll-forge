/**
 * ScrollGold System Validation Script
 * Validates complete implementation before deployment
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  category: string;
  passed: boolean;
  message: string;
  details?: string[];
}

class ScrollGoldValidator {
  private results: ValidationResult[] = [];
  private rootDir: string;

  constructor() {
    this.rootDir = path.join(__dirname, '..');
  }

  /**
   * Run all validations
   */
  async validate(): Promise<void> {
    console.log('🔍 Starting ScrollGold System Validation...\n');

    await this.validateTypeSystem();
    await this.validateServices();
    await this.validateConfiguration();
    await this.validateDatabase();
    await this.validateSmartContract();
    await this.validateAPIRoutes();
    await this.validateDocumentation();
    await this.validateEnvironment();

    this.printResults();
  }

  /**
   * Validate TypeScript type system
   */
  private async validateTypeSystem(): Promise<void> {
    const typesFile = path.join(this.rootDir, 'backend/src/types/scrollgold.types.ts');
    
    if (!fs.existsSync(typesFile)) {
      this.results.push({
        category: 'Type System',
        passed: false,
        message: 'ScrollGold types file not found'
      });
      return;
    }

    const content = fs.readFileSync(typesFile, 'utf-8');
    const requiredInterfaces = [
      'ScrollGoldWallet',
      'ScrollGoldTransaction',
      'TransactionType',
      'TransactionCategory',
      'TransactionStatus',
      'ScrollGoldReward',
      'StudentRewardEconomy',
      'FacultyRewardSystem',
      'ScrollGoldTokenomics'
    ];

    const missingInterfaces = requiredInterfaces.filter(
      iface => !content.includes(`interface ${iface}`) && !content.includes(`enum ${iface}`)
    );

    this.results.push({
      category: 'Type System',
      passed: missingInterfaces.length === 0,
      message: missingInterfaces.length === 0 
        ? 'All required types defined' 
        : 'Missing type definitions',
      details: missingInterfaces
    });
  }

  /**
   * Validate service implementation
   */
  private async validateServices(): Promise<void> {
    const serviceFile = path.join(this.rootDir, 'backend/src/services/ScrollGoldService.ts');
    
    if (!fs.existsSync(serviceFile)) {
      this.results.push({
        category: 'Services',
        passed: false,
        message: 'ScrollGoldService not found'
      });
      return;
    }

    const content = fs.readFileSync(serviceFile, 'utf-8');
    const requiredMethods = [
      'createWallet',
      'getWallet',
      'getOrCreateWallet',
      'awardScrollGold',
      'spendScrollGold',
      'transferScrollGold',
      'getBalance',
      'getTransactionHistory',
      'awardCourseCompletion',
      'awardAssignmentExcellence',
      'awardSpiritualFormation',
      'payTuition'
    ];

    const missingMethods = requiredMethods.filter(
      method => !content.includes(`async ${method}`)
    );

    this.results.push({
      category: 'Services',
      passed: missingMethods.length === 0,
      message: missingMethods.length === 0 
        ? 'All required methods implemented' 
        : 'Missing service methods',
      details: missingMethods
    });
  }

  /**
   * Validate configuration
   */
  private async validateConfiguration(): Promise<void> {
    const configFile = path.join(this.rootDir, 'backend/src/config/scrollgold.config.ts');
    
    if (!fs.existsSync(configFile)) {
      this.results.push({
        category: 'Configuration',
        passed: false,
        message: 'ScrollGold configuration not found'
      });
      return;
    }

    const content = fs.readFileSync(configFile, 'utf-8');
    const requiredSections = [
      'tokenomics',
      'studentRewards',
      'facultyRewards',
      'exchangeRates',
      'transactionFees',
      'wallet',
      'blockchain',
      'partnerships',
      'multipliers',
      'coursePricing',
      'scholarships'
    ];

    const missingSections = requiredSections.filter(
      section => !content.includes(`${section}:`)
    );

    this.results.push({
      category: 'Configuration',
      passed: missingSections.length === 0,
      message: missingSections.length === 0 
        ? 'All configuration sections present' 
        : 'Missing configuration sections',
      details: missingSections
    });
  }

  /**
   * Validate database schema
   */
  private async validateDatabase(): Promise<void> {
    const migrationFile = path.join(
      this.rootDir, 
      'supabase/migrations/20251201000001_scrollgold_economy_system.sql'
    );
    
    if (!fs.existsSync(migrationFile)) {
      this.results.push({
        category: 'Database',
        passed: false,
        message: 'ScrollGold migration file not found'
      });
      return;
    }

    const content = fs.readFileSync(migrationFile, 'utf-8');
    const requiredTables = [
      'scrollgold_wallets',
      'scrollgold_transactions',
      'student_reward_economy',
      'faculty_reward_system',
      'scrollgold_rewards',
      'scrollgold_exchange_rates',
      'scrollgold_tokenomics',
      'scrollgold_marketplace',
      'partnership_economy'
    ];

    const missingTables = requiredTables.filter(
      table => !content.includes(`CREATE TABLE IF NOT EXISTS ${table}`)
    );

    this.results.push({
      category: 'Database',
      passed: missingTables.length === 0,
      message: missingTables.length === 0 
        ? 'All required tables defined' 
        : 'Missing database tables',
      details: missingTables
    });
  }

  /**
   * Validate smart contract
   */
  private async validateSmartContract(): Promise<void> {
    const contractFile = path.join(this.rootDir, 'backend/contracts/ScrollGold.sol');
    
    if (!fs.existsSync(contractFile)) {
      this.results.push({
        category: 'Smart Contract',
        passed: false,
        message: 'ScrollGold smart contract not found'
      });
      return;
    }

    const content = fs.readFileSync(contractFile, 'utf-8');
    const requiredFeatures = [
      'contract ScrollGold',
      'ERC20',
      'Pausable',
      'Ownable',
      'MAX_SUPPLY',
      'awardReward',
      'grantScholarship',
      'payTuition',
      'burn',
      'getPoolBalances',
      'getUserStats'
    ];

    const missingFeatures = requiredFeatures.filter(
      feature => !content.includes(feature)
    );

    this.results.push({
      category: 'Smart Contract',
      passed: missingFeatures.length === 0,
      message: missingFeatures.length === 0 
        ? 'All required features implemented' 
        : 'Missing smart contract features',
      details: missingFeatures
    });
  }

  /**
   * Validate API routes
   */
  private async validateAPIRoutes(): Promise<void> {
    const routesFile = path.join(this.rootDir, 'backend/src/routes/scrollgold.ts');
    
    if (!fs.existsSync(routesFile)) {
      this.results.push({
        category: 'API Routes',
        passed: false,
        message: 'ScrollGold routes not found'
      });
      return;
    }

    const content = fs.readFileSync(routesFile, 'utf-8');
    const requiredEndpoints = [
      "router.get('/wallet'",
      "router.get('/balance'",
      "router.get('/transactions'",
      "router.post('/transfer'",
      "router.post('/award'",
      "router.post('/spend'",
      "router.get('/economy'",
      "router.post('/course-completion'",
      "router.post('/assignment-excellence'",
      "router.post('/spiritual-formation'",
      "router.post('/pay-tuition'"
    ];

    const missingEndpoints = requiredEndpoints.filter(
      endpoint => !content.includes(endpoint)
    );

    this.results.push({
      category: 'API Routes',
      passed: missingEndpoints.length === 0,
      message: missingEndpoints.length === 0 
        ? 'All required endpoints defined' 
        : 'Missing API endpoints',
      details: missingEndpoints
    });
  }

  /**
   * Validate documentation
   */
  private async validateDocumentation(): Promise<void> {
    const docFile = path.join(this.rootDir, 'SCROLLGOLD_TOKENOMICS_COMPLETE.md');
    
    if (!fs.existsSync(docFile)) {
      this.results.push({
        category: 'Documentation',
        passed: false,
        message: 'ScrollGold documentation not found'
      });
      return;
    }

    const content = fs.readFileSync(docFile, 'utf-8');
    const requiredSections = [
      'Token Economics',
      'Student Reward Economy',
      'Faculty Reward System',
      'Exchange Model',
      'Transaction Fees',
      'Wallet Design',
      'Blockchain Layer Design',
      'Partnership Economy',
      'Course Pricing',
      'Scholarship System'
    ];

    const missingSections = requiredSections.filter(
      section => !content.includes(section)
    );

    this.results.push({
      category: 'Documentation',
      passed: missingSections.length === 0,
      message: missingSections.length === 0 
        ? 'All required sections documented' 
        : 'Missing documentation sections',
      details: missingSections
    });
  }

  /**
   * Validate environment configuration
   */
  private async validateEnvironment(): Promise<void> {
    const envFile = path.join(this.rootDir, 'backend/.env.example');
    
    if (!fs.existsSync(envFile)) {
      this.results.push({
        category: 'Environment',
        passed: false,
        message: 'Environment example file not found'
      });
      return;
    }

    const content = fs.readFileSync(envFile, 'utf-8');
    const requiredVars = [
      'BLOCKCHAIN_NETWORK',
      'BLOCKCHAIN_RPC_URL',
      'SCROLLGOLD_CONTRACT_ADDRESS',
      'BLOCKCHAIN_PRIVATE_KEY',
      'SCROLLGOLD_ENABLED',
      'SCROLLGOLD_TOKEN_SYMBOL',
      'SCROLLGOLD_EXCHANGE_RATE_USD'
    ];

    const missingVars = requiredVars.filter(
      varName => !content.includes(varName)
    );

    this.results.push({
      category: 'Environment',
      passed: missingVars.length === 0,
      message: missingVars.length === 0 
        ? 'All required environment variables defined' 
        : 'Missing environment variables',
      details: missingVars
    });
  }

  /**
   * Print validation results
   */
  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCROLLGOLD VALIDATION RESULTS');
    console.log('='.repeat(60) + '\n');

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.category}: ${result.message}`);
      
      if (result.details && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`   - ${detail}`);
        });
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`OVERALL: ${passed}/${total} checks passed`);
    console.log('='.repeat(60) + '\n');

    if (passed === total) {
      console.log('🎉 ScrollGold system is COMPLETE and PRODUCTION READY!');
      console.log('✨ All components validated successfully');
      console.log('🚀 Ready for deployment to testnet\n');
    } else {
      console.log('⚠️  Some components need attention');
      console.log('📝 Review the failed checks above\n');
      process.exit(1);
    }
  }
}

// Run validation
const validator = new ScrollGoldValidator();
validator.validate().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
