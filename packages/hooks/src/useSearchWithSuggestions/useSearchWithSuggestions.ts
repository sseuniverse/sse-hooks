import { useMemo, useState, useCallback } from "react";
import { BaseSearchConfig, UseSearchSuggestionsResult } from "./types";
import { filterList } from "./utils";

/**
 * A comprehensive hook for building "Command Palette" or "Omnibar" style search interfaces.
 * * It provides "Ghost Text" autocomplete (like Google search), command scoping (like Slack's `/` commands),
 * and keyboard support. It handles the complex logic of parsing input strings to separate commands from queries.
 *
 * @category utilities
 * @template T - The shape of the data object.
 * @template K - The keys of T to search against.
 *
 * @param {T[]} data - The array of data objects to search through.
 * @param {K[]} searchKeys - An array of keys (e.g., `['name', 'email']`) to search against by default.
 * @param {BaseSearchConfig<T>} [config] - Optional configuration object.
 * @param {CommandConfig<T>[]} [config.commands] - Array of custom commands (e.g., `{ trigger: 'user', scope: 'name' }`).
 * @param {boolean} [config.fuzzy=false] - If true, matches anywhere in the string, not just the start.
 * @param {number} [config.maxResults] - Limit the number of returned results for performance.
 *
 * @returns {UseSearchSuggestionsResult<T>} Object containing query state, filtered results, and UI props.
 * @public
 * @example
 * ```tsx
 * const users = [
 * { id: 1, name: "Alice", role: "admin" },
 * { id: 2, name: "Bob", role: "user" }
 * ];
 * const {
 * inputProps,
 * ghostText,
 * filteredData,
 * isSuggestionAvailable
 * } = useSearchWithSuggestions(
 * users,
 * ["name"], // Default search key
 * {
 * commands: [
 * // Typing ":role admin" will filter by role
 * { trigger: "role", scope: "role" },
 * // Typing ":admins" will run a custom filter function
 * { trigger: "admins", filter: (u) => u.role === "admin" }
 * ]
 * }
 * );
 * return (
 * <div className="search-container">
 * <div className="input-wrapper relative">
 *
 * // Ghost Layout
 * <input
 * className="absolute text-gray-300 bg-transparent pointer-events-none"
 * value={ghostText}
 * readOnly
 * />
 * // The Actual Input
 * <input
 * className="relative bg-transparent"
 * {...inputProps}
 * />
 * </div>
 * <ul>
 * {filteredData.map(u => <li key={u.id}>{u.name}</li>)}
 * </ul>
 * </div>
 * );
 * ```
 */
export function useSearchWithSuggestions<
  T extends Record<string, any>,
  K extends keyof T = keyof T,
>(
  data: T[],
  searchKeys: readonly K[],
  config?: BaseSearchConfig<T>,
): UseSearchSuggestionsResult<T>;

export function useSearchWithSuggestions<
  T extends Record<string, any>,
  K extends keyof T = keyof T,
>(
  data: T[],
  searchKeys: readonly K[],
  config: BaseSearchConfig<T> = {},
): UseSearchSuggestionsResult<T> {
  const { commands = [], fuzzy = false, maxResults } = config;
  const [query, setQuery] = useState("");

  const normalizedCommands = useMemo(() => {
    return commands.map((cmd) => ({
      ...cmd,
      trigger: cmd.trigger.startsWith(":") ? cmd.trigger : `:${cmd.trigger}`,
    }));
  }, [commands]);

  const activeCommandObj = useMemo(() => {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();

    return normalizedCommands.find(
      (cmd) =>
        lowerQuery.startsWith(cmd.trigger + " ") || lowerQuery === cmd.trigger,
    );
  }, [query, normalizedCommands]);

  const suggestionDetails = useMemo(() => {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();

    // A. Suggesting a Command
    if (lowerQuery.startsWith(":") && !lowerQuery.includes(" ")) {
      const matchedCommand = normalizedCommands.find(
        (cmd) =>
          cmd.trigger.startsWith(lowerQuery) && lowerQuery !== cmd.trigger,
      );
      if (matchedCommand) {
        return { text: matchedCommand.trigger, isCommand: true };
      }
    }

    // B. Suggesting Data Content
    let searchPart = lowerQuery;
    let keysToSearch = searchKeys;

    if (activeCommandObj) {
      if (lowerQuery.length <= activeCommandObj.trigger.length) return null;
      searchPart = lowerQuery.replace(activeCommandObj.trigger, "").trim();

      if (activeCommandObj.scope) {
        keysToSearch = [activeCommandObj.scope as K];
      }
    }

    if (!searchPart) return null;

    // Reuse filter logic to find the first match for ghost text
    // Note: We scan strictly here for auto-complete purposes even if fuzzy is on
    const match = data.find((item) => {
      return keysToSearch.some((key) => {
        const val = item[key];
        const strVal = String(val).toLowerCase();

        if (Array.isArray(val)) {
          return (val as string[]).some((v) =>
            v.toLowerCase().startsWith(searchPart),
          );
        }
        return strVal.startsWith(searchPart);
      });
    });

    if (match) {
      let matchedText = "";
      for (const key of keysToSearch) {
        const val = match[key];
        if (Array.isArray(val)) {
          const subMatch = (val as string[]).find((v) =>
            v.toLowerCase().startsWith(searchPart),
          );
          if (subMatch) {
            matchedText = subMatch;
            break;
          }
        } else if (String(val).toLowerCase().startsWith(searchPart)) {
          matchedText = String(val);
          break;
        }
      }

      if (matchedText) {
        const prefix = activeCommandObj ? activeCommandObj.trigger + " " : "";
        return { text: prefix + matchedText, isCommand: false };
      }
    }

    return null;
  }, [query, data, searchKeys, normalizedCommands, activeCommandObj]);

  const ghostText = useMemo(() => {
    if (!suggestionDetails || !query) return "";
    const fullSuggestion = suggestionDetails.text;
    if (fullSuggestion.toLowerCase().startsWith(query.toLowerCase())) {
      return query + fullSuggestion.slice(query.length);
    }
    return "";
  }, [query, suggestionDetails]);

  const filteredData = useMemo(() => {
    let results = data;
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.startsWith(":") &&
      !lowerQuery.includes(" ") &&
      !activeCommandObj
    ) {
      return [];
    }

    if (activeCommandObj) {
      if (activeCommandObj.filter) {
        results = results.filter(activeCommandObj.filter);
      }

      const searchPart = lowerQuery
        .replace(activeCommandObj.trigger, "")
        .trim();

      if (searchPart) {
        const keysToSearch = activeCommandObj.scope
          ? [activeCommandObj.scope as K]
          : searchKeys;
        results = filterList(results, keysToSearch, searchPart, fuzzy);
      }
    } else {
      results = filterList(results, searchKeys, lowerQuery, fuzzy);
    }

    return maxResults ? results.slice(0, maxResults) : results;
  }, [query, data, searchKeys, activeCommandObj, fuzzy, maxResults]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab" && suggestionDetails) {
        e.preventDefault();
        const suffix = suggestionDetails.isCommand ? " " : "";
        setQuery(suggestionDetails.text + suffix);
      }
    },
    [suggestionDetails],
  );

  return {
    query,
    setQuery,
    filteredData,
    ghostText,
    isSuggestionAvailable: !!suggestionDetails,
    activeCommand: activeCommandObj?.trigger ?? null,
    inputProps: {
      value: query,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      placeholder: activeCommandObj
        ? `Search in ${activeCommandObj.trigger}...`
        : `Search or type ':' for commands...`,
    },
  };
}
