export interface TypeDocChild {
  id: number;
  name: string;
  signatures?: any[];
  comment?: {
    summary?: { text: string }[];
    blockTags?: { tag: string; content: { text: string }[] }[];
  };
  groups?: { title: string; children: number[] }[];
  children?: TypeDocChild[];
}

export interface HookData {
  name: string;
  signature: any;
  moduleName: string;
}

export interface ProcessedHook {
  name: string;
  kebabName: string;
  category: string;
  shortDesc: string;
}

export interface GitHubTag {
  name: string;
  commit: { sha: string };
}

export interface GitHubTree {
  tree: { path: string }[];
}
