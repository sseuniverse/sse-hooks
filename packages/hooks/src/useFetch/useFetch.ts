import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Options for customizing the behavior of the useFetch hook.
 * Extends the standard [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) interface.
 */
export interface UseFetchOptions extends RequestInit {
  /**
   * If `true`, the fetch request will be executed immediately upon mounting or when the URL changes.
   * @default false
   */
  immediate?: boolean;
  /**
   * Callback function invoked when the request completes successfully.
   * @param data - The parsed response data.
   */
  onSuccess?: (data: any) => void;
  /**
   * Callback function invoked when the request fails.
   * @param error - The error object.
   */
  onError?: (error: Error) => void;
}

/**
 * The state representation of the fetch request.
 * @template T - The type of the data.
 */
export interface UseFetchState<T> {
  /** The data received from the response, or null if not yet received. */
  data: T | null;
  /** Indicates if the request is currently in progress. */
  loading: boolean;
  /** The error object if the request failed, or null if successful. */
  error: Error | null;
}

/**
 * The return value of the useFetch hook, including state and control methods.
 * @template T - The type of the data.
 */
export interface UseFetchReturn<T> extends UseFetchState<T> {
  /**
   * Manually triggers the fetch request.
   * @param {string} [url] - Optional override URL.
   * @param {RequestInit} [options] - Optional override options.
   * @returns {Promise<T | null>} A promise that resolves to the data or null.
   */
  execute: (url?: string, options?: RequestInit) => Promise<T | null>;
  /** Aborts the current request if it is pending. */
  abort: () => void;
  /** Resets the state to its initial values (data: null, loading: false, error: null). */
  reset: () => void;
}

/**
 * Custom hook that provides a wrapper around the native [`fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to handle HTTP requests with state management, abort capability, and TypeScript support.
 * @template T - The type of the data expected from the response.
 * @param {string} [url] - The URL to fetch.
 * @param {UseFetchOptions} [options] - Options for customizing the request and hook behavior (optional).
 * @returns {UseFetchReturn<T>} An object containing the fetched data, loading status, error, and methods to control the request.
 * @public
 * @example
 * ```tsx
 * interface User {
 * id: number;
 * name: string;
 * }
 *
 * const { data, loading, error, execute } = useFetch<User>('https://api.example.com/user/1', {
 * immediate: true,
 * onSuccess: (data) => console.log('User loaded:', data),
 * });
 * ```
 */
export function useFetch<T = any>(
  url?: string,
  options: UseFetchOptions = {},
): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const execute = useCallback(
    async (
      executeUrl?: string,
      executeOptions?: RequestInit,
    ): Promise<T | null> => {
      const targetUrl = executeUrl || url;

      if (!targetUrl) {
        const error = new Error("No URL provided");
        setState((prev) => ({ ...prev, error, loading: false }));
        optionsRef.current.onError?.(error);
        throw error;
      }

      // Abort previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { immediate, onSuccess, onError, ...fetchOptions } =
          optionsRef.current;

        const response = await fetch(targetUrl, {
          ...fetchOptions,
          ...executeOptions,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Try to parse as JSON, fallback to text
        let data: T;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        setState({ data, loading: false, error: null });
        onSuccess?.(data);
        return data;
      } catch (error) {
        const fetchError = error as Error;

        // Don't update state if request was aborted
        if (fetchError.name !== "AbortError") {
          setState((prev) => ({ ...prev, loading: false, error: fetchError }));
          optionsRef.current.onError?.(fetchError);
        }

        throw fetchError;
      }
    },
    [url],
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    abort();
    setState({ data: null, loading: false, error: null });
  }, [abort]);

  // Execute immediately if immediate option is true and url is provided
  useEffect(() => {
    if (options.immediate && url) {
      execute();
    }
  }, [url, options.immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return {
    ...state,
    execute,
    abort,
    reset,
  };
}

// Convenience hooks for specific HTTP methods
export function useGet<T = any>(url?: string, options: UseFetchOptions = {}) {
  return useFetch<T>(url, { ...options, method: "GET" });
}

export function usePost<T = any>(url?: string, options: UseFetchOptions = {}) {
  return useFetch<T>(url, { ...options, method: "POST" });
}

export function usePut<T = any>(url?: string, options: UseFetchOptions = {}) {
  return useFetch<T>(url, { ...options, method: "PUT" });
}

export function useDelete<T = any>(
  url?: string,
  options: UseFetchOptions = {},
) {
  return useFetch<T>(url, { ...options, method: "DELETE" });
}
