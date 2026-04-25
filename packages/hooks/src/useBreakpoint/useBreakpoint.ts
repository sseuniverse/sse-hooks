import { useMediaQuery } from "../useMediaQuery";

function match(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

interface UseBreakpointReturns<
  BreakPoints extends Record<string, number>,
  BreakPointsKey extends keyof BreakPoints = keyof BreakPoints,
> {
  useGreater: (k: BreakPointsKey) => boolean;
  useSmaller: (k: BreakPointsKey) => boolean;
  useBetween: (a: BreakPointsKey, b: BreakPointsKey) => boolean;
  isGreater(k: BreakPointsKey): boolean;
  isSmaller(k: BreakPointsKey): boolean;
  isInBetween(a: BreakPointsKey, b: BreakPointsKey): boolean;
}

/**
 * Custom hook that provides utility hooks and functions to evaluate screen widths against a given set of breakpoints.
 *
 * @category sensors
 * @param {BreakPoints} breakpoints - An object containing breakpoint keys and their corresponding numeric pixel values.
 * @returns {UseBreakpointReturns} An object containing boolean hooks (`useGreater`, `useSmaller`, `useBetween`) and utility functions (`isGreater`, `isSmaller`, `isInBetween`) to check media query matches.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-breakpoint)
 * @public
 */
export function useBreakpoint<
  BreakPoints extends Record<string, number>,
  BreakPointsKey extends keyof BreakPoints = keyof BreakPoints,
>(breakpoints: BreakPoints): UseBreakpointReturns<BreakPoints, BreakPointsKey> {
  return {
    /**
     * Hook that returns a boolean if screen width is greater than given breakpoint.
     *
     * @param k {string} breakpoint
     * @returns boolean
     *
     * @see https://react-hooks-library.vercel.app/core/BreakPointHooks
     **/
    useGreater: (k: BreakPointsKey) => {
      return useMediaQuery(`(min-width: ${breakpoints[k]}px)`);
    },

    /**
     * Hook that returns a boolean if screen width is smaller than given breakpoint.
     *
     * @param k {string} breakpoint
     * @param k {string} breakpoint
     *
     * @returns boolean
     *
     * @see https://react-hooks-library.vercel.app/core/BreakPointHooks
     **/
    useSmaller: (k: BreakPointsKey) => {
      return useMediaQuery(`(max-width: ${breakpoints[k]}px)`);
    },

    /**
     * Hook that returns a boolean if screen width is between two given breakpoint.
     *
     * @param a {string} breakpoint
     * @param b {string} breakpoint
     *
     * @returns boolean
     *
     * @see https://react-hooks-library.vercel.app/core/BreakPointHooks
     **/
    useBetween: (a: BreakPointsKey, b: BreakPointsKey) => {
      return useMediaQuery(
        `(min-width: ${breakpoints[a]}px) and (max-width: ${breakpoints[b]}px)`,
      );
    },

    /**
     * Utility function that returns a boolean if screen width is greater than given breakpoint.
     *
     * @param k {string} breakpoint
     *
     * @see https://react-hooks-library.vercel.app/core/BreakPointHooks
     **/
    isGreater(k: BreakPointsKey) {
      return match(`(min-width: ${breakpoints[k]}px)`);
    },

    /**
     * Utility function that returns a boolean if screen width is smaller than given breakpoint.
     *
     * @param k {string} breakpoint
     *
     * @see https://react-hooks-library.vercel.app/core/BreakPointHooks
     **/
    isSmaller(k: BreakPointsKey) {
      return match(`(max-width: ${breakpoints[k]}px)`);
    },

    /**
     * Utility function that returns a boolean if screen width is between two given breakpoint.
     *
     * @param k {string} breakpoint
     *
     * @see https://react-hooks-library.vercel.app/core/BreakPointHooks
     **/
    isInBetween(a: BreakPointsKey, b: BreakPointsKey) {
      return match(
        `(min-width: ${breakpoints[a]}px) and (max-width: ${breakpoints[b]}px)`,
      );
    },
  };
}
