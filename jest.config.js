/**
 * Jest Configuration
 * Arquivo: jest.config.js
 */

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Transform react-native and related packages, but NOT react-native/jest
    // (react-native 0.83 jest helpers use Flow `as` operator which Babel can't handle)
    'node_modules/(?!(react-native(?!/jest)|@react-native(-community)?)/)',
  ],
  moduleNameMapper: {
    // Suppress any react-native internals that require platform-specific modules
    '^react-native/Libraries/(.*)$': '<rootDir>/__mocks__/react-native-library.js',
    // Map react-native itself to the react-native package
    '^react-native$': 'react-native',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/*.test.js',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
