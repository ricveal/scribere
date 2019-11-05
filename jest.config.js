module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text', 'cobertura'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}
