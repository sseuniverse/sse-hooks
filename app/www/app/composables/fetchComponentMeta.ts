// fetchHookMeta.ts
export interface HookProperty {
  name: string;
  description: string;
  type: string;
  rawType?: string;
  required: boolean;
  default?: string;
  schema?: HookProperty[];
  tags?: { name: string; text?: string }[];
}

// NEW: Interface to define the shape of Standalone Types, Interfaces, and Enums
export interface HookTypeMeta {
  kind: "interface" | "type" | "enum";
  name: string;
  description?: string;
  properties?: HookProperty[]; // For 'interface'
  members?: { name: string; description?: string; value: string | number }[]; // For 'enum'
  type?: string; // For 'type' alias
  rawType?: string; // For 'type' alias
  schema?: HookProperty[]; // For deeper object resolution
}

export interface HookMeta {
  name: string;
  description: string;
  props: HookProperty[];
  returns: HookProperty[];
  types?: HookTypeMeta[]; // ADDED: The new array to hold the standalone declarations
}

const useHookMetaState = () =>
  useState<Record<string, any>>("hook-meta-state", () => ({}));

export async function fetchHookMeta(name: string): Promise<HookMeta> {
  const state = useHookMetaState();

  if (state.value[name]?.then) {
    await state.value[name];
    return state.value[name];
  }
  if (state.value[name]) {
    return state.value[name];
  }

  const endpoint = `/api/registry/hook/${name}/types.json`;

  // Add to nitro prerender
  if (import.meta.server) {
    const event = useRequestEvent();
    event?.node.res.setHeader(
      "x-nitro-prerender",
      [event?.node.res.getHeader("x-nitro-prerender"), endpoint]
        .filter(Boolean)
        .join(","),
    );
  }

  // Store promise to avoid multiple calls
  state.value[name] = $fetch<HookMeta>(endpoint)
    .then((meta) => {
      state.value[name] = meta;
    })
    .catch(() => {
      state.value[name] = {};
    });

  await state.value[name];
  return state.value[name];
}
