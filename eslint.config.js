import globals from 'globals';
import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
	{
		files: ['**/*.js'],
		ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'warn',
		},
	},
	{
		files: ['__tests__/**/*.spec.js'],
		languageOptions: {
			globals: {
				...globals.jest,
				...globals.browser,
				...globals.node,
			},
		},
	},
	eslintJs.configs.recommended,
	eslintConfigPrettier,
	{
		files: ['**/*.js'],
		rules: {
			'no-console': 'warn',
			eqeqeq: ['error', 'always'],
		},
	},
];
