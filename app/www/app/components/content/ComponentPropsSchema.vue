<script setup lang="ts">
import { kebabCase } from "scule";
import type {
  HookProperty,
  HookTypeMeta,
} from "~/composables/fetchComponentMeta";

const props = defineProps<{
  prop: HookProperty | HookTypeMeta | Record<string, any>;
  ignore?: string[];
}>();

const route = useRoute();
const hookName = route.path.split("/").pop() ?? "";

const schemaProps = computed(() => {
  const propsArray = props.prop?.properties || props.prop?.schema;
  if (!propsArray || !Array.isArray(propsArray)) {
    return [];
  }

  return propsArray
    .filter((p: any) => !props.ignore?.includes(p.name))
    .map((p: any) => {
      let description = p.description || "";
      const def = p.defaultValue ?? p.default;

      // If a default value exists, append it to the description just like SSE Hooks
      if (def && def !== "undefined") {
        const defaultText = `Defaults to \`${def}\`.`;
        description = description
          ? `${description} ${defaultText}`
          : defaultText;
      }

      return {
        ...p,
        description,
        displayType: p.type || "any",
      };
    });
});
</script>

<template>
  <ProseCollapsible v-if="schemaProps?.length" class="mt-2 mb-0">
    <ProseUl class="space-y-3">
      <ProseLi v-for="schemaProp in schemaProps" :key="schemaProp.name">
        <div class="flex flex-col gap-1.5 mt-1">
          <HighlightInlineType
            :type="`${schemaProp.name}${schemaProp.isOptional || schemaProp.required === false ? '?' : ''}: ${schemaProp.displayType}`"
          />

          <MDC
            v-if="schemaProp.description"
            :value="schemaProp.description"
            class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed"
            tag="div"
            :cache-key="`${kebabCase(hookName)}-${prop.name || 'schema'}-prop-${schemaProp.name}-description`"
          />

          <ComponentPropsSchema
            v-if="schemaProp.properties?.length || schemaProp.schema?.length"
            :prop="schemaProp"
          />
        </div>
      </ProseLi>
    </ProseUl>
  </ProseCollapsible>
</template>
