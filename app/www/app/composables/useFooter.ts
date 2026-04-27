type Links = {
  label: string;
  to: string;
};

export function useFooter() {
  const links: Links[] = [
    { label: "Hooks", to: "/docs/hooks" },
    { label: "Release", to: "/releases" },
  ];

  return { links };
}
