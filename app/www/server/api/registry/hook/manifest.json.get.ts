import { ghFetch } from "~~/server/utils/github";
import { type FileFetchData } from "~~/server/utils/types";

export default defineEventHandler(async (event) => {
  const repo = "sseuniverse/sse-hooks";
  const filePath = "packages/hooks/manifest.json";

  try {
    const res = await ghFetch<FileFetchData>(
      `/repos/${repo}/contents/${filePath}`,
    );

    const decodedContent = Buffer.from(res.content, "base64").toString("utf-8");
    return JSON.parse(decodedContent);
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: `Failed to fetch manifest from GitHub API`,
    });
  }
});
