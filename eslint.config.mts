import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

import tseslint from "typescript-eslint";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";

import reactHooks from "eslint-plugin-react-hooks";

import unicorn from "eslint-plugin-unicorn";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-config-prettier";

import jsonc from "eslint-plugin-jsonc";
import jsoncParser from "jsonc-eslint-parser";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    ignores: [
      "**/node_modules/**/*",
      "**/node_modules/**",
      "**/@types/**/*",
      "*/mocks/**/*",
      "**/.vercel/**/*",
      "**/.react-router/**/*",
      "**/build/**/*",
      "i18next-resources.d.ts",
      "test-results/",
      "playwright-report/",
      "blob-report/",
      "playwright/.cache/",
      "playwright/.auth/",
      "/public/img-gen/**/*",
      "package-lock.json",
      "generated/prisma/**/*",
      ".husky/**/*",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    plugins: {
      "simple-import-sort": simpleImportSort,
      perfectionist,
      unicorn,
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      "no-multiple-empty-lines": [
        "error",
        {
          max: 1,
          maxBOF: 0,
          maxEOF: 0,
        },
      ],
      "import/newline-after-import": ["error", { count: 1 }],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "perfectionist/sort-interfaces": ["error", { type: "alphabetical" }],
      "perfectionist/sort-object-types": ["error", { type: "alphabetical" }],
      "perfectionist/sort-union-types": ["error", { type: "alphabetical" }],
      "perfectionist/sort-enums": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: true,
          specialCharacters: "keep",
          sortByValue: "never",
          partitionByComment: false,
          partitionByNewLine: false,
        },
      ],
      curly: ["error", "all"],
      "perfectionist/sort-jsx-props": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: true,
          specialCharacters: "keep",
          partitionByNewLine: false,
        },
      ],
      "perfectionist/sort-objects": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: true,
          specialCharacters: "keep",
          partitionByNewLine: false,
        },
      ],
      ...unicorn.configs.all.rules,
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
            pascalCase: true,
            snakeCase: false,
          },
        },
      ],
      "unicorn/no-nested-ternary": "off",
      "unicorn/no-null": "off",
      "unicorn/no-keyword-prefix": "off",
      "unicorn/prefer-dom-node-dataset": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          extendDefaultReplacements: true,
          checkProperties: false,
          checkFilenames: false,
          checkDefaultAndNamespaceImports: true,
          replacements: {
            err: { error: true },
            msg: { message: true },
            cfg: { configuration: true },
            ctx: { context: true },
            req: { request: true },
            res: { response: true },
            params: { parameters: true },
          },
          allowList: {
            Props: true,
            SearchParams: true,
            src: true,
            rel: true,
            prev: true,
            temp: true,
            Lib: true,
          },
        },
      ],
      "unicorn/no-array-sort": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "off",
      "react-refresh/only-export-components": "off",
      "no-empty-pattern": "off",
      "no-useless-catch": "warn",
      "no-empty": "warn",
      "unicorn/prefer-includes": "off",
      "unicorn/custom-error-definition": "off",
      "no-console": [
        "error",
        {
          allow: ["warn", "error"],
        },
      ],
    },
  },
  {
    files: ["**/*.json", "**/*.jsonc"],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc: jsonc as any,
    },
    rules: {
      "jsonc/sort-keys": [
        "error",
        {
          pathPattern: ".*",
          order: { type: "asc" },
        },
      ],
      "jsonc/sort-array-values": [
        "error",
        {
          pathPattern: ".*",
          order: { type: "asc" },
        },
      ],
    },
  },
]);
