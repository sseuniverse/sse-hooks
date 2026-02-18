<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: string
}>()

// Clean up the type string for cleaner UI display
const displayType = computed(() => {
  let t = props.type || ''

  // Clean up UI-specific Omits
  if (t.includes(', "as" | "asChild" | "forceMount">')) {
    t = t.replace(`, "as" | "asChild" | "forceMount">`, '').replace('Omit<', '')
  }
  if (t.includes(', "as" | "asChild">')) {
    t = t.replace(', "as" | "asChild">', '').replace('Omit<', '')
  }
  
  // Clean up redundant undefined types
  if (t.startsWith('undefined |')) {
    t = t.replace('undefined |', '').trim()
  }
  if (t.endsWith('| undefined')) {
    t = t.replace('| undefined', '').trim()
  }

  return t
})

// Use useAsyncData for SSR support to prevent UI flickering on load
const { data: ast } = await useAsyncData(
  `highlight-type-${props.type}`, 
  () => parseMarkdown(`\`\` ${displayType.value} \`\`{lang="ts-type"}`)
)
</script>

<template>
  <MDCRenderer v-if="ast" :body="ast?.body" :data="ast?.data" />
  <ProseCode v-else>
    {{ displayType }}
  </ProseCode>
</template>