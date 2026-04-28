import { ofetch } from "ofetch";
import type { LatestRelease, TeamData } from "../utils/types";

const teams: TeamData[] = [
  {
    name: "SSE World",
    login: "sseworld",
    avatarUrl: "",
    pronouns: "",
    location: "India",
    websiteUrl: null,
    sponsorsListing: "https://github.com/sponsors/sseworld",
    socialAccounts: {},
  },
  {
    name: "SSE Official",
    login: "ssewofficial",
    avatarUrl: "",
    pronouns: "",
    location: "India",
    websiteUrl: null,
    sponsorsListing: "https://github.com/sponsors/ssewofficial",
    socialAccounts: {},
  },
];

export default defineEventHandler(async (event) => {
  try {
    const url =
      "https://api.github.com/repos/sseuniverse/sse-hooks/releases/latest";
    const latest = await ofetch<LatestRelease>(url, {
      parseResponse: JSON.parse,
    });

    return {
      team: teams,
      latest_release: {
        tag: latest.tag_name,
        name: latest.name,
        created_at: latest.created_at,
        updated_at: latest.updated_at,
        published_at: latest.published_at,
        assets: latest.assets,
        tarball_url: latest.tarball_url,
        zipball_url: latest.zipball_url,
        body: latest.body,
      },
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch team data from GitHub",
    });
  }
});
