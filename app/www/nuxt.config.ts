// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/content",
    "nuxt-og-image",
    "nuxt-llms",
    "@nuxtjs/mcp-toolkit",
  ],

  sourcemap: {
    server: false,
    client: false,
  },

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1,
        },
      },
    },
  },

  experimental: {
    asyncContext: true,
  },

  compatibilityDate: "2024-07-11",

  nitro: {
    prerender: {
      routes: ["/"],
      crawlLinks: true,
      autoSubfolderIndex: false,
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  icon: {
    provider: "iconify",
  },

  routeRules: {
    "/docs": { redirect: "/docs/getting-started", prerender: false },
    "/getting-started/**": {
      redirect: { to: "/docs/getting-started/**", statusCode: 301 },
      prerender: false,
    },
  },

  llms: {
    domain: "https://sse-hooks.vercel.app/", // Replace with your actual domain
    title: "SSE Hooks Documentation",
    description:
      "Documentation for sse-hooks, a modern, server-safe React hooks library.",
    full: {
      title: "SSE Hooks - Full Documentation",
      description:
        "The complete documentation for sse-hooks, including guides and API references.",
    },
    sections: [
      {
        title: "Getting Started",
        contentCollection: "docs",
        contentFilters: [
          { field: "path", operator: "LIKE", value: "/docs/getting-started%" },
        ],
      },
      {
        title: "Hooks",
        contentCollection: "docs",
        contentFilters: [
          // Matches content generated in the "2.hooks" folder (mapped to /hooks)
          { field: "path", operator: "LIKE", value: "/docs/hooks%" },
        ],
      },
    ],
  },

  mcp: {
    name: "SSE Hooks Docs",
  },
});
