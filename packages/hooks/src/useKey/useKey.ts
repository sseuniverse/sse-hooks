import { useEffect, useRef, useState, KeyboardEvent, useMemo } from "react";
import { KeyConfig, KeyMap, UseKeyOptions } from "./types";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";
import { isInputTarget, normalizeKeyCombo } from "./utils";

/**
 * CORE HOOK: useKeyListener
 * Low-level hook to bind a single event listener with lifecycle management.
 */
export function useKeyListener(
  handler: (e: KeyboardEvent) => void,
  options: UseKeyOptions = {},
) {
  const { target, event = "keydown", enabled = true } = options;
  const handlerRef = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const node = target ? target.current : window;
    if (!node) return;

    const eventListener = (e: Event) =>
      handlerRef.current(e as unknown as KeyboardEvent);
    node.addEventListener(event, eventListener);
    return () => node.removeEventListener(event, eventListener);
  }, [target, event, enabled]);
}

/**
 * A powerful sensor hook for handling keyboard shortcuts, sequences, and modifiers.
 *
 * It supports complex key combinations (`Ctrl+Shift+S`), Gmail-style sequences (`g then i`),
 * and provides metadata for generating "Keyboard Shortcut" UI help modals.
 *
 * @category sensors
 * @param {KeyMap} keyMap - An object defining the key bindings and their actions.
 * @param {UseKeyOptions} [options] - Global configuration options.
 * @returns {{ bindings: Array<{ keys: string, category: string, description: string }> }}
 * Metadata about the registered bindings for UI display.
 *
 * @throws Will log a warning in debug mode if a key combination is invalid.
 * @public
 * @see [Documentation](/docs/use-key)
 *
 * @example
 * ```tsx
 * const { bindings } = useKey({
 * // Simple binding
 * "Escape": () => setModalOpen(false),
 *
 * // Modifier binding with config
 * "Ctrl+S": {
 * action: (e) => saveDocument(),
 * preventDefault: true,
 * description: "Save changes",
 * category: "File"
 * },
 *
 * // Sequence binding (Gmail style)
 * "g i": {
 * action: () => navigate("/inbox"),
 * description: "Go to Inbox",
 * category: "Navigation"
 * }
 * }, {
 * debug: true,
 * allowInInputs: false
 * });
 * ```
 */
export function useKey(keyMap: KeyMap, options: UseKeyOptions = {}) {
  const { debug = false, sequenceTimeout = 1000, filter } = options;
  const [buffer, setBuffer] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const callbackMapRef = useRef(keyMap);

  useIsomorphicLayoutEffect(() => {
    callbackMapRef.current = keyMap;
  });

  const handleEvent = (e: React.KeyboardEvent) => {
    // 1. Normalize
    const currentCombo = normalizeKeyCombo(e);

    if (debug) {
      console.log(
        `[useKey] Pressed: ${e.key} | Normalized: ${currentCombo} | Buffer: ${buffer.join(" ")}`,
      );
    }

    if (filter && !filter(e)) return;

    const nextBuffer = [...buffer, currentCombo];
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setBuffer([]), sequenceTimeout);
    setBuffer(nextBuffer);

    const sequenceKey = nextBuffer.join(" ");
    Object.entries(callbackMapRef.current).forEach(([keyBinding, value]) => {
      // Normalize user's binding (e.g. "Ctrl+Shift+S" -> "control+shift+s")
      const normalizedBinding = keyBinding
        .split(" ")
        .map(normalizeKeyCombo)
        .join(" ");

      const config: KeyConfig =
        typeof value === "function" ? { action: value } : value;

      let isMatch = false;
      if (normalizedBinding === sequenceKey) {
        isMatch = true;
        setBuffer([]);
      } else if (
        normalizedBinding === currentCombo &&
        nextBuffer.length === 1
      ) {
        isMatch = true;
      }

      if (isMatch) {
        // --- Checks ---
        if (config.once && firedRef.current.has(normalizedBinding)) return;
        if (!config.allowInInputs && isInputTarget(e)) return;

        // --- Execute ---
        if (config.preventDefault) e.preventDefault();
        if (config.stopPropagation) e.stopPropagation();
        if (config.once) firedRef.current.add(normalizedBinding);

        if (debug) console.log(`[useKey] Triggered: ${keyBinding}`);

        config.action(e);
      }
    });
  };

  useKeyListener(handleEvent, options);

  const bindings = useMemo(() => {
    return Object.entries(keyMap).map(([keys, value]) => {
      const config = typeof value === "function" ? ({} as KeyConfig) : value;
      return {
        keys,
        category: config.category || "General",
        description: config.description || "No description",
      };
    });
  }, [keyMap]);

  return { bindings };
}
