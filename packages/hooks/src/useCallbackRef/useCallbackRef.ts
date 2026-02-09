import React from "react";

/**
 * A custom hook that converts a callback to a ref to avoid triggering re-renders when passed as a prop or avoid re-executing effects when passed as a dependency
 *
 * @category utilities
 * @type T - A function type that accepts any arguments and returns any value.
 * @param callback - The callback function to store in a ref. It can be undefined.
 * @returns T A stable function reference that always calls the latest callback.
 *
 * @public
 * @example
 * ```tsx
 * const handleClick = useCallbackRef((event: MouseEvent) => {
 *   console.log("Clicked!", event);
 * });
 *
 * useEffect(() => {
 *   window.addEventListener("click", handleClick);
 *   return () => window.removeEventListener("click", handleClick);
 * }, []);
 * ```
 */
function useCallbackRef<T extends (...args: any[]) => any>(
  callback: T | undefined,
): T {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  });

  // https://github.com/facebook/react/issues/19240
  return React.useMemo(
    () => ((...args) => callbackRef.current?.(...args)) as T,
    [],
  );
}

export { useCallbackRef };
