import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook that determines if the component is currently mounted.
 * 
 * @category lifecycle
 * @returns {() => boolean} A function that returns a boolean value indicating whether the component is mounted.
 * @public
 * @see [Documentation](/docs/use-is-mounted)
 * @example
 * ```tsx
 * const isComponentMounted = useIsMounted();
 * // Use isComponentMounted() to check if the component is currently mounted before performing certain actions.
 * ```
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}
