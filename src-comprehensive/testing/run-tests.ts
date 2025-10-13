#!/usr/bin/env node

/**
 * Test Execution Script
 * Entry point for running ScrollUniversity comprehensive tests
 */

import { TestCLI } from './ScrollUniversityTestRunner';

// Get command line arguments
const args = process.argv.slice(2);

// Run the CLI
TestCLI.run(args).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});