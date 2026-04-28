<script setup lang="ts">
const { data: page } = await useAsyncData("team", () =>
  queryCollection("team").first(),
);
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

useSeoMeta({
  titleTemplate: "%s - SSE Hooks",
  title: page.value.title,
  description: page.value.description,
  ogTitle: `${page.value.title} - SSE Hooks`,
  ogDescription: page.value.description,
});

defineOgImageComponent("Docs");

const { data: module } = await useFetch("/api/module.json");

const icons = {
  website: "i-lucide-link",
  twitter: "i-simple-icons-x",
  twitch: "i-simple-icons-twitch",
  youtube: "i-simple-icons-youtube",
  instagram: "i-simple-icons-instagram",
  linkedin: "i-simple-icons-linkedin",
  mastodon: "i-simple-icons-mastodon",
  bluesky: "i-simple-icons-bluesky",
  github: "i-simple-icons-github",
};
</script>

<template>
  <main v-if="page">
    <UPageHero
      :title="page.hero.title"
      :description="page.hero.description"
      class="relative"
      :ui="{
        title: 'text-balance',
        container: 'relative lg:py-32',
      }"
    >
      <template #top>
        <div
          class="absolute z-[-1] rounded-full bg-primary blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-1/2 -translate-y-80"
        />
      </template>

      <LazyStarsBg />
    </UPageHero>

    <UPageSection :ui="{ container: '!pt-0' }">
      <UPageGrid class="xl:grid-cols-4">
        <UPageCard
          v-for="(user, index) in module?.team"
          :key="index"
          :title="user.name"
          :description="
            [user.pronouns, user.location].filter(Boolean).join(' ・ ')
          "
          :ui="{
            wrapper: 'items-center',
            container: 'gap-y-4 lg:py-8',
            leading: 'flex justify-center',
            title: 'text-center',
            description: 'text-center text-muted',
          }"
          variant="subtle"
        >
          <template #leading>
            <UAvatar
              :src="`https://ipx.nuxt.com/f_auto,s_80x80/gh_avatar/${user.login}`"
              :srcset="`https://ipx.nuxt.com/f_auto,s_160x160/gh_avatar/${user.login} 2x`"
              :alt="`${user.name} avatar`"
              size="3xl"
              class="mx-auto"
            />
          </template>

          <div class="flex items-center justify-center gap-1">
            <UButton
              v-for="(link, key) in user.socialAccounts"
              :key="key"
              color="neutral"
              variant="link"
              :to="link?.url"
              :icon="icons[key as keyof typeof icons] || icons.website"
              :aria-label="`Link to ${user.name}'s ${key} profile`"
              target="_blank"
              size="sm"
            />
            <UButton
              :to="`https://github.com/${user.login}`"
              color="neutral"
              variant="link"
              :aria-label="`Link to ${user.name}'s GitHub profile`"
              :icon="icons.github"
              target="_blank"
            />
            <UButton
              v-if="user.websiteUrl"
              :to="user.websiteUrl"
              color="neutral"
              variant="link"
              :aria-label="`Link to ${user.name}'s personal website`"
              :icon="icons.website"
              target="_blank"
            />
          </div>
          <div
            v-if="user.sponsorsListing"
            class="flex items-center justify-center"
          >
            <UButton
              :to="user.sponsorsListing"
              target="_blank"
              color="neutral"
              variant="subtle"
              icon="i-lucide-heart"
              label="Sponsor"
              :ui="{ leadingIcon: 'text-pink-500 dark:text-pink-400' }"
            />
          </div>
        </UPageCard>
      </UPageGrid>
    </UPageSection>
  </main>
</template>
