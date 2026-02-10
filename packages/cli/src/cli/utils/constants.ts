const ORIGIN = "https://sse-hooks.vercel.app";

export const REGISTRY_CONFIG = {
  ORIGIN: ORIGIN,
  BASE_URL: `${ORIGIN}/api/registry/hook`,
  MANIFEST_ENDPOINT: "manifest.json",
  HOOK_ENDPOINT: (name: string) => `${name}/meta.json`,

  ERRORS: {
    FETCH_FAILED: "Failed to fetch from registry",
    MANIFEST_NOT_FOUND: "Registry manifest not found",
    HOOK_NOT_FOUND: "Hook not found in registry",
  },
};

// Default configuration values
export const DEFAULT_CONFIG_VALUES = {
  HOOKS_DIR: "src/hooks",
  REPO_URL: REGISTRY_CONFIG.BASE_URL,
};

export const CLI = {
  COMMAND_NAME: "sse-tools",
  CONFIG_FILE: "sse.config.json",
  COMMANDS: {
    INIT: "init",
    ADD: "add",
    LIST: "list",
  },

  PROMPTS: {
    HOOKS_DIR: "Where should hooks be stored?",
    DEFAULT_LANG: "Default hook language?",
    REPO_URL: "Registry API URL?",
  },
};
