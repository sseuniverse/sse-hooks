export const KEY_ALIASES: Record<string, string> = {
  ctrl: "control",
  opt: "alt",
  option: "alt",
  cmd: "meta",
  command: "meta",
  esc: "escape",
  space: " ",
  " ": "space",
};

/**
 * Normalizes a key event or string into a standard format:
 * "ctrl+alt+shift+key" (modifiers sorted alphabetically).
 */
export function normalizeKeyCombo(e: React.KeyboardEvent | string): string {
  if (typeof e === "string") {
    // Handle sequences like "g g" -> recursive normalization is tricky,
    // so we assume the user config passes individual chords like "ctrl+k"
    const parts = e
      .toLowerCase()
      .split("+")
      .map((p) => p.trim());
    const key = parts.pop();
    const mods = parts.map((m) => KEY_ALIASES[m] || m).sort();
    return [...mods, key === " " ? "space" : key].join("+");
  }

  const mods = [];
  if (e.ctrlKey) mods.push("control");
  if (e.altKey) mods.push("alt");
  if (e.metaKey) mods.push("meta");
  if (e.shiftKey) mods.push("shift");

  mods.sort();
  let key = e.key.toLowerCase();
  if (key === " ") key = "space";

  if (["control", "alt", "meta", "shift"].includes(key)) {
    return key;
  }

  return [...mods, key].join("+");
}

export function isInputTarget(e: React.KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}
