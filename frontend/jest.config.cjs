module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/tests/**/*.test.jsx'],
  clearMocks: true,
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};