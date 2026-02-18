<script setup lang="ts">
import { kebabCase } from 'scule'
import type { HookProperty, HookTypeMeta } from '~/composables/fetchComponentMeta'

const props = defineProps<{
  // 1. Broaden the type to accept our new standalone types
  prop: HookProperty | HookTypeMeta | Record<string, any>
  ignore?: string[]
}>()

const route = useRoute()
const hookName = route.path.split('/').pop() ?? ''

const schemaProps = computed(() => {
  // 2. Safely check if schema exists and is an array
  if (!props.prop?.schema || !Array.isArray(props.prop.schema)) {
    return []
  }

  return props.prop.schema
    .filter((p: any) => !props.ignore?.includes(p.name))
    .map((p: any) => {
      let description = p.description || ''
      
      if (p.default) {
        description = description ? `${description} Defaults to \`${p.default}\`{lang="ts-type"}.` : `Defaults to \`${p.default}\`{lang="ts-type"}.`
      }

      return {
        ...p,
        description,
        // 3. Fallback to 'any' to avoid rendering undefined strings in the UI
        displayType: p.rawType || p.type || 'any'
      }
    })
})
</script>

<template>
  <ProseCollapsible v-if="schemaProps?.length" class="mt-1 mb-0">
    <ProseUl>
      <ProseLi v-for="schemaProp in schemaProps" :key="schemaProp.name">
        <HighlightInlineType :type="`${schemaProp.name}${!schemaProp.required ? '?' : ''}: ${schemaProp.displayType}`" />

        <MDC v-if="schemaProp.description" :value="schemaProp.description" class="text-gray-500 dark:text-gray-400 text-sm mt-1" :cache-key="`${kebabCase(hookName)}-${prop.name || 'schema'}-${schemaProp.name}-description`" />
        
        <ComponentPropsSchema v-if="schemaProp.schema?.length" :prop="schemaProp" />
      </ProseLi>
    </ProseUl>
  </ProseCollapsible>
</template>