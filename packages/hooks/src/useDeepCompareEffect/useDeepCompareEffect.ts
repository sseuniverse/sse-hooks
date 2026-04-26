import { useEffect } from "react";
import { useDeepCompareMemoize } from "./helper";

/**
 * Custom hook that serves as a drop-in replacement for `useEffect`, but uses deep comparison on its dependencies instead of reference equality.
 * @category effect
 * @param {React.EffectCallback} effect - The effect function to be executed.
 * @param {React.DependencyList} [deps] - An array of dependencies for the effect (optional).
 * @returns {void}
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-deep-compare-effect)
 * @public
 */
export function useDeepCompareEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
): void {
  const memoizedDeps = useDeepCompareMemoize(deps);
  useEffect(effect, memoizedDeps);
}
