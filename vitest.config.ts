import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Test discovery patterns
    include: [
      "tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/coverage/**",
      "**/.git/**",
    ],

    // Environment setup
    environment: "node",
    environmentOptions: {
      node: {
        // Node environment for utility testing
      },
    },

    // Global test setup
    globals: true,
    setupFiles: [
      "tests/unit/setup.ts",
    ],

    // Test execution
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },

    // Coverage configuration
    coverage: {
      provider: "v8",
      enabled: true,
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.nuxt/**",
        "**/.output/**",
        "**/coverage/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
        "**/stories/**",
      ],
      include: [
        "components/**/*.{vue,ts,js}",
        "composables/**/*.{ts,js}",
        "utils/**/*.{ts,js}",
        "constants/**/*.{ts,js}",
        "stores/**/*.{ts,js}",
      ],
    },

    // Test UI
    ui: true,

    // Watch mode
    watch: false,

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Sequence configuration
    sequence: {
      hooks: "list",
      setupFiles: "list",
    },
  },

  // Resolve aliases (matching Nuxt's auto-imports)
  resolve: {
    alias: {
      "~": resolve(__dirname, "."),
      "~/": resolve(__dirname, "./"),
      "@": resolve(__dirname, "."),
      "@/": resolve(__dirname, "./"),
      "#app": resolve(__dirname, "./.nuxt/app"),
      "#build": resolve(__dirname, "./.nuxt/build"),
      "#imports": resolve(__dirname, "./.nuxt/imports"),
      "#internal": resolve(__dirname, "./.nuxt/internal"),
    },
  },
});
