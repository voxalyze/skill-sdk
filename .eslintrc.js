module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['prettier', 'airbnb'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: { jest: true, node: true },
  rules: { 'no-console': 'warn' },
  settings: {
    'import/resolver': {
      node: {
        paths: ['services'],
        extensions: ['.js', '.ts'],
      },
    },
  },
};
