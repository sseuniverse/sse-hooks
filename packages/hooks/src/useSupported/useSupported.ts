import { useEffect, useState } from "react";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";

/**
 * Custom hook that safely checks if a specific feature or browser API is supported.
 * @category utilities
 * @param {() => unknown} callback - A function that attempts to access or use the feature/API.
 * @param {boolean} [sync=false] - If true, evaluates the support synchronously using `useIsomorphicLayoutEffect` instead of `useEffect`.
 * @returns {boolean} True if the callback executes successfully and returns a truthy value, false otherwise.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-supported)
 * @public
 */
export function useSupported(callback: () => unknown, sync = false): boolean {
  const [supported, setSupported] = useState(false);

  const effect = sync ? useIsomorphicLayoutEffect : useEffect;

  effect(() => {
    try {
      setSupported(Boolean(callback()));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
