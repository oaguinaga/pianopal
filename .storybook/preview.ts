import type { Preview } from "@nuxtjs/storybook";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
};

// Mock Nuxt runtime to prevent proxy errors
if (typeof window !== "undefined") {
  // Mock window.__NUXT__
  (window as any).__NUXT__ = {
    config: {
      app: {
        baseURL: "/",
        buildAssetsDir: "/_nuxt/",
      },
    },
    routeRules: {
      entries: () => [],
    },
    appManifest: {
      files: {},
      entrypoints: [],
    },
    isHydrating: false,
    data: {},
    state: {},
    serverRendered: false,
  };

  // Mock route rules matcher
  (window as any).__nuxtRouteRules = new Map();
  (window as any).__nuxtRouteRulesMatcher = {
    entries: () => [],
    matchAll: () => [],
  };

  // Mock fetch to handle Nuxt manifest requests
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.includes("/_nuxt/builds/meta/storybook.json")) {
      // Return mock manifest data
      return new Response(
        JSON.stringify({
          files: {},
          entrypoints: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return originalFetch(input, init);
  };
}

export default preview;
