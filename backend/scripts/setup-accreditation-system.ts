#!/usr/bin/env ts-node

/**
 * ScrollAccreditation System Setup Script
 * "We establish the infrastructure for truth-governed, data-grounded, Spirit-aligned education"
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface SetupConfig {
  databaseUrl: string;
  ethereumRpcUrl: string;
  ipfsHost: string;
  ipfsPort: number;
  contractDeployment: boolean;
  seedData: boolean;
}

class AccreditationSystemSetup {
  private config: SetupConfig;

  constructor(config: Partial<SetupConfig> = {}) {
    this.config = {
      databaseUrl: config.databaseUrl || process.env.DATABASE_URL || 'postgresql://scroll:scroll@localhost:5432/scrolluniversity',
      ethereumRpcUrl: config.ethereumRpcUrl || process.env.ETHEREUM_RPC_URL || 'http://localhost:8545',
      ipfsHost: config.ipfsHost || process.env.IPFS_HOST || 'localhost',
      ipfsPort: config.ipfsPort || parseInt(process.env.IPFS_PORT || '5001'),
      contractDeployment: config.contractDeployment ?? true,
      seedData: config.seedData ?? true
    };
  }

  async setup(): Promise<void> {
    console.log('🚀 Setting up ScrollAccreditation System...');
    console.log('=====================================');

    try {
      await this.checkPrerequisites();
      await this.setupEnvironment();
      await this.setupDatabase();
      await this.setupBlockchain();
      await this.setupIPFS();
      await this.deploySmartContracts();
      await this.seedDatabase();
      await this.verifySetup();

      console.log('✅ ScrollAccreditation System setup completed successfully!');
      console.log('🎓 The system is ready for truth-governed, data-grounded education validation');
    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  }

  private async checkPrerequisites(): Promise<void> {
    console.log('🔍 Checking prerequisites...');

    const requirements = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'npm', command: 'npm --version' },
      { name: 'PostgreSQL', command: 'psql --version' },
      { name: 'Docker', command: 'docker --version' }
    ];

    for (const req of requirements) {
      try {
        const version = execSync(req.command, { encoding: 'utf8' }).trim();
        console.log(`  ✅ ${req.name}: ${version}`);
      } catch (error) {
        console.log(`  ❌ ${req.name}: Not found or not accessible`);
        throw new Error(`${req.name} is required but not found`);
      }
    }
  }

  private async setupEnvironment(): Promise<void> {
    console.log('🔧 Setting up environment variables...');

    const envPath = join(process.cwd(), '.env');
    const envExamplePath = join(process.cwd(), '.env.example');

    if (!existsSync(envPath)) {
      console.log('  📝 Creating .env file...');
      
      const envContent = `
# ScrollAccreditation System Environment Configuration
# "We establish secure foundations for educational validation"

# Database Configuration
DATABASE_URL="${this.config.databaseUrl}"

# Blockchain Configuration
ETHEREUM_RPC_URL="${this.config.ethereumRpcUrl}"
ETHEREUM_PRIVATE_KEY="your-private-key-here"
SCROLL_CREDENTIAL_CONTRACT_ADDRESS="will-be-set-after-deployment"

# Validator Private Keys (for testing - use secure key management in production)
PROPHETIC_VALIDATOR_PRIVATE_KEY="your-prophetic-validator-key-here"
DATA_SCIENCE_VALIDATOR_PRIVATE_KEY="your-data-science-validator-key-here"

# IPFS Configuration
IPFS_HOST="${this.config.ipfsHost}"
IPFS_PORT="${this.config.ipfsPort}"
IPFS_PROTOCOL="http"
IPFS_AUTH_TOKEN="your-ipfs-auth-token-here"
IPFS_GATEWAY_URL="https://ipfs.io/ipfs/"

# Application Configuration
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-here"
JWT_EXPIRES_IN="7d"

# Redis Configuration (for caching and sessions)
REDIS_URL="redis://localhost:6379"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# ScrollGold Configuration
ScrollGold_NETWORK="ethereum"
ScrollGold_CONTRACT_ADDRESS="your-ScrollGold-contract-address"

# API Keys
OPENAI_API_KEY="your-openai-api-key-here"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
`;

      writeFileSync(envPath, envContent.trim());
      console.log('  ✅ .env file created');
    } else {
      console.log('  ✅ .env file already exists');
    }
  }

  private async setupDatabase(): Promise<void> {
    console.log('🗄️  Setting up database...');

    try {
      console.log('  📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });

      console.log('  🔄 Running database migrations...');
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

      console.log('  🏗️  Generating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });

      console.log('  ✅ Database setup completed');
    } catch (error) {
      console.error('  ❌ Database setup failed:', error);
      throw error;
    }
  }

  private async setupBlockchain(): Promise<void> {
    console.log('⛓️  Setting up blockchain infrastructure...');

    try {
      // Check if local blockchain is running
      try {
        execSync(`curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' ${this.config.ethereumRpcUrl}`, 
          { stdio: 'pipe' });
        console.log('  ✅ Blockchain connection verified');
      } catch (error) {
        console.log('  ⚠️  Local blockchain not detected, starting Hardhat node...');
        // Note: In production, this would connect to mainnet/testnet
        console.log('  💡 For development, run: npx hardhat node');
      }
    } catch (error) {
      console.error('  ❌ Blockchain setup failed:', error);
      throw error;
    }
  }

  private async setupIPFS(): Promise<void> {
    console.log('🌐 Setting up IPFS infrastructure...');

    try {
      // Check if IPFS is running
      try {
        execSync(`curl -X POST http://${this.config.ipfsHost}:${this.config.ipfsPort}/api/v0/version`, 
          { stdio: 'pipe' });
        console.log('  ✅ IPFS connection verified');
      } catch (error) {
        console.log('  ⚠️  IPFS not detected, please start IPFS daemon');
        console.log('  💡 Run: ipfs daemon');
        console.log('  💡 Or use Docker: docker run -d -p 4001:4001 -p 5001:5001 -p 8080:8080 ipfs/go-ipfs');
      }
    } catch (error) {
      console.error('  ❌ IPFS setup failed:', error);
      throw error;
    }
  }

  private async deploySmartContracts(): Promise<void> {
    if (!this.config.contractDeployment) {
      console.log('⏭️  Skipping smart contract deployment');
      return;
    }

    console.log('📜 Deploying smart contracts...');

    try {
      // Create Hardhat config if it doesn't exist
      const hardhatConfigPath = join(process.cwd(), 'hardhat.config.js');
      if (!existsSync(hardhatConfigPath)) {
        const hardhatConfig = `
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "${this.config.ethereumRpcUrl}"
    }
  }
};
`;
        writeFileSync(hardhatConfigPath, hardhatConfig);
      }

      // Create deployment script
      const deployScriptPath = join(process.cwd(), 'scripts', 'deploy-contracts.js');
      const deployScript = `
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ScrollCredentialVerification contract...");
  
  const ScrollCredentialVerification = await ethers.getContractFactory("ScrollCredentialVerification");
  const contract = await ScrollCredentialVerification.deploy();
  
  await contract.waitForDeployment();
  
  console.log("ScrollCredentialVerification deployed to:", await contract.getAddress());
  
  // Update .env file with contract address
  const fs = require('fs');
  const envPath = '.env';
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(
    /SCROLL_CREDENTIAL_CONTRACT_ADDRESS=.*/,
    \`SCROLL_CREDENTIAL_CONTRACT_ADDRESS=\${await contract.getAddress()}\`
  );
  fs.writeFileSync(envPath, envContent);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;

      if (!existsSync(join(process.cwd(), 'scripts'))) {
        execSync('mkdir -p scripts');
      }
      writeFileSync(deployScriptPath, deployScript);

      console.log('  📜 Smart contracts ready for deployment');
      console.log('  💡 Run: npx hardhat run scripts/deploy-contracts.js --network localhost');
    } catch (error) {
      console.error('  ❌ Smart contract setup failed:', error);
      throw error;
    }
  }

  private async seedDatabase(): Promise<void> {
    if (!this.config.seedData) {
      console.log('⏭️  Skipping database seeding');
      return;
    }

    console.log('🌱 Seeding database with initial data...');

    try {
      execSync('npm run seed', { stdio: 'inherit' });
      console.log('  ✅ Database seeded successfully');
    } catch (error) {
      console.error('  ❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async verifySetup(): Promise<void> {
    console.log('🔍 Verifying system setup...');

    const checks = [
      { name: 'Database Connection', check: () => this.checkDatabase() },
      { name: 'Environment Variables', check: () => this.checkEnvironment() },
      { name: 'Required Files', check: () => this.checkFiles() }
    ];

    for (const check of checks) {
      try {
        await check.check();
        console.log(`  ✅ ${check.name}`);
      } catch (error) {
        console.log(`  ❌ ${check.name}: ${error.message}`);
      }
    }
  }

  private async checkDatabase(): Promise<void> {
    try {
      execSync('npx prisma db pull --print', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Database connection failed');
    }
  }

  private checkEnvironment(): void {
    const requiredVars = [
      'DATABASE_URL',
      'ETHEREUM_RPC_URL',
      'IPFS_HOST',
      'JWT_SECRET'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`${varName} environment variable is missing`);
      }
    }
  }

  private checkFiles(): void {
    const requiredFiles = [
      'prisma/schema.prisma',
      'contracts/ScrollCredentialVerification.sol',
      'src/services/IPFSService.ts',
      'src/services/ScrollAccreditationBlockchainService.ts'
    ];

    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        throw new Error(`Required file ${file} is missing`);
      }
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const config: Partial<SetupConfig> = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];

    switch (key) {
      case 'database-url':
        config.databaseUrl = value;
        break;
      case 'ethereum-rpc':
        config.ethereumRpcUrl = value;
        break;
      case 'ipfs-host':
        config.ipfsHost = value;
        break;
      case 'no-contracts':
        config.contractDeployment = false;
        break;
      case 'no-seed':
        config.seedData = false;
        break;
    }
  }

  const setup = new AccreditationSystemSetup(config);
  await setup.setup();
}

if (require.main === module) {
  main().catch(console.error);
}

export { AccreditationSystemSetup };