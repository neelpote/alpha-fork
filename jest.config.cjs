module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/src/__tests__/__mocks__/styleMock.cjs',
    '@midnight-ntwrk/(.*)': '<rootDir>/src/__tests__/__mocks__/midnightMock.cjs',
  },
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
