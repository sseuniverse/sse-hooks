<script setup lang="ts">
import { kebabCase } from 'scule'
import { fetchHookMeta, type HookProperty } from "~/composables/fetchComponentMeta"

const props = withDefaults(defineProps<{
  slug?: string
  ignore?: string[]
  prose?: boolean
  type?: 'props' | 'returns'
}>(), {
  ignore: () => [],
  type: 'props'
})

const route = useRoute()

// Gets the hook name from the URL, e.g., 'use-boolean'
const name = props.slug ?? route.path.split('/').pop() ?? ''

const meta = await fetchHookMeta(name)

// Dynamically target 'props' or 'returns' based on the prop passed from Markdown
const metaData = computed(() => {
  const sourceData = props.type === 'returns' ? meta?.returns : meta?.props

  if (!sourceData) {
    return []
  }

  return sourceData.filter((item: HookProperty) => !props.ignore?.includes(item.name)).map((item: HookProperty) => {
    // Prefer the expanded rawType (e.g., '"a" | "b"') over the interface name if it exists
    const displayType = item.rawType || item.type

    return {
      ...item,
      displayType
    }
  }).sort((a, b) => {
    if (a.name === 'options') return -1
    if (b.name === 'options') return 1
    return 0
  })
})
</script>

<template>
  <ProseTable>
    <ProseThead>
      <ProseTr>
        <ProseTh>
          {{ props.type === 'returns' ? 'Return Value' : 'Prop' }}
        </ProseTh>
        <ProseTh>
          Default
        </ProseTh>
        <ProseTh>
          Type
        </ProseTh>
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
          <HighlightInlineType v-if="item.default" :type="item.default" />
          <span v-else>-</span>
        </ProseTd>
        <ProseTd>
          <div class="flex flex-col gap-1">
            <HighlightInlineType :type="item.displayType" />
            
            <MDC v-if="item.description" :value="item.description" class="text-gray-500 dark:text-gray-400 text-sm" :cache-key="`${kebabCase(name)}-${item.name}-description`" />

            <ComponentPropsLinks :prop="item" />

            <ComponentPropsSchema v-if="item.schema?.length" :prop="item" />
          </div>
        </ProseTd>
      </ProseTr>
    </ProseTbody>
  </ProseTable>
</template>