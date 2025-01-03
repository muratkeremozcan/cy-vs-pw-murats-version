module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:import/recommended',
    'plugin:cypress/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'implicit-dependencies', 'no-only-tests'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // Always try to resolve types under `@types` directory even if it's not in `package.json`
      },
    },
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'scripts',
    '**/*.d.ts',
    'cypress/**/*',
    'vendor/**/*',
    '**/*.spec.js',
    '**/*.config.js',
    'reset-db.js',
    'app.js',
    'analytics.js',
  ],
  root: true,
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-only-tests/no-only-tests': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    complexity: ['warn', 15],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'import/default': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'cypress/unsafe-to-chain-command': 'off',
    'import/no-named-as-default': 'off',
  },
}
