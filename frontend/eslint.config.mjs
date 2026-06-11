import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '.angular/**', 'node_modules/**']
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'e2e/tsconfig.json'],
        createDefaultProgram: true
      }
    },
    rules: {
      '@angular-eslint/component-selector': [
        'warn',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case'
        }
      ],
      '@angular-eslint/directive-selector': [
        'warn',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-class-suffix': [
        'error',
        {
          suffixes: ['']
        }
      ],
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@angular-eslint/prefer-inject': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'arrow-body-style': ['error', 'as-needed'],
      curly: 0,
      'no-empty': 'off',
      '@typescript-eslint/member-ordering': [
        'warn',
        {
          default: ['public-static-field', 'static-field', 'instance-field', 'public-instance-method', 'public-static-field']
        }
      ],
      'no-console': 0,
      'prefer-const': 0,
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'any', prev: ['case', 'default'], next: 'break' },
        { blankLine: 'any', prev: 'case', next: 'case' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'block', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: ['import'], next: ['const', 'let', 'var'] }
      ]
    }
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
    ],
    rules: {
      '@angular-eslint/template/eqeqeq': [
        'error',
        {
          allowNullOrUndefined: true
        }
      ],
      '@angular-eslint/template/prefer-control-flow': 'off'
    }
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': ['error', {
        endOfLine: 'auto',
        singleQuote: true,
        tabWidth: 2,
        semi: true,
        printWidth: 100
      }]
    }
  }
);
