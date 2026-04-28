export function useHeader() {
  const route = useRoute();

  const desktopLinks = computed(() => [
    {
      label: "Docs",
      to: "/docs",
      active: route.path.startsWith("/docs/"),
    },
    {
      label: "Team",
      description: "Discover websites built with SSE Hooks.",
      to: "/team",
    },
    {
      label: "Blog",
      description: "Read the latest news and updates.",
      to: "/blog",
    },
    {
      label: "Releases",
      to: "/releases",
    },
  ]);

  const mobileLinks = computed(() => [
    {
      label: "Get Started",
      icon: "i-lucide-square-play",
      to: "/docs/getting-started",
      active: route.path.startsWith("/docs/getting-started"),
    },
    {
      label: "Hooks",
      icon: "i-lucide-square-function",
      to: "/docs/hooks",
      active: route.path.startsWith("/docs/hooks"),
    },
    {
      label: "Blog",
      icon: "i-lucide-newspaper",
      to: "/blog",
      active: route.path.startsWith("/blog"),
    },
    {
      label: "Team",
      icon: "i-lucide-user",
      description: "Discover websites built with SSE Hooks.",
      to: "/team",
    },
    {
      label: "Releases",
      icon: "i-lucide-rocket",
      to: "/releases",
    },
    {
      label: "GitHub",
      to: "https://github.com/sseuniverse/sse-hooks",
      icon: "i-simple-icons-github",
      target: "_blank",
    },
  ]);

  return {
    desktopLinks,
    mobileLinks,
  };
}
