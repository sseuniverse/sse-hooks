<script setup lang="ts">
import { joinURL } from 'ufo'
import { kebabCase } from 'scule'
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()
const site = useSiteConfig()

definePageMeta({
  layout: 'docs'
})

// Fetch Page Data
const { data: page } = await useAsyncData(kebabCase(route.path), () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

// Navigation Logic
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const { findSurround, findBreadcrumb } = useNavigation(navigation!)

const breadcrumb = computed(() => findBreadcrumb(page.value?.path as string))
const surround = computed(() => findSurround(page.value?.path as string))

// SEO Metadata
const title = page.value?.seo?.title ?? page.value?.title
const description = page.value?.seo?.description ?? page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

// OG Image Generation
if (route.path.startsWith('/docs/components/')) {
  defineOgImageComponent('OgImageComponent', {
    title: page.value.title,
    description: page.value.description,
    component: (route.params.slug as string[]).pop() as string
  })
} else {
  defineOgImageComponent('Docs', {
    title: page.value.title,
    description: page.value.description,
    headline: breadcrumb.value?.[breadcrumb.value.length - 1]?.label || 'Docs'
  })
}

// Pre-render logic
const path = computed(() => route.path.replace(/\/$/, ''))
prerenderRoutes([joinURL('/raw', `${path.value}.md`)])

useHead({
  link: [
    {
      rel: 'alternate',
      href: joinURL(site.url, 'raw', `${path.value}.md`),
      type: 'text/markdown'
    }
  ]
})

// Contribution / Community Links for TOC
const communityLinks = computed(() => [{
  icon: 'i-lucide-file-pen',
  label: 'Edit this page',
  // Updated to point to your repo structure
  to: `https://github.com/sseuniverse/sse-hooks/edit/main/packages/hooks/${page?.value?.stem}.md`,
  target: '_blank'
}, {
  icon: 'i-lucide-star',
  label: 'Star on GitHub',
  to: `https://github.com/sseuniverse/sse-hooks`,
  target: '_blank'
}])
</script>

<template>
  <UPage v-if="page">
    <UPageHeader :title="page.title">
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>

      <template #description>
        <MDC v-if="page.description" :value="page.description" unwrap="p" :cache-key="`${kebabCase(route.path)}-description`" />
      </template>

      <template #links>
        <!-- <UButton
          v-for="link in page.links"
          :key="link.label"
          color="neutral"
          variant="outline"
          :target="link.to?.startsWith('http') ? '_blank' : undefined"
          v-bind="link"
        >
          <template v-if="link.avatar" #leading>
            <UAvatar v-bind="link.avatar" size="2xs" :alt="`${link.label} avatar`" />
          </template>
        </UButton> -->
        <PageHeaderLinks />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer v-if="page.body" :value="page" />

      <USeparator v-if="surround?.filter(Boolean).length" />

      <UContentSurround :surround="(surround as any)" />
    </UPageBody>

    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :links="page.body.toc.links" class="z-[2]">
        <template #bottom>
          <USeparator v-if="page.body?.toc?.links?.length" type="dashed" />

          <UPageLinks title="Community" :links="communityLinks" />
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>