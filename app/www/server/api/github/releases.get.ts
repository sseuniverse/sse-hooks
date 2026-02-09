interface GithubAsset {
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  downloadUrl: string;
}

interface GithubRelease {
  id: number;
  tag: string;
  author: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  createdAt: string;
  publishedAt: string;
  markdown: string;
  html: string;
  assets: GithubAsset[];
}

export default defineEventHandler(async (event) => {
  const repo = "sseuniverse/sse-hooks";

  // Fetch releases from the specific repo
  const res = await ghFetch<any[]>(`/repos/${repo}/releases`);

  // --- Your Mapping Logic ---
  const releases = res.map(
    (i) =>
      <GithubRelease>{
        id: i.id,
        tag: i.tag_name,
        author: i.author.login,
        name: i.name,
        draft: i.draft,
        prerelease: i.prerelease,
        createdAt: i.created_at,
        publishedAt: i.published_at,
        markdown: i.body,
        html: "",
        assets:
          "assets" in i
            ? i.assets.map((a: any) => ({
                contentType: a.content_type,
                size: a.size,
                createdAt: a.created_at,
                updatedAt: a.updated_at,
                downloadCount: a.download_count,
                downloadUrl: a.browser_download_url,
              }))
            : [],
      },
  );

  // --- HTML Conversion ---
  await Promise.all(
    releases.map(async (release) => {
      const htmlRel = await ghMarkdown(
        release.markdown,
        repo,
        "release-" + release.tag,
      );
      release.html = htmlRel ? htmlRel : "";
    }),
  );

  return {
    releases,
  };
});
