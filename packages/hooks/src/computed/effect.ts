import { EffectFlags, TrackOpTypes, TriggerOpTypes } from "./constants";
import type { Link } from "./dep";

export interface Subscriber {
  deps?: Link;
  depsTail?: Link;
  flags: EffectFlags;
  next?: Subscriber;
  notify(): true | void;
  onTrack?: (event: DebuggerEvent) => void;
  onTrigger?: (event: DebuggerEvent) => void;
}

export type DebuggerEvent = {
  effect: Subscriber;
} & DebuggerEventExtraInfo;

export type DebuggerEventExtraInfo = {
  target: object;
  type: TrackOpTypes | TriggerOpTypes;
  key: any;
  newValue?: any;
  oldValue?: any;
  oldTarget?: Map<any, any> | Set<any>;
};

export interface DebuggerOptions {
  onTrack?: (event: DebuggerEvent) => void;
  onTrigger?: (event: DebuggerEvent) => void;
}

// Global State
let activeSub: Subscriber | undefined;
export let shouldTrack = true;
let batchDepth = 0;

export function getActiveSub() {
  return activeSub;
}
export function setActiveSub(sub: Subscriber | undefined) {
  activeSub = sub;
}

export function startBatch() {
  batchDepth++;
}
export function endBatch() {
  batchDepth--;
}

export function batch(sub: Subscriber, isComputed = false) {
  // Placeholder for scheduler logic
}
