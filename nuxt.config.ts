// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

// Skip env validation for Storybook
// eslint-disable-next-line node/no-process-env
if (!process.env.STORYBOOK) {
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
});
