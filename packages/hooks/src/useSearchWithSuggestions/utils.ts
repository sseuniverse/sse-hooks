/**
 * Generic filtering logic for arrays of objects.
 * Checks if any of the specified keys in an item match the search term.
 *
 * @param list - The array of data to filter.
 * @param keys - The keys to search within.
 * @param term - The search term.
 * @param isFuzzy - Whether to use fuzzy matching (includes) or strict (startsWith).
 */
export function filterList<T, K extends keyof T>(
  list: T[],
  keys: readonly K[],
  term: string,
  isFuzzy: boolean,
): T[] {
  if (!term) return list;

  return list.filter((item) =>
    keys.some((key) => {
      const val = item[key];
      const strVal = String(val).toLowerCase();

      if (Array.isArray(val)) {
        return (val as string[]).some((v) =>
          isFuzzy
            ? v.toLowerCase().includes(term)
            : v.toLowerCase().startsWith(term),
        );
      }

      return isFuzzy ? strVal.includes(term) : strVal.startsWith(term);
    }),
  );
}
