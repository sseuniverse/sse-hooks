import React from "react";
import { useForkRef } from "../useForkRef";
import ownerDocument from "./utils/ownerDocument";
import { useEventCallback } from "../useEventCallback";

/**
 * Supported touch events for the click-away listener.
 */
type ClickAwayTouchEventHandler = "onTouchStart" | "onTouchEnd";

/**
 * Supported mouse events for the click-away listener.
 */
type ClickAwayMouseEventHandler =
  | "onClick"
  | "onMouseDown"
  | "onMouseUp"
  | "onPointerDown"
  | "onPointerUp";

/**
 * Options for the `useClickAway` hook.
 */
export interface UseClickAwayOptions {
  /**
   * If `true`, the React tree is ignored and only the DOM tree is considered.
   * This prop changes how portaled elements are handled.
   * @default false
   */
  disableReactTree?: boolean;
  /**
   * The mouse event to listen to. You can disable the listener by providing `false`.
   * @default 'onClick'
   */
  mouseEvent?: ClickAwayMouseEventHandler | false;
  /**
   * The touch event to listen to. You can disable the listener by providing `false`.
   * @default 'onTouchEnd'
   */
  touchEvent?: ClickAwayTouchEventHandler | false;
  /**
   * An external ref to merge with the hook's internal ref.
   * Useful if you need to access the DOM element outside of this hook.
   */
  ref?: React.Ref<Element>;
}

function mapEventPropToEvent(
  eventProp: ClickAwayMouseEventHandler | ClickAwayTouchEventHandler,
):
  | "click"
  | "mousedown"
  | "mouseup"
  | "touchstart"
  | "touchend"
  | "pointerdown"
  | "pointerup" {
  return eventProp.substring(2).toLowerCase() as any;
}

function clickedRootScrollbar(event: MouseEvent, doc: Document) {
  return (
    doc.documentElement.clientWidth < event.clientX ||
    doc.documentElement.clientHeight < event.clientY
  );
}

/**
 * Custom hook that triggers a callback when a user clicks outside the referenced element.
 * It handles portal elements, scrollbar clicks, and touch interactions intelligently.
 *
 * @param onClickAway - The callback function to be called when a click outside is detected.
 * @param options - Configuration options for the hook.
 * @returns {object} An object containing the `ref` to attach to the target element and `listenerProps` to spread.
 * @public
 * @example
 * ```tsx
 * const handleClickAway = () => {
 * console.log('Clicked outside!');
 * setOpen(false);
 * };
 *
 * const { ref, listenerProps } = useClickAway(handleClickAway);
 *
 * return (
 * <div ref={ref} {...listenerProps}>
 * I will detect clicks outside of me.
 * </div>
 * );
 * ```
 */
export function useClickAway(
  onClickAway: (event: MouseEvent | TouchEvent) => void,
  options: UseClickAwayOptions = {},
): { ref: React.Ref<Element>; listenerProps: Record<string, any> } {
  const {
    disableReactTree = false,
    mouseEvent = "onClick",
    touchEvent = "onTouchEnd",
    ref: externalRef,
  } = options;

  // We need an internal ref to check if the event target is inside the element
  const internalRef = React.useRef<Element>(null);

  // We fork the ref so the user can pass their own ref AND we can use ours
  const handleRef = useForkRef(externalRef, internalRef);

  const movedRef = React.useRef(false);
  const activatedRef = React.useRef(false);
  const syntheticEventRef = React.useRef(false);

  React.useEffect(() => {
    // Ensure that this component is not "activated" synchronously.
    // https://github.com/facebook/react/issues/20074
    const timer = setTimeout(() => {
      activatedRef.current = true;
    }, 0);

    return () => {
      activatedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  const handleClickAway = useEventCallback((event: MouseEvent | TouchEvent) => {
    // Given developers can stop the propagation of the synthetic event,
    // we can only be confident with a positive value.
    const insideReactTree = syntheticEventRef.current;
    syntheticEventRef.current = false;

    const doc = ownerDocument(internalRef.current);

    // 1. IE11 support
    // 2. The child might render null.
    // 3. Behave like a blur listener.
    if (
      !activatedRef.current ||
      !internalRef.current ||
      ("clientX" in event && clickedRootScrollbar(event as MouseEvent, doc))
    ) {
      return;
    }

    // Do not act if user performed touchmove
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    let insideDOM;

    // If not enough, can use https://github.com/DieterHolvoet/event-propagation-path/blob/master/propagationPath.js
    if (event.composedPath) {
      insideDOM = event.composedPath().includes(internalRef.current);
    } else {
      insideDOM =
        !doc.documentElement.contains(
          // @ts-expect-error returns `false` as intended when not dispatched from a Node
          event.target,
        ) ||
        internalRef.current.contains(
          // @ts-expect-error returns `false` as intended when not dispatched from a Node
          event.target,
        );
    }

    if (!insideDOM && (disableReactTree || !insideReactTree)) {
      onClickAway(event);
    }
  });

  // Keep track of mouse/touch events that bubbled up through the portal.
  const createHandleSynthetic = (event: React.SyntheticEvent) => {
    syntheticEventRef.current = true;
  };

  React.useEffect(() => {
    if (touchEvent !== false) {
      const mappedTouchEvent = mapEventPropToEvent(touchEvent);
      const doc = ownerDocument(internalRef.current);

      const handleTouchMove = () => {
        movedRef.current = true;
      };

      doc.addEventListener(mappedTouchEvent, handleClickAway);
      doc.addEventListener("touchmove", handleTouchMove);

      return () => {
        doc.removeEventListener(mappedTouchEvent, handleClickAway);
        doc.removeEventListener("touchmove", handleTouchMove);
      };
    }

    return undefined;
  }, [handleClickAway, touchEvent]);

  React.useEffect(() => {
    if (mouseEvent !== false) {
      const mappedMouseEvent = mapEventPropToEvent(mouseEvent);
      const doc = ownerDocument(internalRef.current);

      doc.addEventListener(mappedMouseEvent, handleClickAway);

      return () => {
        doc.removeEventListener(mappedMouseEvent, handleClickAway);
      };
    }

    return undefined;
  }, [handleClickAway, mouseEvent]);

  // Props to spread onto the target element
  const listenerProps: Record<string, any> = {};
  if (mouseEvent !== false) {
    listenerProps[mouseEvent] = createHandleSynthetic;
  }
  if (touchEvent !== false) {
    listenerProps[touchEvent] = createHandleSynthetic;
  }

  return {
    ref: handleRef,
    listenerProps,
  };
}
