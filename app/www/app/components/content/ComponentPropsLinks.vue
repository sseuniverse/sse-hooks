<script setup lang="ts">
import { kebabCase } from "scule";
import type { HookProperty } from "~/composables/fetchComponentMeta";

const props = defineProps<{
  prop: HookProperty;
}>();

const route = useRoute();

// Updated to safely extract strings out of the new Record<string, string|boolean> tag dictionary format
const links = computed(() => {
  const tags = props.prop.tags;
  if (!tags || typeof tags !== "object") return [];

  const extractedLinks: string[] = [];
  if (typeof tags.link === "string") extractedLinks.push(tags.link);
  if (typeof tags.see === "string") extractedLinks.push(tags.see);

  return extractedLinks;
});
</script>

<template>
  <ProseUl v-if="links?.length">
    <ProseLi v-for="(link, index) in links" :key="index">
      <MDC
        :value="link"
        class="my-1"
        :cache-key="`${kebabCase(route.path)}-${prop.name}-link-${index}`"
      />
    </ProseLi>
  </ProseUl>
</template>
