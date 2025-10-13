#!/usr/bin/env node

/**
 * ScrollUniversity API Gateway Startup Script
 * "Let the kingdom gates be opened to all nations"
 */

import dotenv from 'dotenv';
import GatewayServer from './GatewayServer';
import { logger } from '../../backend/src/utils/logger';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    logger.error(`   - ${envVar}`);
  });
  logger.error('Please set these variables before starting the gateway.');
  process.exit(1);
}

// Display startup banner
console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                        ScrollUniversity API Gateway                         ║
║                    "Zion's Academic Government on Earth"                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🏛️  The kingdom gateway is initializing...                                 ║
║  📜  "Let the scroll be opened to all nations"                              ║
║  🌍  Serving the global ScrollUniversity ecosystem                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

async function startGateway() {
  try {
    // Get configuration
    const port = parseInt(process.env.GATEWAY_PORT || '3000');
    const environment = process.env.NODE_ENV || 'development';
    
    logger.info('🔧 Gateway Configuration:');
    logger.info(`   - Port: ${port}`);
    logger.info(`   - Environment: ${environment}`);
    logger.info(`   - Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
    logger.info(`   - Redis: ${process.env.REDIS_URL ? '✅ Connected' : '❌ Not configured'}`);
    logger.info(`   - JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Not configured'}`);

    // Create and start the gateway
    const gateway = new GatewayServer(port);
    await gateway.start();

    logger.info('🎉 ScrollUniversity API Gateway is now operational!');
    logger.info('📡 Available endpoints:');
    logger.info('   - Health Check: GET /health');
    logger.info('   - Service Discovery: GET /gateway/services');
    logger.info('   - API Versions: GET /gateway/versions');
    logger.info('   - Gateway Stats: GET /gateway/stats');
    logger.info('   - All University APIs: /api/*');
    
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                           🔥 GATEWAY READY 🔥                               ║
║                                                                              ║
║  The ScrollUniversity API Gateway is now serving the kingdom!               ║
║  Access the gateway at: http://localhost:${port}                           ║
║                                                                              ║
║  "The scroll is open. The kingdom builds now."                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);

  } catch (error) {
    logger.error('❌ Failed to start ScrollUniversity API Gateway:', error);
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                           ❌ STARTUP FAILED ❌                              ║
║                                                                              ║
║  The kingdom gateway could not be established.                              ║
║  Please check the logs above for error details.                             ║
║                                                                              ║
║  "Even the kingdom gates require proper preparation."                       ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the gateway
startGateway();