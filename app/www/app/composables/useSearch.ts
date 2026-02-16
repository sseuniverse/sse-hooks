import type { UIMessage } from "ai";

export function useSearch() {
  const route = useRoute();

  const chat = ref(false);
  const fullscreen = ref(false);
  const searchTerm = ref("");
  const messages = ref<UIMessage[]>([]);

  function onSelect(e: any) {
    e.preventDefault();

    messages.value = searchTerm.value
      ? [
          {
            id: "1",
            role: "user",
            parts: [{ type: "text", text: searchTerm.value }],
          },
        ]
      : [
          {
            id: "1",
            role: "assistant",
            parts: [{ type: "text", text: "Hello, how can I help you today?" }],
          },
        ];

    chat.value = true;
  }

  const links = computed(() =>
    [
      !searchTerm.value && {
        label: "Ask AI",
        description:
          "Ask the AI assistant powered by our custom MCP server for help.",
        icon: "i-lucide-bot",
        ui: {
          itemLeadingIcon:
            "group-data-highlighted:not-group-data-disabled:text-primary",
        },
        onSelect,
      },
      {
        label: "Get Started",
        description: "Learn how to get started with Nuxt UI.",
        icon: "i-lucide-square-play",
        to: "/docs/getting-started",
        active: route.path.startsWith("/docs/getting-started"),
      },
      {
        label: "Hooks",
        description: "Learn how to use the hooks available in Nuxt UI.",
        icon: "i-lucide-square-function",
        to: "/docs/hooks",
        active: route.path.startsWith("/docs/hooks"),
      },
      {
        label: "Releases",
        description:
          "Stay up to date with the newest features, enhancements, and fixes for Nuxt UI.",
        icon: "i-lucide-rocket",
        to: "/releases",
      },
      {
        label: "GitHub",
        description:
          "Check out the Nuxt UI repository and follow development on GitHub.",
        icon: "i-simple-icons-github",
        to: "https://github.com/nuxt/ui/releases",
        target: "_blank",
      },
    ].filter((link) => !!link),
  );

  const groups = computed(() => [
    {
      id: "ai",
      label: "AI",
      ignoreFilter: true,
      postFilter: (searchTerm: string, items: any[]) => {
        if (!searchTerm) {
          return [];
        }

        return items;
      },
      items: [
        {
          label: "Ask AI",
          icon: "i-lucide-bot",
          ui: {
            itemLeadingIcon:
              "group-data-highlighted:not-group-data-disabled:text-primary",
          },
          onSelect,
        },
      ],
    },
  ]);

  return {
    links,
    groups,
    chat,
    fullscreen,
    searchTerm,
    messages,
  };
}
