import { GitHubTag, GitHubTree } from "../types";

export async function getNewHooksList(repo: string): Promise<{
  oldHooks: Set<any>;
  hasData: boolean;
}> {
  try {
    console.log("🔍 Fetching release tags from GitHub...");
    const tagsRes = await fetch(`https://api.github.com/repos/${repo}/tags`);
    const tags = (await tagsRes.json()) as GitHubTag[];

    if (!Array.isArray(tags) || tags.length < 2)
      return { oldHooks: new Set(), hasData: false };

    const prevTag = tags[1];
    const treeRes = await fetch(
      `https://api.github.com/repos/${repo}/git/trees/${prevTag.commit.sha}?recursive=1`,
    );
    const treeData = (await treeRes.json()) as GitHubTree;

    const oldHooks = new Set<string>();
    treeData.tree.forEach((file) => {
      const match = file.path.match(
        /packages\/hooks\/src\/(use[A-Z][a-zA-Z0-9]+)/,
      );
      if (match) oldHooks.add(match[1]);
    });

    return { oldHooks, hasData: true };
  } catch (e: any) {
    console.warn("⚠️ GitHub check failed:", e.message);
    return { oldHooks: new Set(), hasData: false };
  }
}
