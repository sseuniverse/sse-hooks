<script setup lang="ts">
import { camelCase, kebabCase } from 'scule'

const props = defineProps<{
  prefix?: string
}>()

const route = useRoute()
const name = route.path.split('/').pop() ?? ''
const camelName = camelCase(name)
const kebabName = kebabCase(name)

const { data: commits } = await useLazyFetch<any[]>('/api/github/commits', {
  key: `hook-changelog-${name}`,
  query: {
    // We target the specific camelCase folder and its potential sub-folders
    path: [
      `packages/hooks/src/${camelName}/${camelName}.ts`,
      `packages/hooks/src/${camelName}/index.ts`,
      `packages/hooks/src/${camelName}/utils`,
      `packages/hooks/src/${camelName}/misc`
    ]
  }
})

function normalizeCommitMessage(commit: { sha: string, message: string }) {
  const repoUrl = 'https://github.com/sseuniverse/sse-hooks';
  const prefix = `[\`${commit.sha.slice(0, 5)}\`](${repoUrl}/commit/${commit.sha})`
  
  // Clean up message and format links/code
  const content = commit.message
    .replace(/\(.*?\)/, '') 
    .replace(/#(\d+)/g, `<a href='${repoUrl}/issues/$1' class="text-primary-500">#$1</a>`)
    .replace(/`(.*?)`/g, '<code class="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')

  return `${prefix} — ${content}`
}
</script>

<template>
  <div v-if="!commits?.length" class="text-sm text-gray-500 py-4 italic">
    No recent changes.
  </div>

  <div v-else class="flex flex-col gap-2 relative mt-4">
    <div class="bg-gray-200 dark:bg-gray-800 w-px h-full absolute left-[11px] top-2 z-[-1]" />

    <div v-for="commit of commits" :key="commit.sha" class="flex gap-3 items-start">
      <div class="bg-primary-500 ring-4 ring-white dark:ring-gray-950 size-2 mt-1.5 mx-[7px] rounded-full shrink-0" />
      
      <MDC 
        :value="normalizeCommitMessage(commit)" 
        class="text-sm leading-6 [&_a]:underline" 
        tag="div" 
      />
    </div>
  </div>
</template>