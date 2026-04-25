<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    slug?: string;
    collapse?: boolean;
  }>(),
  {
    collapse: false,
  },
);

const route = useRoute();
const name = props.slug ?? route.path.split("/").pop() ?? "";

const { data: codes } = await useAsyncData(
  `fetch-example-${name}`,
  async () => {
    const url = `https://raw.githubusercontent.com/sseuniverse/sse-hooks/main/examples/${name}.tsx`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Example not found");
    }

    const tsxSource = await response.text();
    return {
      ts: tsxSource,
    };
  },
);

const exampleCodeGroupMarkdown = computed(() => {
  if (!codes.value) return "";

  let md = "";
  if (props.collapse) {
    md += "::code-collapse\n";
  }

  md += `
\`\`\`tsx [example.tsx]
${codes.value.ts.trim()}
\`\`\`
`;

  // Close the collapse block if it was opened
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
