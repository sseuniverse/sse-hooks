import { useEventListener } from "../useEventListener";

/**
 * Custom hook that handles click events anywhere on the document.
 * 
 * @category dom
 * @param {Function} handler - The function to be called when a click event is detected anywhere on the document.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-click-any-where)
 * @public
 */
export function useClickAnyWhere(handler: (event: MouseEvent) => void) {
  useEventListener("click", (event) => {
    handler(event);
  });
}
