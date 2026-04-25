import { Octokit } from "@octokit/rest";

export default defineCachedEventHandler(
  async () => {
    if (!process.env.NUXT_GITHUB_TOKEN) {
      return [];
    }

    const octokit = new Octokit({ auth: process.env.NUXT_GITHUB_TOKEN });
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: "sseuniverse",
      repo: "sse-hooks",
    });

    return releases;
  },
  {
    maxAge: 60 * 60,
    getKey: () => "releases",
  },
);
