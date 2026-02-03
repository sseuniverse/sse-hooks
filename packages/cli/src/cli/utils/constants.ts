export const REPO_CONFIG = {
  // Default repository information
  DEFAULT_REPO: "sseuniverse/sse-hooks",
  DEFAULT_BRANCH: "main",

  // Updated to match your repo structure
  MANIFEST_PATH: "packages/hooks/manifest.json",
  HOOKS_BASE_PATH: "packages/hooks",

  // GitHub URL patterns
  RAW_CONTENT_URL: "https://raw.githubusercontent.com",
  REPO_URL_PATTERN: "https://github.com/{owner}/{repo}/tree/{branch}",

  // Hook file naming convention
  HOOK_FILE_PREFIX: "", // Prefix is handled by the manifest names
  HOOK_FILE_SUFFIX: "{ext}",

  // Error messages
  ERRORS: {
    INVALID_REPO_URL: "Invalid GitHub repository URL",
    MANIFEST_NOT_FOUND: "Hook manifest not found",
    HOOK_NOT_FOUND: "Hook not found in repository",
    META_NOT_FOUND: "Hook metadata could not be retrieved",
  },
};

// Default configuration values
export const DEFAULT_CONFIG_VALUES = {
  HOOKS_DIR: "src/hooks",
  DEFAULT_LANGUAGE: "ts" as "ts" | "js",
  REPO_URL: `https://github.com/${REPO_CONFIG.DEFAULT_REPO}`,
};

export const CLI = {
  COMMAND_NAME: "sse-tools",
  CONFIG_FILE: "sse-hooks.config.json",
  COMMANDS: {
    INIT: "init",
    ADD: "add",
    LIST: "list",
  },

  PROMPTS: {
    HOOKS_DIR: "Where should hooks be stored?",
    DEFAULT_LANG: "Default hook language?",
    REPO_URL: "Git repository URL for hooks?",
  },
};
