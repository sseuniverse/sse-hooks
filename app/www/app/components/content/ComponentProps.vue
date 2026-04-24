<script setup lang="ts">
import { kebabCase } from "scule";
import {
  fetchHookMeta,
  type HookProperty,
} from "~/composables/fetchComponentMeta";

const props = withDefaults(
  defineProps<{
    slug?: string;
    ignore?: string[];
    prose?: boolean;
    type?: "props" | "returns";
  }>(),
  {
    ignore: () => [],
    type: "props",
  },
);

const route = useRoute();

const name = props.slug ?? route.path.split("/").pop() ?? "";
const meta = await fetchHookMeta(name);

const metaData = computed(() => {
  const sourceData =
    props.type === "returns"
      ? meta?.api?.returnType?.properties || meta?.returns
      : meta?.api?.parameters || meta?.props;

  if (!sourceData || !Array.isArray(sourceData)) {
    return [];
  }

  return sourceData
    .filter((item: HookProperty) => !props.ignore?.includes(item.name))
    .map((item: HookProperty) => {
      return {
        ...item,
        displayType: item.type,
      };
    })
    .sort((a, b) => {
      if (a.name === "options") return -1;
      if (b.name === "options") return 1;
      return 0;
    });
});
</script>

<template>
  <ProseTable>
    <ProseThead>
      <ProseTr>
        <ProseTh>
          {{ props.type === "returns" ? "Return Value" : "Parameter" }}
        </ProseTh>
        <ProseTh> Default </ProseTh>
        <ProseTh> Type </ProseTh>
      </ProseTr>
    </ProseThead>
    <ProseTbody>
      <ProseTr v-for="item in metaData" :key="item.name">
        <ProseTd>
          <ProseCode>
            {{ item.name }}
          </ProseCode>
        </ProseTd>
        <ProseTd>
          <HighlightInlineType
            v-if="item.defaultValue || item.default"
            :type="item.defaultValue || item.default"
          />
          <span v-else>-</span>
        </ProseTd>
        <ProseTd>
          <div class="flex flex-col gap-1">
            <HighlightInlineType :type="item.displayType" />

            <MDC
              v-if="item.description"
              :value="item.description"
              class="text-gray-500 dark:text-gray-400 text-sm"
              :cache-key="`${kebabCase(name)}-${item.name}-description`"
            />

            <ComponentPropsLinks :prop="item" />
            <ComponentPropsSchema
              v-if="item.properties?.length || item.schema?.length"
              :prop="item"
            />
          </div>
        </ProseTd>
      </ProseTr>
    </ProseTbody>
  </ProseTable>
</template>
