<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

interface ContentSearchFile {
  id: string;
  title: string;
  titles: string[];
  level: number;
  content: string;
}

defineProps<{
  files?: ContentSearchFile[];
  navigation?: ContentNavigationItem[];
}>();

const { links, searchTerm } = useSearch();

watchDebounced(
  searchTerm,
  (term) => {
    if (term) {
      // track("Search Performed", { term });
    }
  },
  { debounce: 500 },
);
</script>

<template>
  <UContentSearch
    v-model:search-term="searchTerm"
    :links="links"
    :files="files"
    :navigation="navigation"
    :fuse="{ resultLimit: 30 }"
  />
</template>
