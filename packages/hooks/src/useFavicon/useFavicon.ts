import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";
import { useUnmount } from "../useUnmount";

/** Hook options. */
export type UseFaviconOptions = {
  /**
   * Whether to keep the favicon after unmounting the component (default is `true`).
   * If `false`, the favicon will revert to what it was before this hook mounted.
   */
  preserveFaviconOnUnmount?: boolean;
  /**
   * The MIME type of the favicon (default is `image/x-icon`).
   */
  type?: string;
};

/**
 * Custom hook that sets the document favicon.
 *
 * @category dom
 * @param {string} href - The URL of the favicon to set.
 * @param {UseFaviconOptions} [options] - Configuration options.
 * @public
 * @see [Documentation](/docs/use-favicon)
 * @example
 * ```tsx
 * // Basic usage
 * useFavicon('/assets/favicon-dark.ico');
 * // With options
 * useFavicon('/assets/notification-badge.ico', {
 * preserveFaviconOnUnmount: false, // Revert when component unmounts
 * type: 'image/png'
 * });
 * ```
 */
export function useFavicon(
  href: string,
  options: UseFaviconOptions = {},
): void {
  const { preserveFaviconOnUnmount = true, type = "image/x-icon" } = options;
  const defaultFavicon = useRef<{ href: string; type: string } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      defaultFavicon.current = { href: link.href, type: link.type };
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    const link: HTMLLinkElement =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");

    if (!link.parentNode) {
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.type = type;
    link.href = href;
  }, [href, type]);

  useUnmount(() => {
    if (!preserveFaviconOnUnmount && defaultFavicon.current) {
      const link = document.querySelector(
        "link[rel*='icon']",
      ) as HTMLLinkElement;

      if (link) {
        link.href = defaultFavicon.current.href;
        link.type = defaultFavicon.current.type;
      }
    }
  });
}
