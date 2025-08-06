// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

import env from "./lib/env";

// Skip env validation for Storybook

if (!env.STORYBOOK) {
  // eslint-disable-next-line ts/no-require-imports
  require("./lib/env");
}

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@nuxtjs/storybook",
  ],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
  colorMode: {
    dataValue: "theme",
  },
  // Disable SSR for Storybook to prevent manifest issues
  ssr: !env.STORYBOOK,
  // Disable app manifest feature to fix Storybook manifest errors
  experimental: {
    appManifest: !env.STORYBOOK,
  },
  // Storybook specific configuration
  storybook: {
    host: "http://localhost",
    port: 6007,
  },
});
