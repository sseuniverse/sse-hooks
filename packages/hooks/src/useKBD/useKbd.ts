import { useState, useEffect, useCallback } from "react";

type KbdKeysSpecificMap = {
  meta: string;
  alt: string;
  ctrl: string;
};

export const kbdKeysMap = {
  meta: "",
  ctrl: "",
  alt: "",
  win: "⊞",
  command: "⌘",
  shift: "⇧",
  control: "⌃",
  option: "⌥",
  enter: "↵",
  delete: "⌦",
  backspace: "⌫",
  escape: "Esc",
  tab: "⇥",
  capslock: "⇪",
  arrowup: "↑",
  arrowright: "→",
  arrowdown: "↓",
  arrowleft: "←",
  pageup: "⇞",
  pagedown: "⇟",
  home: "↖",
  end: "↘",
} as const;

export type KbdKey = keyof typeof kbdKeysMap;
export type KbdKeySpecific = keyof KbdKeysSpecificMap;

// --- The Hook ---

export const useKbd = () => {
  // Initialize as false for SSR consistency
  const [isMac, setIsMac] = useState<boolean>(false);

  useEffect(() => {
    // Check if we are in the browser
    const isClient =
      typeof window !== "undefined" && typeof navigator !== "undefined";

    if (isClient) {
      const isMacUserAgent = /Macintosh/.test(navigator.userAgent);
      setIsMac(isMacUserAgent);
    }
  }, []);

  // Construct the specific map based on current OS state
  const kbdKeysSpecificMap: KbdKeysSpecificMap = {
    meta: isMac ? kbdKeysMap.command : "Ctrl",
    ctrl: isMac ? kbdKeysMap.control : "Ctrl",
    alt: isMac ? kbdKeysMap.option : "Alt",
  };

  const getKbdKey = useCallback(
    (value?: KbdKey | string) => {
      if (!value) {
        return undefined;
      }

      if (["meta", "alt", "ctrl"].includes(value)) {
        return kbdKeysSpecificMap[value as KbdKeySpecific];
      }

      // Return the mapped symbol or the original string if not found
      return kbdKeysMap[value as KbdKey] || value;
    },
    [isMac],
  ); // Re-create function if OS detection changes

  return {
    isMac,
    getKbdKey,
  };
};
