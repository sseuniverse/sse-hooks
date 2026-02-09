import React from "react";

export type KeyHandler = (event: React.KeyboardEvent) => void;
export type KeyConfig = {
  /** The function to call */
  action: KeyHandler;
  /** Description for UI (e.g. "Save File") */
  description?: string;
  /** Category for UI (e.g. "Navigation") */
  category?: string;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
  /** Stop event propagation */
  stopPropagation?: boolean;
  /** Only fire this hotkey once, then disable it */
  once?: boolean;
  /** Allow this hotkey inside inputs/textareas */
  allowInInputs?: boolean;
};

export type KeyMap = Record<string, KeyHandler | KeyConfig>;
export type UseKeyOptions = {
  /** DOM target to listen on (default: window) */
  target?: React.RefObject<HTMLElement> | null;
  /** Event type (default: keydown) */
  event?: "keydown" | "keyup";
  /** Global toggle to disable all hooks */
  enabled?: boolean;
  /** If true, logs key presses to console */
  debug?: boolean;
  /** Time in ms to wait for a sequence (e.g. "g g") */
  sequenceTimeout?: number;
  /** Custom filter: return false to skip the event */
  filter?: (e: React.KeyboardEvent) => boolean;
};
