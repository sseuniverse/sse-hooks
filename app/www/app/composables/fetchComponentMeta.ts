export interface HookProperty {
  name: string;
  type: string;
  description?: string;
  isOptional?: boolean;
  required?: boolean;
  defaultValue?: string;
  default?: string;
  properties?: HookProperty[];
  schema?: HookProperty[];
  tags?: Record<string, string | boolean>;
}

export interface HookTypeMeta {
  kind: "interface" | "type" | "enum" | "union" | "alias";
  name: string;
  description?: string;
  properties?: HookProperty[];
  members?: { name: string; description?: string; value: string | number }[];
  type?: string;
  rawType?: string;
  values?: string[];
  schema?: HookProperty[];
}

export interface HookMeta {
  $schema?: string;
  name: string;
  type: "registry:hook";
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  props?: HookProperty[];
  returns?: HookProperty[];
  types?: HookTypeMeta[];
  api?: {
    tags?: Record<string, string | boolean>;
    types?: HookTypeMeta[];
    parameters: HookProperty[];
    returnType: {
      name: string;
      description?: string;
      properties?: HookProperty[];
    };
  };
  file: {
    path: string;
    content: string;
    js: string;
  };
}

const useHookMetaState = () =>
  useState<Record<string, Promise<HookMeta> | HookMeta>>(
    "hook-meta-state",
    () => ({}),
  );

export async function fetchHookMeta(name: string): Promise<HookMeta> {
  const state = useHookMetaState();

  if (state.value[name] instanceof Promise) {
    return (await state.value[name]) as HookMeta;
  }

  if (state.value[name]) {
    return state.value[name] as HookMeta;
  }

  const endpoint = `/api/registry/hook/${name}/meta.json`;

  if (import.meta.server) {
    const event = useRequestEvent();
    event?.node.res.setHeader(
      "x-nitro-prerender",
      [event?.node.res.getHeader("x-nitro-prerender"), endpoint]
        .filter(Boolean)
        .join(","),
    );
  }

  state.value[name] = $fetch<HookMeta>(endpoint)
    .then((meta) => {
      state.value[name] = meta;
      return meta;
    })
    .catch(() => {
      const emptyMeta = {} as HookMeta;
      state.value[name] = emptyMeta;
      return emptyMeta;
    });

  return (await state.value[name]) as HookMeta;
}
