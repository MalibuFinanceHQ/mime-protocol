module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['react'],
    rules: {
        'no-console': 0,
        'import/no-unresolved': 0,
        'import/extensions': 0,
        'react/jsx-filename-extension': 0,
        'no-use-before-define': 0,
        'react/jsx-pascal-case': 0,
    },
};
