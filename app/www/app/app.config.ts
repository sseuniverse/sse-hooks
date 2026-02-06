export default defineAppConfig({
  ui: {
    // colors: {
    //   primary: 'green',
    //   neutral: 'slate'
    // },
    footer: {
      slots: {
        root: "border-t border-default",
        left: "text-sm text-muted",
      },
    },
  },
  theme: {
    radius: 0.25,
    blackAsPrimary: false,
    icons: "lucide",
    font: "Public Sans",
  },
  seo: {
    siteName: "SSE Hooks Docs",
  },
  header: {
    title: "SSE Hooks",
    to: "/",
    logo: {
      alt: "",
      light: "",
      dark: "",
    },
    search: true,
    colorMode: true,
    links: [
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/sseuniverse/sse-hooks",
        target: "_blank",
        "aria-label": "GitHub",
      },
    ],
  },
  footer: {
    credits: `Built with Love • © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [
      {
        icon: "i-simple-icons-discord",
        to: "https://discord.gg/N5RvjDbt",
        target: "_blank",
        "aria-label": "SSE Universe Discord",
      },
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/sseuniverse/sse-hooks",
        target: "_blank",
        "aria-label": "SSE Hooks on GitHub",
      },
    ],
  },
  toc: {
    title: "Table of Contents",
    bottom: {
      title: "Community",
      edit: "https://github.com/sseuniverse/sse-hooks/edit/main/app/www/content/docs",
      links: [
        {
          icon: "i-lucide-star",
          label: "Star on GitHub",
          to: "https://github.com/sseuniverse/sse-hooks",
          target: "_blank",
        },
      ],
    },
  },
  toaster: {
    position: "bottom-right" as const,
    duration: 5000,
    max: 5,
    expand: true,
  },
});
