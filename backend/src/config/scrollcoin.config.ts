/**
 * ScrollGold Blockchain Configuration
 * "By the Spirit of Wisdom, we configure the divine economy"
 */

export interface ScrollGoldConfig {
  // Blockchain Network
  networkName: string;
  rpcUrl: string;
  chainId: number;
  
  // Smart Contract
  contractAddress: string;
  contractABI: any[];
  
  // Gas Settings
  gasLimit: number;
  gasPrice: string;
  maxGasPrice: string;
  
  // Transaction Limits
  maxTransactionAmount: number;
  dailyTransferLimit: number;
  
  // Exchange Rate
  defaultExchangeRate: number; // ScrollGold to USD
  
  // Fraud Prevention
  fraudDetectionEnabled: boolean;
  suspiciousAmountThreshold: number;
  rapidTransactionWindow: number; // seconds
  rapidTransactionLimit: number;
  
  // Wallet Security
  encryptionAlgorithm: string;
  keyDerivationIterations: number;
  
  // Features
  blockchainEnabled: boolean;
  autoSyncEnabled: boolean;
  syncInterval: number; // milliseconds
  
  // Reward Rules
  courseCompletionReward: number;
  assignmentSubmissionReward: number;
  peerTutoringReward: number;
  communityContributionReward: number;
  
  // API Settings
  apiTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const ScrollGoldConfig: ScrollGoldConfig = {
  // Blockchain Network
  networkName: process.env.ScrollGold_NETWORK_NAME || 'ScrollChain Testnet',
  rpcUrl: process.env.ScrollGold_RPC_URL || 'https://scroll-testnet.rpc.url',
  chainId: parseInt(process.env.ScrollGold_CHAIN_ID || '534351'), // Scroll Sepolia Testnet
  
  // Smart Contract
  contractAddress: process.env.ScrollGold_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  contractABI: [], // Will be loaded from compiled contract
  
  // Gas Settings
  gasLimit: parseInt(process.env.ScrollGold_GAS_LIMIT || '100000'),
  gasPrice: process.env.ScrollGold_GAS_PRICE || '20000000000', // 20 Gwei
  maxGasPrice: process.env.ScrollGold_MAX_GAS_PRICE || '100000000000', // 100 Gwei
  
  // Transaction Limits
  maxTransactionAmount: parseFloat(process.env.ScrollGold_MAX_TRANSACTION || '10000'),
  dailyTransferLimit: parseFloat(process.env.ScrollGold_DAILY_LIMIT || '50000'),
  
  // Exchange Rate
  defaultExchangeRate: parseFloat(process.env.ScrollGold_DEFAULT_RATE || '1.0'), // 1 ScrollGold = $1 USD
  
  // Fraud Prevention
  fraudDetectionEnabled: process.env.ScrollGold_FRAUD_DETECTION !== 'false',
  suspiciousAmountThreshold: parseFloat(process.env.ScrollGold_SUSPICIOUS_THRESHOLD || '5000'),
  rapidTransactionWindow: parseInt(process.env.ScrollGold_RAPID_WINDOW || '300'), // 5 minutes
  rapidTransactionLimit: parseInt(process.env.ScrollGold_RAPID_LIMIT || '10'),
  
  // Wallet Security
  encryptionAlgorithm: 'aes-256-gcm',
  keyDerivationIterations: 100000,
  
  // Features
  blockchainEnabled: process.env.ScrollGold_BLOCKCHAIN_ENABLED === 'true',
  autoSyncEnabled: process.env.ScrollGold_AUTO_SYNC !== 'false',
  syncInterval: parseInt(process.env.ScrollGold_SYNC_INTERVAL || '60000'), // 1 minute
  
  // Reward Rules
  courseCompletionReward: parseFloat(process.env.ScrollGold_COURSE_REWARD || '100'),
  assignmentSubmissionReward: parseFloat(process.env.ScrollGold_ASSIGNMENT_REWARD || '10'),
  peerTutoringReward: parseFloat(process.env.ScrollGold_TUTORING_REWARD || '25'),
  communityContributionReward: parseFloat(process.env.ScrollGold_COMMUNITY_REWARD || '5'),
  
  // API Settings
  apiTimeout: parseInt(process.env.ScrollGold_API_TIMEOUT || '30000'), // 30 seconds
  retryAttempts: parseInt(process.env.ScrollGold_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.ScrollGold_RETRY_DELAY || '1000'), // 1 second
};

export default ScrollGoldConfig;

// Helper functions
export function getScrollGoldConfig(): ScrollGoldConfig {
  return ScrollGoldConfig;
}

export function isBlockchainEnabled(): boolean {
  return ScrollGoldConfig.blockchainEnabled;
}

export function getExchangeRate(): number {
  return ScrollGoldConfig.defaultExchangeRate;
}

export function convertScrollGoldToUSD(amount: number): number {
  return amount * ScrollGoldConfig.defaultExchangeRate;
}

export function convertUSDToScrollGold(amount: number): number {
  return amount / ScrollGoldConfig.defaultExchangeRate;
}

export function getRewardAmount(eventType: string): number {
  switch (eventType) {
    case 'COURSE_COMPLETION':
      return ScrollGoldConfig.courseCompletionReward;
    case 'ASSIGNMENT_SUBMISSION':
      return ScrollGoldConfig.assignmentSubmissionReward;
    case 'PEER_TUTORING':
      return ScrollGoldConfig.peerTutoringReward;
    case 'COMMUNITY_CONTRIBUTION':
      return ScrollGoldConfig.communityContributionReward;
    default:
      return 0;
  }
}

export function isFraudDetectionEnabled(): boolean {
  return ScrollGoldConfig.fraudDetectionEnabled;
}

export function getSuspiciousAmountThreshold(): number {
  return ScrollGoldConfig.suspiciousAmountThreshold;
}

export function getRapidTransactionLimits(): { window: number; limit: number } {
  return {
    window: ScrollGoldConfig.rapidTransactionWindow,
    limit: ScrollGoldConfig.rapidTransactionLimit
  };
}
