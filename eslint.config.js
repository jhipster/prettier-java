import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    languageOptions: {
      globals: globals.node
    }
  },
  eslint.configs.recommended,
  tseslint.configs.recommended
);
