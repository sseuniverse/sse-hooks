<script setup lang="ts">
import { kebabCase } from 'scule'
import type { HookProperty } from '~/composables/fetchComponentMeta'

const props = defineProps<{
  prop: HookProperty
}>()

const route = useRoute()

// Ensure tags are evaluated safely.
const links = computed(() => props.prop.tags?.filter((tag: { name: string }) => tag.name === 'link' || tag.name === 'see'))
</script>

<template>
  <ProseUl v-if="links?.length">
    <ProseLi v-for="(link, index) in links" :key="index">
      <MDC :value="link.text ?? ''" class="my-1" :cache-key="`${kebabCase(route.path)}-${prop.name}-link-${index}`" />
    </ProseLi>
  </ProseUl>
</template>