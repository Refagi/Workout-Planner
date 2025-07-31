import js from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import securityPlugin from 'eslint-plugin-security';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Konfigurasi dasar untuk JavaScript
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest', // Mendukung ECMAScript versi terbaru (ES2023+)
      sourceType: 'module', // Mendukung ES Modules
      globals: {
        ...jestPlugin.environments.globals.globals, // Menambahkan global Jest
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'func-names': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off'
    }
  },
  // Konfigurasi untuk Jest
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/expect-expect': 'off'
    }
  },
  // Konfigurasi untuk keamanan
  {
    plugins: {
      security: securityPlugin
    },
    rules: {
      ...securityPlugin.configs.recommended.rules,
      'security/detect-object-injection': 'off'
    }
  },
  // Konfigurasi untuk Prettier
  {
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierConfig.rules,
      ...prettierPlugin.configs.recommended.rules,
      'prettier/prettier': 'error'
    }
  }
];
