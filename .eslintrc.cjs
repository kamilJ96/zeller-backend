module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'standard',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'comma-dangle': ['warn', 'always-multiline'],
    'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
    'space-before-function-paren': ['warn', 'always'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'max-len': ['warn', { code: 100 }],
  },
};
