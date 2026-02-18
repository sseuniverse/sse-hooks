import { ofetch } from "ofetch";
import { defineEventHandler, getRouterParam, createError } from "h3";
import { camelCase } from "@ssets/scule";

const BASE_URL =
  "https://raw.githubusercontent.com/sseuniverse/sse-hooks/refs/heads/main/packages/hooks/src";

export default defineEventHandler(async (event) => {
  // 1. Get the kebab-case name from the URL (e.g., "use-boolean")
  const nameParam = getRouterParam(event, "name");
  if (!nameParam) {
    throw createError({
      statusCode: 400,
      statusMessage: "Hook name is required",
    });
  }

  // 2. Convert to camelCase to match your GitHub folder structure (e.g., "useBoolean")
  const folderName = camelCase(nameParam, { acronyms: ["DB", "KBD", "SSR"] });
  const metaUrl = `${BASE_URL}/${folderName}/types.json`;

  try {
    // 3. Directly fetch the meta.json file from the server/repo
    const metaData = await ofetch(metaUrl, {
      parseResponse: JSON.parse, // Ensure it's treated as JSON
    });

    // 4. Return it directly to the user
    return metaData;
  } catch (error: any) {
    // Handle 404s if the hook or the meta.json doesn't exist
    throw createError({
      statusCode: error.response?.status || 404,
      statusMessage: `Meta file for '${folderName}' not found at ${metaUrl}`,
    });
  }
});
