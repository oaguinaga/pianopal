import antfu from "@antfu/eslint-config";

import withNuxt from "./.nuxt/eslint.config.mjs";
// @ts-check

// TODO: add tailwindcss plugin

export default withNuxt(
  antfu(
    {
      type: "app",
      vue: true,
      typescript: true,
      formatters: true,
      stylistic: {
        indent: 2,
        semi: true,
        quotes: "double",
      },
      ignores: [".pnpm-store/**", "**/migrations/*", "public/**"],
    },
    {
      rules: {
        "vue/max-attributes-per-line": ["error", {
          singleline: {
            max: 2,
          },
          multiline: {
            max: 1,
          },
        }],
        "ts/no-redeclare": "off",
        "ts/consistent-type-definitions": ["error", "type"],
        "no-console": ["warn"],
        "antfu/no-top-level-await": ["off"],
        "node/prefer-global/process": ["off"],
        "node/no-process-env": ["error"],
        "unicorn/filename-case": ["error", {
          case: "kebabCase",
          ignore: ["README.md"],
        }],
      },
    },
  ),
)
;
