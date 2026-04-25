import { useCallback, useState } from "react";

import type { Dispatch, SetStateAction } from "react";

/**
 * Custom hook that manages a boolean toggle state in React components.
 *
 * @category state
 * @param {boolean} [defaultValue] - The initial value for the toggle state.
 * @returns {[boolean, () => void, Dispatch<SetStateAction<boolean>>]} A tuple containing the current state, a function to toggle the state, and a function to set the state explicitly.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-toggle)
 * @public
 */
export function useToggle(
  defaultValue?: boolean,
): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState(!!defaultValue);

  const toggle = useCallback(() => {
    setValue((x) => !x);
  }, []);

  return [value, toggle, setValue];
}
