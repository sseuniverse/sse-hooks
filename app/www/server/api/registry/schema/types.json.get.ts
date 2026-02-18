import { ofetch } from "ofetch";
import { defineEventHandler, createError } from "h3";

const BASE_URL =
  "https://raw.githubusercontent.com/sseuniverse/sse-hooks/refs/heads/main/schema/types.json";

export default defineEventHandler(async (event) => {
  try {
    const metaData = await ofetch(BASE_URL, {
      parseResponse: JSON.parse,
    });

    return metaData;
  } catch (error: any) {
    // Handle 404s if the hook or the meta.json doesn't exist
    throw createError({
      statusCode: error.response?.status || 404,
      statusMessage: `Meta schema file for not found at ${BASE_URL}`,
    });
  }
});
