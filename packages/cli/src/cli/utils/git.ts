import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { error, info } from "./logger";
import { HookInfo, ManifestEntry } from "../../types";
import { REPO_CONFIG } from "./constants";

const GITHUB_RAW_URL = (repo: string, branch: string, filePath: string) =>
  `${REPO_CONFIG.RAW_CONTENT_URL}/${repo}/${branch}/${filePath}`;

function parseRepoUrl(repoUrl: string): {
  owner: string;
  repo: string;
  branch: string;
} {
  const match = repoUrl.match(
    /github\.com[/:]([^/]+)\/([^/#]+)(?:\.git)?(?:\/tree\/([^#]+))?/i,
  );

  if (!match) {
    throw new Error(REPO_CONFIG.ERRORS.INVALID_REPO_URL);
  }

  let repo = match[2].endsWith(".git") ? match[2].slice(0, -4) : match[2];
  return {
    owner: match[1],
    repo,
    branch: match[3] || REPO_CONFIG.DEFAULT_BRANCH,
  };
}

export async function fetchHookList(repoUrl: string): Promise<ManifestEntry[]> {
  try {
    const { owner, repo, branch } = parseRepoUrl(repoUrl);
    const manifestUrl = GITHUB_RAW_URL(
      `${owner}/${repo}`,
      branch,
      REPO_CONFIG.MANIFEST_PATH,
    );

    info(`Fetching hook list...`);
    const response = await axios.get<{
      hooks: ManifestEntry[];
      length: number;
    }>(manifestUrl);

    if (response.data?.hooks && Array.isArray(response.data.hooks)) {
      return response.data.hooks as ManifestEntry[];
    }

    throw new Error(REPO_CONFIG.ERRORS.MANIFEST_NOT_FOUND);
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
  repoUrl: string,
  hookName: string,
  language: "ts" | "js",
  filePath: string,
  manifest: ManifestEntry[],
  metaOnly: boolean = false,
): Promise<HookInfo> {
  try {
    const { owner, repo, branch } = parseRepoUrl(repoUrl);

    const hookEntry = manifest.find((h) => h.name === hookName);
    if (!hookEntry) throw new Error(REPO_CONFIG.ERRORS.HOOK_NOT_FOUND);

    const metaFullPath = `${REPO_CONFIG.HOOKS_BASE_PATH}/${hookEntry.path}`;
    const metaUrl = GITHUB_RAW_URL(`${owner}/${repo}`, branch, metaFullPath);

    // Fetch the metadata from the remote repository
    const response = await axios.get<HookInfo>(metaUrl);
    const metaData = response.data;

    // If we only need metadata (to check dependencies), stop here
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
    const message = err instanceof Error ? err.message : "Unknown error";
    error(`Failed to process hook: ${hookName} - ${message}`);
    throw err;
  }
}
