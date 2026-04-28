---
title: Build an AI Chatbot with Nuxt, Nuxt UI, and AI SDK
description: Learn how to build a full-featured AI chatbot with streaming responses, multiple models support, and a beautiful UI using Nuxt, Nuxt UI, and Vercel AI SDK.
navigation: false
image: /assets/blog/building-nuxt-ai-chatbot.png
authors:
  - name: Hugo Richard
    avatar:
      src: https://github.com/hugorcd.png
    to: https://x.com/hugorcd
  - name: Benjamin Canac
    avatar:
      src: https://github.com/benjamincanac.png
    to: https://x.com/benjamincanac
date: 2025-12-16T10:00:00.000Z
category: Tutorial
---

Building AI-powered applications has never been more accessible. This guide walks through creating a full-featured AI chatbot using Nuxt, Nuxt UI, and the Vercel AI SDK. Each step is explained in detail so you understand how every piece works together.

## What we're building

By the end of this tutorial, you'll have a fully functional AI chatbot with:

- **Streaming responses** that appear in real-time as the AI generates them
- **A beautiful chat interface** built with Nuxt UI's purpose-built chat components
- **Markdown rendering** for rich AI responses with code highlighting
- **Multi-model support** allowing users to switch between OpenAI, Anthropic, and Google models
- **Server-side AI integration** using Nitro API routes and the AI SDK

::callout{icon="i-simple-icons-github"}
Check out the [`Nuxt`](https://github.com/nuxt-ui-templates/chat) and [`Vue`](https://github.com/nuxt-ui-templates/chat-vue) AI Chat templates on GitHub for production-ready implementations with authentication, database persistence, and more.
::

## Prerequisites

Before we start, make sure you have:

- Node.js 20+ installed
- A [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) API key (provides access to multiple AI providers through a single endpoint)

## Project setup

Start by creating a new Nuxt project:

```bash
npx nuxi@latest init nuxt-ai-chat
cd nuxt-ai-chat
```

### Installing dependencies

Install Nuxt UI and the AI-specific dependencies:

::code-group{sync="pm"}

```bash [pnpm]
pnpm add @nuxt/ui tailwindcss @comark/nuxt @shikijs/langs @nuxthub/core drizzle-orm drizzle-kit @libsql/client ai @ai-sdk/vue zod
```

```bash [yarn]
yarn add @nuxt/ui tailwindcss @comark/nuxt @shikijs/langs @nuxthub/core drizzle-orm drizzle-kit @libsql/client ai @ai-sdk/vue zod
```

```bash [npm]
npm install @nuxt/ui tailwindcss @comark/nuxt @shikijs/langs @nuxthub/core drizzle-orm drizzle-kit @libsql/client ai @ai-sdk/vue zod
```

```bash [bun]
bun add @nuxt/ui tailwindcss @comark/nuxt @shikijs/langs @nuxthub/core drizzle-orm drizzle-kit @libsql/client ai @ai-sdk/vue zod
```

::

### Configuration

Update your `nuxt.config.ts` to register the modules:

::code-tree-intersection

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@comark/nuxt", "@nuxthub/core"],

  hub: {
    db: "sqlite",
  },

  css: ["~/assets/css/main.css"],
});
```

::