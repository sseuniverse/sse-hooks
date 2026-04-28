import { ofetch } from "ofetch";
import { camelCase } from "@ssets/scule";

const BASE_URL =
  "https://raw.githubusercontent.com/sseuniverse/sse-hooks/refs/heads/main/packages/hooks/src";

export default defineCachedEventHandler(
  async (event) => {
    const nameParam = getRouterParam(event, "name");
    if (!nameParam) {
      throw createError({
        statusCode: 400,
        statusMessage: "Hook name is required",
      });
    }

    const folderName = camelCase(nameParam, { acronyms: ["DB", "KBD", "SSR"] });
    const metaUrl = `${BASE_URL}/${folderName}/meta.json`;

    try {
      const metaData = await ofetch(metaUrl, {
        parseResponse: JSON.parse,
      });

      return metaData;
    } catch (error: any) {
      throw createError({
        statusCode: error.response?.status || 404,
        statusMessage: `Meta file for '${folderName}' not found at ${metaUrl}`,
      });
    }
  },
  {
    maxAge: 60 * 60 * 24,
    shouldBypassCache: () => !!import.meta.dev,
    getKey: () => "meta",
  },
);
