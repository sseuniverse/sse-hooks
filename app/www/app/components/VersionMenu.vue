<script setup lang="ts">
const { data: module } = await useFetch("/api/module.json");
</script>

<template>
  <UButton
    :label="module?.latest_release.tag"
    variant="subtle"
    size="xs"
    class="-mb-[6px] font-semibold rounded-full truncate"
  />
</template>
