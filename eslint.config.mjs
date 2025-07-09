// @ts-check
import antfu, { ignores } from "@antfu/eslint-config";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  antfu(
    {
      type: "app",
      typescript: true,
      formatters: true,
      stylistic: {
        indent: 2,
        semi: true,
        quotes: "double",
      },

    },
    {
      rules: {
        "ts/no-redeclare": "off",
        "ts/consistent-type-definitions": ["error", "type"],
        "no-console": ["warn"],
        "antfu/no-top-level-await": ["off"],
        "node/prefer-global/process": ["off"],
        "node/no-process-env": ["error"],

        "perfectionist/sort-imports": ["error", {
          tsconfigRootDir: ".",
        }],
        "unicorn/filename-case": ["error", {
          case: "kebabCase",
          ignore: ["README.md"],
        }],
      },
    },
    ignores([
      "**/*.md",
      "**/*.json",
      "**/*.yaml",
      "**/*.yml",
      "**/*.yml",
      // binary files
      "**/*.ico",
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.gif",
      "**/*.svg",
    ]),
  ),
  // Your custom configs here
);
