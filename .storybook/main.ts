import type { StorybookConfig } from "@nuxtjs/storybook";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook-vue/nuxt",
    options: {},
  },
  docs: {
    defaultName: "Documentation",
  },
  viteFinal: async (config) => {
    // Define Storybook environment
    config.define ||= {};
    config.define["process.env.STORYBOOK"] = JSON.stringify(true);
    config.define["import.meta.client"] = JSON.stringify(true);
    config.define["process.client"] = JSON.stringify(true);

    // Mock Nuxt-specific modules
    config.resolve ||= {};
    config.resolve.alias ||= {};
    config.resolve.alias["@nuxt/image"] = false;
    config.resolve.alias["@nuxt/icon"] = false;

    // Mock fetch for Nuxt manifest requests
    if (config.server) {
      config.server.proxy ||= {};
      config.server.proxy["/_nuxt/builds/meta/storybook.json"] = {
        target: "http://localhost:6007",
        changeOrigin: true,
        rewrite: () => "/public/_nuxt/builds/meta/storybook.json",
      };
    }

    return config;
  },
};

export default config;
