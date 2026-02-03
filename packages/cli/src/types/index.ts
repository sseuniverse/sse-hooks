export interface ManifestEntry {
  name: string;
  description: string;
  path: string;
}

export interface HookInfo {
  $schema: string;
  name: string;
  type: "registry:hook";
  title: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  file: {
    content: string;
    js: string;
  };
}

export interface Config {
  hooksDir: string;
  defaultLanguage: "ts" | "js";
  repoUrl: string;
}
