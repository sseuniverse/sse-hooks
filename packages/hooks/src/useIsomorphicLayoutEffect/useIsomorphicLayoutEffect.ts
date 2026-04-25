import { useEffect, useLayoutEffect } from "react";

/**
 * Custom hook that uses either `useLayoutEffect` or `useEffect` based on the environment (client-side or server-side).
 *
 * @category effect
 * @param {Function} effect - The effect function to be executed.
 * @param {Array<any>} [dependencies] - An array of dependencies for the effect (optional).
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-isomorphic-layout-effect)
 * @public
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
