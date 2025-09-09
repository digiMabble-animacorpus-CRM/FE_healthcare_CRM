// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      next: nextPlugin,
      prettier,
      "unused-imports": unusedImports,
    },
    extends: [
      "next/core-web-vitals",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
    ],
    rules: {
      // Remove unused imports
      "unused-imports/no-unused-imports": "error",

      // Allow unused vars prefixed with _
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Prettier
      "prettier/prettier": ["error"],
    },
  },
];
