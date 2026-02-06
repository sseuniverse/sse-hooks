import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useEventCallback } from "../useEventCallback";
import { useEventListener } from "../useEventListener";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    "cookie-change": CustomEvent<{ key: string }>;
    visibilitychange: Event;
  }
}

const IS_SERVER = typeof document === "undefined";

/**
 * Options for customizing the behavior of the useCookie hook.
 * @template T - The type of the state to be stored in the cookie.
 */
export type UseCookieOptions<T> = {
  /** A function to serialize the value before storing it. */
  serializer?: (value: T) => string;
  /** A function to deserialize the stored value. */
  deserializer?: (value: string) => T;
  /**
   * If `true` (default), the hook will initialize reading the cookie.
   * @default true
   */
  initializeWithValue?: boolean;

  // Cookie attributes
  /**
   * A prefix to be prepended to the key (e.g., "myApp_").
   * Useful for namespacing or complying with cookie prefixes like `__Secure-` or `__Host-`.
   */
  prefix?: string;
  /**
   * The path within the site for which the cookie is valid.
   * @default "/"
   */
  path?: string;
  /** The domain for which the cookie is valid. */
  domain?: string;
  /** The expiration date of the cookie. */
  expires?: Date;
  /** The maximum age of the cookie in seconds. */
  maxAge?: number;
  /** If `true`, the cookie is only transmitted over secure protocols (HTTPS). */
  secure?: boolean;
  /**
   * Controls whether the cookie is sent with cross-site requests.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
   */
  sameSite?: "lax" | "strict" | "none";

  /** The default value to return if the cookie is not found. */
  defaultValue?: T;
};

/**
 * Helper function to parse the document.cookie string into an object.
 * 
 * @category storage
 * @returns {Record<string, string>} An object mapping cookie names to values.
 */
function parseCookies(): Record<string, string> {
  if (IS_SERVER) return {};
  return document.cookie.split("; ").reduce(
    (acc, part) => {
      const [k, ...v] = part.split("=");
      if (k && v) {
        acc[decodeURIComponent(k.trim())] = decodeURIComponent(v.join("="));
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

/**
 * Helper function to build the cookie string for storage.
 */
function buildCookie(
  key: string,
  value: string,
  options: UseCookieOptions<any>,
) {
  let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

  if (options.path) cookie += `; path=${options.path}`;
  if (options.domain) cookie += `; domain=${options.domain}`;
  if (options.expires) cookie += `; expires=${options.expires.toUTCString()}`;
  if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
  if (options.secure) cookie += `; secure`;
  if (options.sameSite) cookie += `; samesite=${options.sameSite}`;

  return cookie;
}

/**
 * Custom hook that manages state synchronized with a browser [`cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
 * It handles serialization, prefixes, updates across tabs, and custom event synchronization.
 * @template T - The type of the state to be stored in the cookie.
 * @param {string} key - The base name of the cookie.
 * @param {T | (() => T)} initialValue - The initial value of the state.
 * @param {UseCookieOptions<T>} [options] - Options for customization.
 * @returns {[T, Dispatch<SetStateAction<T>>, () => void]} A tuple containing the stored value, a setter, and a remover.
 * @public
 * @see [Documentation](/docs/use-cookie)
 * @example
 * ```tsx
 * // Creates a cookie named "__Secure-token"
 * const [token, setToken] = useCookie('token', '', {
 * prefix: '__Secure-',
 * secure: true,
 * });
 * ```
 */
export function useCookie<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseCookieOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const { initializeWithValue = true, prefix = "" } = options;
  const cookieKey = prefix + key;

  const serializer = useCallback<(value: T) => string>(
    (value) => {
      if (options.serializer) return options.serializer(value);
      return JSON.stringify(value);
    },
    [options],
  );

  const deserializer = useCallback<(value: string) => T>(
    (value) => {
      if (options.deserializer) return options.deserializer(value);
      if (value === "undefined") return undefined as unknown as T;

      const fallback =
        initialValue instanceof Function ? initialValue() : initialValue;

      try {
        return JSON.parse(value) as T;
      } catch {
        return fallback;
      }
    },
    [options, initialValue],
  );

  const readValue = useCallback((): T => {
    const fallback =
      initialValue instanceof Function ? initialValue() : initialValue;

    if (IS_SERVER) return fallback;

    const cookies = parseCookies();
    if (!(cookieKey in cookies)) return fallback;

    return deserializer(cookies[cookieKey]);
  }, [cookieKey, deserializer, initialValue]);

  const [storedValue, setStoredValue] = useState(() => {
    if (initializeWithValue) return readValue();
    return initialValue instanceof Function ? initialValue() : initialValue;
  });

  const setValue: Dispatch<SetStateAction<T>> = useEventCallback((value) => {
    if (IS_SERVER) return;

    try {
      const newValue = value instanceof Function ? value(readValue()) : value;
      const serialized = serializer(newValue);

      document.cookie = buildCookie(cookieKey, serialized, {
        path: "/",
        ...options,
      });

      setStoredValue(newValue);

      window.dispatchEvent(
        new CustomEvent("cookie-change", { detail: { key: cookieKey } }),
      );
    } catch (error) {
      console.warn(`Error setting cookie "${cookieKey}":`, error);
    }
  });

  const removeValue = useEventCallback(() => {
    if (IS_SERVER) return;

    const fallback =
      initialValue instanceof Function ? initialValue() : initialValue;

    document.cookie = buildCookie(cookieKey, "", {
      path: "/",
      ...options,
      expires: new Date(0),
    });

    setStoredValue(fallback);

    window.dispatchEvent(
      new CustomEvent("cookie-change", { detail: { key: cookieKey } }),
    );
  });

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookieKey]);

  const handleChange = useCallback(
    (event: CustomEvent<{ key: string }> | StorageEvent) => {
      // Check if the event matches our fully qualified cookie key
      if ("detail" in event && event.detail?.key !== cookieKey) return;
      if ("key" in event && event.key !== cookieKey) return;

      setStoredValue(readValue());
    },
    [cookieKey, readValue],
  );

  // Custom event for same-tab sync
  useEventListener("cookie-change", handleChange);

  // Visibility change for tab re-sync
  useEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      setStoredValue(readValue());
    }
  });

  return [storedValue, setValue, removeValue];
}
