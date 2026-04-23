export interface HookMeta {
  $schema?: string;
  name: string;
  type: "registry:hook";
  title: string;
  description: string;
  categories?: string[];
  dependencies: string[];
  registryDependencies: string[];
  api: {
    tags?: Record<string, string | boolean>;
    types?: any[];
    parameters: any[];
    returnType: {
      name: string;
      properties?: any[];
    };
  };
  file: {
    path: string;
    content: string;
    js: string;
  };
}