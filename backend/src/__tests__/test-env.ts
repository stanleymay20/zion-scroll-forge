import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set test-specific environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DISABLE_LOGGING = 'true';

// Mock external services
process.env.DISABLE_EXTERNAL_APIS = 'true';
process.env.MOCK_EXTERNAL_SERVICES = 'true';

// Ensure test database URL is set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5433/zion_scroll_test';
}

// Ensure test Redis URL is set
if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6380';
}
