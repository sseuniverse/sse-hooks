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
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  bindTo?: HTMLElement; // attach the portal to this node in the DOM
  isOpen?: boolean;
  onOpen?: CustomEventHandler;
  onClose?: CustomEventHandler;
  onPortalClick?: CustomEventHandler;
  programmaticallyOpen?: boolean;
} & CustomEventHandlers;

export type UsePortalObjectReturn = {};
export type UsePortalArrayReturn = [];
