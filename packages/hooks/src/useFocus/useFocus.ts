import { RefObject, useEffect, useState } from "react";

/**
 * Custom hook that tracks the focus state of a DOM element.
 * @category dom
 * @param {RefObject<HTMLElement>} ref - The React ref object attached to the DOM element.
 * @param {boolean} [defaultState=false] - The initial focus state.
 * @returns {boolean} True if the element is currently focused, false otherwise.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-focus)
 * @public
 */
export const useFocus = <T extends HTMLElement>(
  ref: RefObject<T>,
  defaultState: boolean = false,
): boolean => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("focus", () => setState(true));
    element.addEventListener("blur", () => setState(false));

    return () => {
      element.removeEventListener("focus", () => setState(true));
      element.removeEventListener("blur", () => setState(false));
    };
  }, [ref]);

  return state;
};
