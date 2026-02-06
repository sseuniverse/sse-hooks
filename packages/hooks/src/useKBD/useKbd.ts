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

/**
 * Custom hook that detects the operating system (Mac vs. Windows/Linux) and provides
 * a normalized map of keyboard keys (e.g., mapping "Meta" to "Command" on Mac and "Ctrl" on Windows).
 * * @category utilities
 * @returns {Object} An object containing the OS detection state and a key mapping function.
 * @public
 * @see [Documentation](/docs/hooks/use-kbd)
 * @example
 * ```tsx
 * const { isMac, getKbdKey } = useKbd();
 * * // Returns "⌘" on Mac, "Ctrl" on Windows
 * const metaSymbol = getKbdKey('meta');
 * * return <div>Press {metaSymbol} + C to copy</div>;
 * ```
 */
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
