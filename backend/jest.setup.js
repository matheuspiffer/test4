// Set NODE_ENV to test to ensure proper error handling in tests
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console.error and console.log to reduce noise in test output
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
}; 