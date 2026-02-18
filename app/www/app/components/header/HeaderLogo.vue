<script setup lang="ts">
const { header } = useAppConfig()
</script>

<template
      v-if="header?.logo?.dark || header?.logo?.light || header?.title"
      #title
    >
      <UColorModeImage
        v-if="header?.logo?.dark || header?.logo?.light"
        :light="header?.logo?.light!"
        :dark="header?.logo?.dark!"
        :alt="header?.logo?.alt"
        class="h-6 w-auto shrink-0"
      />

      <span v-else-if="header?.title" v-on:click="() => $router.push('/')" class="cursor-pointer font-bold text-lg">
        {{ header.title }}
      </span>
    </template>