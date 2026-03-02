module.exports = {
  displayName: '📦 CONSUMER',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
    '!src/app.module.ts',
    '!src/**/*.module.ts',
    '!src/**/*.schema.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
};
