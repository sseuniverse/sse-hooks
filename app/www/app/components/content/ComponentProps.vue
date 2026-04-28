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

const primitiveReturn = computed(() => {
  if (props.type !== "returns") return null;
  if (metaData.value.length > 0) return null;

  const rt = meta?.api?.returnType;
  if (rt && !rt.properties) {
    return {
      type: rt.name || "void",
      description: rt.description || "",
    };
  }

  return null;
});
</script>

<template>
  <div class="my-4">
    <ProseTable v-if="metaData && metaData.length > 0">
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

    <div v-else-if="primitiveReturn" class="flex flex-col gap-1.5 mt-2">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-700 dark:text-gray-300 font-semibold"
          >Type:</span
        >
        <HighlightInlineType :type="primitiveReturn.type" />
      </div>

      <MDC
        v-if="primitiveReturn.description"
        :value="primitiveReturn.description"
        class="text-gray-600 dark:text-gray-400 text-sm [&_p]:m-0"
        :cache-key="`${kebabCase(name)}-primitive-return-description`"
      />
    </div>

    <div
      v-else
      class="text-sm text-gray-500 italic py-4 border rounded-md px-4 dark:border-gray-800"
    >
      {{
        props.type === "returns"
          ? "This hook does not return any specific value."
          : "This hook does not accept any parameters."
      }}
    </div>
  </div>
</template>
