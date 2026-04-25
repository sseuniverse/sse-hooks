<script setup lang="ts">
import { fetchHookMeta } from "~/composables/fetchComponentMeta";

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
const meta = await fetchHookMeta(name);

const codeGroupMarkdown = computed(() => {
  if (!meta?.file) return "";

  let md = "";
  if (props.collapse) {
    md += "::code-collapse\n";
  }

  md += `::code-group{sync="type"}

\`\`\`ts [${name}.ts]
${meta.file.content.trim()}
\`\`\`

\`\`\`js [${name}.js]
${meta.file.js.trim()}
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
      v-if="meta?.file"
      :value="codeGroupMarkdown"
      :cache-key="`hooks-code-${name}-${collapse}`"
    />
    <div
      v-else
      class="text-sm text-gray-500 italic py-4 border rounded-md px-4 dark:border-gray-800"
    >
      Source code is not available for this hook.
    </div>
  </div>
</template>
