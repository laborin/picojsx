// src/lib/picojsx/eslint.config.js
import globals from 'globals';
import eslintJs from '@eslint/js';
// Solo importamos eslint-config-prettier para desactivar reglas conflictivas
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
	// Configuración global para todos los archivos .js
	{
		files: ['**/*.js'],
		ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				// No jest aquí, se aplica en bloque específico
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'warn',
		},
	},
	{
		// Bloque para tests
		files: ['__tests__/**/*.spec.js'],
		languageOptions: {
			globals: {
				...globals.jest, // Jest necesita browser y node también si los tests acceden a ellos
				...globals.browser,
				...globals.node,
			},
		},
	},
	eslintJs.configs.recommended, // Reglas base de ESLint
	eslintConfigPrettier, // IMPORTANTE: Desactiva reglas de ESLint que Prettier maneja
	// Re-añadimos tus reglas personalizadas (que no son de formato)
	{
		files: ['**/*.js'],
		rules: {
			'no-console': 'warn',
			eqeqeq: ['error', 'always'],
			// Ya no necesitamos 'prettier/prettier' aquí porque Prettier se ejecutará por separado
		},
	},
];
