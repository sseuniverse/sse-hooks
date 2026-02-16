import { useMemo, useRef } from "react";

type PickFunction<T extends (this: any, ...args: any[]) => any> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

/**
 * A hook that returns a memoized version of a function. 
 * Unlike `useCallback`, the function identity remains stable across re-renders, 
 * but it always has access to the latest props and state without needing a dependency array.
 * This is particularly useful for passing callbacks to optimized child components 
 * to prevent unnecessary re-renders while avoiding closure staleness.
 *
 * @category utilities
 * @param fn - The function to be memoized.
 * @returns A persistent function that internally calls the latest version of the passed function.
 * @public
 * @example
 * ```tsx
 * const [state, setState] = useState(0);
 * // The identity of 'callback' never changes, but it always logs the latest 'state'
 * const callback = useMemoizedFn(() => {
 * console.log('Current state:', state);
 * });
 * return <ExpensiveComponent onClick={callback} />;
 * ```
 */
export function useMemoizedFn<T extends (this: any, ...args: any[]) => any>(
  fn: T,
): PickFunction<T> {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    if (!(typeof fn === "function")) {
      console.error(
        `useMemoizedFn expected parameter is a function, got ${typeof fn}`,
      );
    }
  }

  const fnRef = useRef<T>(fn);
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo<T>(() => fn, [fn]);

  const memoizedFn = useRef<PickFunction<T>>(undefined);
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current;
}
