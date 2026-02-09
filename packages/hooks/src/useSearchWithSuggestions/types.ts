import React from "react";

export type BaseCommand = {
  /** The string trigger (e.g., ":user"). Auto-prefixed with ":" if missing. */
  trigger: string;
};

export type ScopedCommand<T> = BaseCommand & {
  /** Limits search to a specific key in the data object. */
  scope: keyof T;
  filter?: never;
};

export type FilterCommand<T> = BaseCommand & {
  /** Custom filter function for this command. */
  filter: (item: T) => boolean;
  scope?: never;
};

export type CommandConfig<T> = ScopedCommand<T> | FilterCommand<T>;

export type BaseSearchConfig<T> = {
  commands?: CommandConfig<T>[];
  /** If true, fuzzy matching is used instead of strict startsWith. */
  fuzzy?: boolean;
  /** Maximum number of results to return. */
  maxResults?: number;
};

export interface UseSearchSuggestionsResult<T> {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  /** The filtered dataset based on the current query/command. */
  filteredData: T[];
  /** The text that completes the user's current input (for "ghost" overlays). */
  ghostText: string;
  /** True if a suggestion (ghost text) is ready to be tabbed. */
  isSuggestionAvailable: boolean;
  /** Props to spread onto the <input> element. */
  inputProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
  };
  /** The active command trigger (if any), e.g., ":user". */
  activeCommand: string | null;
}
