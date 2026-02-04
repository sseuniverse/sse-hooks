---
seo:
  title: SSE Hooks - Modern React Hooks Library
  description: A collection of modern, server-safe, and lightweight React hooks for your next project.
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
Build Faster with [SSE Hooks]{.text-primary}.

#description
A comprehensive collection of modern, type-safe, and SSR-friendly React hooks. Stop reinventing the wheel—install exactly what you need with our CLI.

#links
  :::u-button
  ---
  to: /getting-started
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  Get Started
  :::

  :::u-button
  ---
  icon: i-simple-icons-github
  color: neutral
  variant: outline
  size: xl
  to: https://github.com/sseuniverse/sse-hooks
  target: _blank
  ---
  GitHub
  :::

#default
  :::prose-pre
  ---
  code: |
    import { useBattery } from 'sse-hooks'

    const Demo = () => {
      const { level, charging } = useBattery()

      return (
        <div>
          Battery: {level * 100}%
          {charging ? ' (Charging)' : ''}
        </div>
      )
    }
  filename: App.tsx
  ---

  ```tsx [App.tsx]
  import { useBattery } from 'sse-hooks'

  const Demo = () => {
    const { level, charging } = useBattery()

    return (
      <div>
        Battery: {level * 100}%
        {charging ? ' (Charging)' : ''}
      </div>
    )
  }
  ```
  :::
::

::u-page-section
#features
  :::u-page-feature
  ---
  icon: i-lucide-zap
  ---
  #title
  Lightweight & Modular
  
  #description
  Designed to be tree-shakeable. Use the CLI to add individual hooks to your project, keeping your bundle size minimal.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-file-type-2
  ---
  #title
  TypeScript Ready
  
  #description
  Written in TypeScript with complete type definitions included. Enjoy full autocomplete and type safety out of the box.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-server
  ---
  #title
  SSR Friendly
  
  #description
  Built with server-side rendering in mind. All hooks are safe to use with Next.js, Nuxt, and other SSR frameworks.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-package
  ---
  #title
  Easy Installation
  
  #description
  Use our dedicated CLI tool to install hooks instantly without copy-pasting code manually.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-globe
  ---
  #title
  Modern Web APIs
  
  #description
  Seamlessly integrates with modern browser features like Web Audio, Battery Status, and Sensors through a React-friendly interface.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-box
  ---
  #title
  Zero Dependencies
  
  #description
  Keep your project lean. Our hooks are built with standard React APIs and contain no external runtime dependencies.
  :::
::

::u-page-section{class="dark:bg-gradient-to-b from-neutral-950 to-neutral-900"}
  :::u-page-c-t-a
  ---
  links:
    - label: Explore Hooks
      to: '/hooks'
      trailingIcon: i-lucide-arrow-right
    - label: CLI Documentation
      to: '/getting-started'
      variant: subtle
  ---
  #title
  Ready to ship?
  
  #description
  Install the CLI tool today and supercharge your React development workflow.
  :::
::