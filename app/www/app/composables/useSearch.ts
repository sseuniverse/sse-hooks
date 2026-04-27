import type { UIMessage } from "ai";
import { useChat } from "./useChat";

export function useSearch() {
  const route = useRoute();
  const searchTerm = ref("");
  const { open, messages } = useChat();

  function onSelect() {
    if (searchTerm.value) {
      messages.value = [
        ...messages.value,
        {
          id: String(Date.now()),
          role: "user",
          parts: [{ type: "text", text: searchTerm.value }],
        },
      ];
    }

    open.value = true;
  }

  const links = computed(() =>
    [
      {
        label: "Ask AI",
        description:
          "Ask the AI assistant powered by our custom MCP server for help.",
        icon: "i-lucide-bot",
        kbds: ["meta", "i"],
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
        to: "https://github.com/sseuniverse/sse-hooks/releases",
        target: "_blank",
      },
    ].filter((link) => !!link),
  );

  return {
    links,
    searchTerm,
  };
}
