import { defineContentConfig, defineCollection, z } from "@nuxt/content";

const Image = z.object({
  src: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const Avatar = z.object({
  src: z.string(),
  alt: z.string().optional(),
});

const Button = z.object({
  label: z.string(),
  icon: z.string().optional(),
  avatar: Avatar.optional(),
  leadingIcon: z.string().optional(),
  trailingIcon: z.string().optional(),
  to: z.string().optional(),
  target: z.enum(["_blank", "_self"]).optional(),
  color: z
    .enum(["primary", "neutral", "success", "warning", "error", "info"])
    .optional(),
  size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
  variant: z
    .enum(["solid", "outline", "subtle", "soft", "ghost", "link"])
    .optional(),
  id: z.string().optional(),
  class: z.string().optional(),
});

const PageHero = z.object({
  title: z.string(),
  description: z.string(),
  links: z.array(Button).optional(),
});

const Page = z.object({
  title: z.string(),
  description: z.string(),
  hero: PageHero,
});

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: "page",
      source: "index.md",
    }),
    docs: defineCollection({
      type: "page",
      source: {
        include: "**",
        exclude: ["index.md"],
      },
      schema: z.object({
        category: z
          .enum([
            "sensors",
            "state",
            "effect",
            "lifecycle",
            "dom",
            "storage",
            "network",
            "utilities",
            "uncategorized",
          ])
          .optional(),
        navigation: z.object({
          title: z.string().optional(),
        }),
        links: z.array(Button).optional(),
      }),
    }),
    team: defineCollection({
      type: "page",
      source: "team.yml",
      schema: Page,
    }),
    blog: defineCollection({
      type: "page",
      source: "blog.yml",
      schema: Page,
    }),
    posts: defineCollection({
      type: "page",
      source: [
        {
          include: "blog/**/*",
        },
      ],
      schema: z.object({
        image: z.string(),
        date: z.string(),
        authors: z
          .array(
            z.object({
              name: z.string(),
              avatar: Avatar.optional(),
              to: z.string().optional(),
            }),
          )
          .optional(),
      }),
    }),
    releases: defineCollection({
      type: "page",
      source: "releases.yml",
      schema: Page,
    }),
  },
});
