import { useEventListener } from "../useEventListener";

/**
 * Custom hook that handles click events anywhere on the document.
 * 
 * @category dom
 * @param {Function} handler - The function to be called when a click event is detected anywhere on the document.
 * @public
 * @see [Documentation](/docs/use-click-any-where)
 * @example
 * ```tsx
 * const handleClick = (event) => {
 *   console.log('Document clicked!', event);
 * };
 *
 * // Attach click event handler to document
 * useClickAnywhere(handleClick);
 * ```
 */
export function useClickAnyWhere(handler: (event: MouseEvent) => void) {
  useEventListener("click", (event) => {
    handler(event);
  });
}
