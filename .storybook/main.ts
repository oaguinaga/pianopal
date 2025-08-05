import type { StorybookConfig } from "@nuxtjs/storybook";

const config: StorybookConfig = {
  stories: [
    "./**/*.mdx",
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
};
export default config;
