import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";
import { useUnmount } from "../useUnmount";

/** Hook options. */
type UseDocumentTitleOptions = {
  /** Whether to keep the title after unmounting the component (default is `true`). */
  preserveTitleOnUnmount?: boolean;
};

/**
 * Custom hook that sets the document title.
 *
 * @category dom
 * @param {string} title - The title to set.
 * @param {?UseDocumentTitleOptions} [options] - The options.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-document-title)
 * @public
 */
export function useDocumentTitle(
  title: string,
  options: UseDocumentTitleOptions = {},
): void {
  const { preserveTitleOnUnmount = true } = options;
  const defaultTitle = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    defaultTitle.current = window.document.title;
  }, []);

  useIsomorphicLayoutEffect(() => {
    window.document.title = title;
  }, [title]);

  useUnmount(() => {
    if (!preserveTitleOnUnmount && defaultTitle.current) {
      window.document.title = defaultTitle.current;
    }
  });
}
