// Mock environment variables
process.env.PORT = '3000';
process.env.TAPIS_JWKS_URI = 'https://tacc.tapis.io/v3/tenants/tacc';
process.env.TAPIS_TOKEN_ISSUER = 'https://tacc.tapis.io/v3/oauth2';
process.env.NODE_ENV = 'test';

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
