import { useEffect, useRef } from "react";

/**
 * Custom hook that runs a cleanup function when the component is unmounted.
 *
 * @category lifecycle
 * @param {() => void} func - The cleanup function to be executed on unmount.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-unmount)
 * @public
 */
export function useUnmount(func: () => void) {
  const funcRef = useRef(func);

  funcRef.current = func;

  useEffect(
    () => () => {
      funcRef.current();
    },
    [],
  );
}
