<script setup lang="ts">
import { kebabCase } from "scule";
import { fetchHookMeta } from "~/composables/fetchComponentMeta";

const props = defineProps<{
  slug?: string;
  ignore?: string[];
}>();

const route = useRoute();
const name = props.slug ?? route.path.split("/").pop() ?? "";
const meta = await fetchHookMeta(name);

const typesData = computed(() => {
  const src = meta?.api?.types || meta?.types;
  if (!src) return [];
  return src.filter((t: any) => !props.ignore?.includes(t.name));
});

const formatUnion = (values: string[]) => {
  if (!values || values.length === 0) return "any";
  if (values.length <= 3 && values.join(" | ").length < 40) {
    return values.join(" | ");
  }

  return `\n  | ` + values.join(`\n  | `);
};
</script>

<template>
  <div v-if="typesData.length" class="space-y-16">
    <div
      v-for="typeDef in typesData"
      :key="typeDef.name"
      class="scroll-mt-32 flex flex-col gap-4"
      :id="kebabCase(typeDef.name)"
    >
      <div>
        <div class="flex items-center gap-3">
          <ProseH4 :id="kebabCase(typeDef.name)" class="!my-0">
            {{ typeDef.name }}
          </ProseH4>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 capitalize"
          >
            {{ typeDef.kind === "alias" ? "type" : typeDef.kind }}
          </span>
        </div>
        <MDC
          v-if="typeDef.description"
          :value="typeDef.description"
          class="text-gray-500 dark:text-gray-400 text-sm mt-2"
        />
      </div>

      <ProseTable v-if="typeDef.kind === 'interface'">
        <ProseThead>
          <ProseTr>
            <ProseTh>Property</ProseTh>
            <ProseTh>Type</ProseTh>
          </ProseTr>
        </ProseThead>
        <ProseTbody>
          <ProseTr
            v-for="prop in typeDef.properties || typeDef.schema"
            :key="prop.name"
          >
            <ProseTd>
              <ProseCode>
                {{ prop.name
                }}{{ prop.isOptional || prop.required === false ? "?" : "" }}
              </ProseCode>
            </ProseTd>
            <ProseTd>
              <div class="flex flex-col gap-1.5">
                <HighlightInlineType :type="prop.type" />
                <MDC
                  v-if="prop.description"
                  :value="prop.description"
                  class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed"
                />
                <ComponentPropsSchema
                  v-if="prop.properties?.length || prop.schema?.length"
                  :prop="prop"
                />
              </div>
            </ProseTd>
          </ProseTr>
        </ProseTbody>
      </ProseTable>

      <ProseTable v-else-if="typeDef.kind === 'enum'">
        <ProseThead>
          <ProseTr>
            <ProseTh>Member</ProseTh>
            <ProseTh>Value</ProseTh>
            <ProseTh>Description</ProseTh>
          </ProseTr>
        </ProseThead>
        <ProseTbody>
          <ProseTr v-for="member in typeDef.members" :key="member.name">
            <ProseTd>
              <ProseCode>{{ member.name }}</ProseCode>
            </ProseTd>
            <ProseTd>
              <HighlightInlineType
                :type="
                  typeof member.value === 'string'
                    ? `&quot;${member.value}&quot;`
                    : String(member.value)
                "
              />
            </ProseTd>
            <ProseTd>
              <MDC
                v-if="member.description"
                :value="member.description"
                class="text-gray-500 dark:text-gray-400 text-sm"
              />
              <span v-else class="text-gray-400">-</span>
            </ProseTd>
          </ProseTr>
        </ProseTbody>
      </ProseTable>

      <div v-else-if="typeDef.kind === 'union'" class="w-full">
        <MDC
          :value="`\`\`\`ts\ntype ${typeDef.name} = ${typeDef.values ? formatUnion(typeDef.values) : typeDef.type};\n\`\`\``"
        />
      </div>

      <div
        v-else-if="typeDef.kind === 'alias' || typeDef.kind === 'type'"
        class="w-full flex flex-col gap-4"
      >
        <MDC
          :value="`\`\`\`ts\ntype ${typeDef.name} = ${typeDef.type};\n\`\`\``"
        />
        <div
          v-if="typeDef.properties?.length || typeDef.schema?.length"
          class="mt-2"
        >
          <div
            class="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3"
          >
            Properties
          </div>
          <ComponentPropsSchema :prop="typeDef" />
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic py-4">
    No specific type aliases defined for this component.
  </div>
</template>
