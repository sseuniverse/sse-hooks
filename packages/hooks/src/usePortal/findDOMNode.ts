import React from "react";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

type ComponentOrElement<T> =
  | Element
  | Text
  | React.Component
  | React.RefObject<T>
  | null
  | undefined;

/**
 * A safe, typed alternative to findDOMNode.
 * Works with:
 * 1. DOM Elements (returns them directly)
 * 2. Ref Objects (returns .current)
 * 3. Null/Undefined (returns null)
 * NOT SUPPORTED: Passing a Class Component instance directly (legacy behavior).
 * You must use a Ref for Components.
 */
export default function findDOMNode<T = Element | Text>(
  componentOrElement: ComponentOrElement<T>,
): T | null {
  if (componentOrElement === null) {
    return null;
  }

  if (componentOrElement && "nodeType" in componentOrElement) {
    const node = componentOrElement as Node;
    if (node.nodeType === ELEMENT_NODE || node.nodeType === TEXT_NODE) {
      return node as unknown as T;
    }
  }

  if (
    componentOrElement &&
    "current" in componentOrElement &&
    componentOrElement.current !== null
  ) {
    return (componentOrElement as React.RefObject<T>).current;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[findDOMNode] You passed a Component instance or an unknown object. " +
        "This utility cannot strictly find DOM nodes from Component instances (like the deprecated react-dom version could). " +
        "Please pass a Ref (ref.current) or a direct DOM element.",
    );
  }

  return null;
}
