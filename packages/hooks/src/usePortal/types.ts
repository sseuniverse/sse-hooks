import React from "react";

export type HTMLElRef = React.MutableRefObject<HTMLElement>;
export type CustomEvent = {
  event?: React.SyntheticEvent<any, Event>;
  portal: HTMLElRef;
  targetEl: HTMLElRef;
} & React.SyntheticEvent<any, Event>;

export type CustomEventHandler = (customEvent: CustomEvent) => void;
export type CustomEventHandlers = {
  [K in keyof React.DOMAttributes<K>]?: CustomEventHandler;
};

export type EventListenerMap = {
  [K in keyof React.DOMAttributes<K>]: keyof GlobalEventHandlersEventMap;
};

export type EventListenersRef = React.MutableRefObject<{
  [K in keyof React.DOMAttributes<K>]?: (
    event: React.SyntheticEvent<any, Event>,
  ) => void;
}>;

export type UsePortalOptions = {
  /** Close the portal when clicking outside the portal content. @default true */
  closeOnOutsideClick?: boolean;
  /** Close the portal when the Escape key is pressed. @default true */
  closeOnEsc?: boolean;
  /** The DOM element to attach the portal to. @default document.body */
  bindTo?: HTMLElement;
  /** Initial open state. @default false */
  isOpen?: boolean;
  /** Callback fired when the portal opens. */
  onOpen?: CustomEventHandler;
  /** Callback fired when the portal closes. */
  onClose?: CustomEventHandler;
  /** Callback fired when the portal content is clicked. */
  onPortalClick?: CustomEventHandler;
  /** Set to true if managing open state entirely outside this hook. @default false */
  programmaticallyOpen?: boolean;
} & CustomEventHandlers;

export type UsePortalObjectReturn = {};
export type UsePortalArrayReturn = [];
