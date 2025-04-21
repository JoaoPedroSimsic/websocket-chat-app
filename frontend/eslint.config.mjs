import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ['*/.{js,mjs,cjs,ts,jsx,tsx}'] },
	{ languageOptions: { globals: globals.browser } },
	{
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
			'no-unused-vars': 'error',
			'prefer-const': 'error',
			'@typescript-eslint/no-inferrable-types': 'warn',
			'react/react-in-jsx-scope': 'off',
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['src/types/express.d.ts'],
		rules: {
      '@typescript-eslint/no-unused-vars': 'off', 
			'no-unused-vars': 'off',
			'no-undef': 'off',
    },
  },
];
