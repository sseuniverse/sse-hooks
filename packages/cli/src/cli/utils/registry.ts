import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { error, info } from "./logger";
import { HookInfo, ManifestEntry } from "../../types";
import { REGISTRY_CONFIG } from "./constants";

export async function fetchHookList(
  registryUrl: string,
): Promise<ManifestEntry[]> {
  try {
    const baseUrl = registryUrl.replace(/\/$/, "");
    const manifestUrl = `${baseUrl}/${REGISTRY_CONFIG.MANIFEST_ENDPOINT}`;

    info(`Fetching hook list...`);
    const response = await axios.get<{
      hooks: ManifestEntry[];
      length: number;
    }>(manifestUrl);

    if (response.data?.hooks && Array.isArray(response.data.hooks)) {
      return response.data.hooks as ManifestEntry[];
    }

    throw new Error(REGISTRY_CONFIG.ERRORS.MANIFEST_NOT_FOUND);
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Unknown error";
    error("Failed to fetch hook list: " + message);
    throw err;
  }
}

/**
 * Downloads a hook or retrieves its metadata.
 * @param metaOnly If true, it fetches metadata without writing to the filesystem.
 */
export async function downloadHook(
  registryUrl: string,
  hookNameOrUrl: string,
  language: "ts" | "js",
  filePath: string,
  metaOnly: boolean = false,
): Promise<HookInfo> {
  try {
    let hookUrl: string;

    if (
      hookNameOrUrl.startsWith("http://") ||
      hookNameOrUrl.startsWith("https://")
    ) {
      hookUrl = hookNameOrUrl;
    } else {
      // Otherwise, construct from registry
      const baseUrl = registryUrl.replace(/\/$/, "");
      hookUrl = `${baseUrl}/${REGISTRY_CONFIG.HOOK_ENDPOINT(hookNameOrUrl)}`;
    }

    const response = await axios.get<HookInfo>(hookUrl);
    const metaData = response.data;
    if (metaOnly) {
      return metaData;
    }

    const code = language === "js" ? metaData.file.js : metaData.file.content;
    if (!code) {
      throw new Error(`Code for ${language.toUpperCase()} not found.`);
    }

    // Ensure directory exists and write the hook file
    if (filePath) {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, code);
    }

    return metaData;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      error(`Hook "${hookNameOrUrl}" not found in registry.`);
      throw new Error(REGISTRY_CONFIG.ERRORS.HOOK_NOT_FOUND);
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    error(`Failed to process hook: ${hookNameOrUrl} - ${message}`);
    throw err;
  }
}
