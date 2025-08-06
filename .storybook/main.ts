import type { StorybookConfig } from "@nuxtjs/storybook";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook-vue/nuxt",
    options: {},
  },
  viteFinal: async (config) => {
    // Prevent Nuxt from trying to fetch app manifest in Storybook
    if (config.define) {
      config.define["process.env.STORYBOOK"] = JSON.stringify(true);
    }
    else {
      config.define = {
        "process.env.STORYBOOK": JSON.stringify(true),
      };
    }
    return config;
  },
};
export default config;
