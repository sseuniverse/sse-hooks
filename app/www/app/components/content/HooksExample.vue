<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    slug?: string;
    collapse?: boolean;
  }>(),
  {
    collapse: true,
  },
);

const route = useRoute();
const name = props.slug ?? route.path.split("/").pop() ?? "";

// Fetching from your local API registry
const { data: codes } = await useAsyncData(
  `fetch-example-${name}`,
  () => $fetch(`/api/registry/hook/${name}/example`)
);

const exampleCodeGroupMarkdown = computed(() => {
  if (!codes.value) return "";

  let md = "";
  
  if (props.collapse) {
    md += "::code-collapse\n";
  }

  md += `
::code-group{sync="type"}
\`\`\`tsx [example.tsx]
${codes.value.ts.trim()}
\`\`\`
\`\`\`jsx [example.jsx]
${codes.value.js.trim()}
\`\`\`
::
`;

  if (props.collapse) {
    md += "::\n";
  }

  return md;
});
</script>

<template>
  <div class="my-5">
    <MDC
      v-if="codes"
      :value="exampleCodeGroupMarkdown"
      :cache-key="`hooks-code-${name}-${collapse}`"
    />
    <div
      v-else
      class="text-sm text-gray-500 italic py-4 border rounded-md px-4 dark:border-gray-800"
    >
      Example is not available for this hook.
    </div>
  </div>
</template>