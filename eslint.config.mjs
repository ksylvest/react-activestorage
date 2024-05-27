import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintconfigprettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintconfigprettier,
];
