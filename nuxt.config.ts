// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint"],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon/favicon-96x96.png" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon/apple-touch-icon.png" },
        { rel: "manifest", href: "/favicon/site.webmanifest" },
      ],
      meta: [
        { name: "apple-mobile-web-app-title", content: "Pianopal" },
      ],
    },
  },
  compatibilityDate: "2025-05-15",
  eslint: {
    config: {
      standalone: false,
    },
  },
});
