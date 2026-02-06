<script setup lang="ts">
const config = useRuntimeConfig().public
const appConfig = useAppConfig()

const items = computed(() => {
  return [
    { label: `v1.x`, active: true, color: 'primary' as const, checked: true, type: 'checkbox' as const },
  ]
})
</script>

<template>
  <UDropdownMenu
    v-slot="{ open }"
    :modal="false"
    :items="items"
    :content="{ align: 'start' }"
    :ui="{ content: 'min-w-fit' }"
    size="xs"
  >
    <UButton
      :label="`v1.4.x`"
      variant="subtle"
      :trailing-icon="appConfig.ui.icons.chevronDown"
      size="xs"
      class="-mb-[6px] font-semibold rounded-full truncate"
      :class="[open && 'bg-primary/15']"
      :ui="{
        trailingIcon: ['transition-transform duration-200', open ? 'rotate-180' : undefined].filter(Boolean).join(' ')
      }"
    />
  </UDropdownMenu>
</template>