<script setup lang="ts">
import { kebabCase } from 'scule'
import { fetchHookMeta } from "~/composables/fetchComponentMeta"

const props = defineProps<{
  slug?: string
  ignore?: string[]
}>()

const route = useRoute()
const name = props.slug ?? route.path.split('/').pop() ?? ''

const meta = await fetchHookMeta(name)

const typesData = computed(() => {
  if (!meta?.types) return []
  return meta.types.filter((t: any) => !props.ignore?.includes(t.name))
})
</script>

<template>
    <div v-if="typesData.length" class="space-y-12">
      <div v-for="typeDef in typesData" :key="typeDef.name" class="scroll-mt-32" :id="kebabCase(typeDef.name)">
        <ProseH4 :id="kebabCase(typeDef.name)">
          {{ typeDef.name }}
        </ProseH4>
        <MDC v-if="typeDef.description" :value="typeDef.description" class="text-gray-500 dark:text-gray-400 text-sm mb-4" />

        <ProseTable v-if="typeDef.kind === 'interface'">
          <ProseThead>
            <ProseTr>
              <ProseTh>Property</ProseTh>
              <ProseTh>Type</ProseTh>
            </ProseTr>
          </ProseThead>
          <ProseTbody>
            <ProseTr v-for="prop in typeDef.properties" :key="prop.name">
              <ProseTd>
                <ProseCode>{{ prop.name }}{{ !prop.required ? '?' : '' }}</ProseCode>
              </ProseTd>
              <ProseTd>
                <div class="flex flex-col gap-1">
                  <HighlightInlineType :type="prop.rawType || prop.type" />
                  <MDC v-if="prop.description" :value="prop.description" class="text-gray-500 dark:text-gray-400 text-sm" />
                  <ComponentPropsSchema v-if="prop.schema?.length" :prop="prop" />
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
                <HighlightInlineType :type="typeof member.value === 'string' ? `&quot;${member.value}&quot;` : String(member.value)" />
              </ProseTd>
              <ProseTd>
                <MDC v-if="member.description" :value="member.description" class="text-gray-500 dark:text-gray-400 text-sm" />
                <span v-else class="text-gray-400">-</span>
              </ProseTd>
            </ProseTr>
          </ProseTbody>
        </ProseTable>

        <div v-else-if="typeDef.kind === 'type'" class="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <HighlightInlineType :type="`type ${typeDef.name} = ${typeDef.rawType || typeDef.type}`" />
          <div v-if="typeDef.schema?.length" class="mt-4">
            <ComponentPropsSchema :prop="typeDef" />
          </div>
        </div>

      </div>
    </div>

    <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic py-4">
      No specific type aliases defined for this component.
    </div>
</template>