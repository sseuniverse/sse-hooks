import type { ContentNavigationItem } from "@nuxt/content";
import { findPageChildren, findPageBreadcrumb } from "@nuxt/content/utils";
import { mapContentNavigation } from "@nuxt/ui/utils/content";

const categories = {
  hooks: [
    { id: "sensors", title: "Sensors" },
    { id: "state", title: "State" },
    { id: "effect", title: "Side Effects" },
    { id: "lifecycle", title: "LifeCycle" },
    { id: "dom", title: "DOM & UI" },
    { id: "storage", title: "Storage" },
    { id: "network", title: "Network" },
    { id: "form", title: "Form" },
    { id: "animation", title: "Animation" },
    { id: "utilities", title: "Utilities" },
    { id: "uncategorized", title: "Uncategorized" },
  ],
} as const;

function groupChildrenByCategory(
  items: ContentNavigationItem[],
  slug: string,
): ContentNavigationItem[] {
  if (!items || !items.length) {
    return [];
  }

  const groups: ContentNavigationItem[] = [];
  const categorized: Record<string, ContentNavigationItem[]> = {};
  const uncategorized: ContentNavigationItem[] = [];

  // Categorize items
  for (const item of items) {
    if (item.category) {
      const cat = item.category as string;
      categorized[cat] = categorized[cat] || [];
      categorized[cat].push(item);
    } else {
      uncategorized.push(item);
    }
  }

  // Handle uncategorized items (Overview)
  if (uncategorized.length) {
    const withChildren = uncategorized
      .filter((item) => item.children?.length)
      .map((item) => ({
        ...item,
        children: item.children?.map((child) => ({
          ...child,
          icon: undefined,
        })),
      }));

    const withoutChildren = uncategorized.filter(
      (item) => !item.children?.length,
    );

    if (withoutChildren.length) {
      groups.push({
        title: "Overview",
        path: `/docs/${slug}`,
        children: withoutChildren.map((item) => ({
          ...item,
          icon: undefined,
        })),
      });
    }

    groups.push(...withChildren);
  }

  for (const category of categories[slug as keyof typeof categories] || []) {
    if (categorized[category.id]?.length) {
      groups.push({
        title: category.title,
        path: `/docs/${slug}`,
        children: categorized[category.id],
      });
    }
  }

  return groups;
}

function processNavigationItem(
  item: ContentNavigationItem,
  parent?: ContentNavigationItem,
): ContentNavigationItem | ContentNavigationItem[] {
  if (item.shadow) {
    return (
      item.children?.flatMap((child) => processNavigationItem(child, item)) ||
      []
    );
  }

  return {
    ...item,
    title: parent?.title ? parent.title : item.title,
    badge: parent?.badge || item.badge,
    children: item.children?.length
      ? item.children?.flatMap((child) => processNavigationItem(child))
      : undefined,
  };
}

export const useNavigation = (
  navigation: Ref<ContentNavigationItem[] | undefined>,
) => {
  const rootNavigation = computed(
    () =>
      navigation.value?.[0]?.children?.map((item) =>
        processNavigationItem(item),
      ) as ContentNavigationItem[],
  );

  const searchNavigation = computed(() => {
    if (!navigation.value) return [];
    // Start with the top-level docs children
    const root = navigation.value[0]?.children || navigation.value;
    const groups: ContentNavigationItem[] = [];

    root.forEach((node) => {
      if (
        node.path === "/docs/hooks" ||
        node.title?.toLowerCase() === "hooks"
      ) {
        const categorized: Record<string, ContentNavigationItem[]> = {};
        const uncategorized: ContentNavigationItem[] = [];

        (node.children || []).forEach((hook) => {
          const cat = hook.category as string;
          if (cat) {
            categorized[cat] = categorized[cat] || [];
            categorized[cat].push(hook);
          } else {
            uncategorized.push(hook);
          }
        });

        categories.hooks.forEach((catDef) => {
          if (categorized[catDef.id]?.length) {
            groups.push({
              title: catDef.title,
              path: `/docs/hooks#${catDef.id}`,
              children: categorized[catDef.id],
            });
          }
        });

        if (uncategorized.length) {
          groups.push({
            title: "Uncategorized",
            path: "/docs/hooks#uncategorized",
            children: uncategorized,
          });
        }
      } else {
        groups.push(node);
      }
    });

    return groups;
  });

  const navigationByCategory = computed(() => {
    const route = useRoute();
    const slug = route.params.slug?.[0] as string;

    // Adjust this path if your docs are not strictly under /docs/
    const children = findPageChildren(navigation?.value, `/docs/${slug}`, {
      indexAsChild: true,
    });

    return groupChildrenByCategory(children, slug);
  });

  function findSurround(
    path: string,
  ): [ContentNavigationItem | undefined, ContentNavigationItem | undefined] {
    const flattenNavigation =
      navigationByCategory.value?.flatMap((item) => item.children) ?? [];

    const index = flattenNavigation.findIndex((item) => item?.path === path);
    if (index === -1) {
      return [undefined, undefined];
    }

    return [flattenNavigation[index - 1], flattenNavigation[index + 1]];
  }

  function findBreadcrumb(path: string) {
    const breadcrumb = findPageBreadcrumb(navigation?.value, path, {
      indexAsChild: true,
    });

    return (
      mapContentNavigation(breadcrumb)?.map(({ icon, ...link }) => link) || []
    );
  }

  return {
    rootNavigation,
    navigationByCategory,
    searchNavigation,
    findSurround,
    findBreadcrumb,
  };
};
