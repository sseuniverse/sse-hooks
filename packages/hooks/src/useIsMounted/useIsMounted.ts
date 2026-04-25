import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook that determines if the component is currently mounted.
 *
 * @category lifecycle
 * @returns {() => boolean} A function that returns a boolean value indicating whether the component is mounted.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-is-mounted)
 * @public
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
