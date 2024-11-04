import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: [
      "packages/java-parser/samples",
      "packages/prettier-plugin-java/samples",
      "packages/prettier-plugin-java/test-samples",
      "**/node_modules",
      "packages/prettier-plugin-java/dist",
      "**/babel.config.js",
      "website/.docusaurus"
    ]
  },
  ...compat.extends("eslint:recommended"),
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 2020,
      sourceType: "module"
    },
    rules: {
      "no-fallthrough": "off",
      curly: "error",
      "no-else-return": "error",
      "no-inner-declarations": "error",
      "no-unneeded-ternary": "error",
      "no-useless-return": "error",
      "no-console": "error",
      "no-var": "error",
      "one-var": ["error", "never"],
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "react/no-deprecated": "off",
      strict: "error",
      "symbol-description": "error",
      yoda: [
        "error",
        "never",
        {
          exceptRange: true
        }
      ]
    }
  },
  {
    files: ["packages/*/test/**/*.js"],
    languageOptions: {
      globals: {
        context: true,
        describe: true,
        it: true,
        before: true,
        after: true
      }
    },
    rules: {
      strict: "off"
    }
  }
];
