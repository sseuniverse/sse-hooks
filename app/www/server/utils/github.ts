import { ofetch } from "ofetch";

export const ghFetch = ofetch.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "sse-hooks-app",
    // 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
  },
});

export const ghMarkdown = cachedFunction(
  async (markdown: string, repo: string, _id: string) => {
    if (!markdown) {
      return "";
    }

    // We use the raw fetch here to send the markdown
    // Note: GitHub Markdown API expects the body as a JSON object with a "text" field
    return await ghFetch<string>("/markdown", {
      method: "POST",
      body: {
        text: markdown,
        context: repo,
        mode: "gfm", // Use GitHub Flavored Markdown
      },
    });
  },
  {
    // Caching options
    maxAge: 60 * 60, // Cache for 1 hour
    name: "markdown",
    getKey: (_markdown, repo, id) => repo + "/" + id,
  },
);
