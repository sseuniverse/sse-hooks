import { ComputedRefImpl } from "./computed";
import { EffectFlags, TrackOpTypes } from "./constants";
import { extend, __DEV__ } from "./shared";

import {
  getActiveSub,
  shouldTrack,
  startBatch,
  endBatch,
  type Subscriber,
  type DebuggerEventExtraInfo,
} from "./effect";

export let globalVersion = 0;

export class Link {
  version: number;
  nextDep?: Link;
  prevDep?: Link;
  nextSub?: Link;
  prevSub?: Link;
  prevActiveLink?: Link;

  constructor(
    public sub: Subscriber,
    public dep: Dep,
  ) {
    this.version = dep.version;
  }
}

export class Dep {
  version = 0;
  activeLink?: Link = undefined;
  subs?: Link = undefined;
  subsHead?: Link;
  map?: Map<any, Dep> = undefined;
  key?: unknown = undefined;
  sc: number = 0;

  constructor(public computed?: ComputedRefImpl | undefined) {
    if (__DEV__) {
      this.subsHead = undefined;
    }
  }

  track(debugInfo?: DebuggerEventExtraInfo): Link | undefined {
    const activeSub = getActiveSub();
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }

    let link = this.activeLink;
    if (link === undefined || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);

      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail!.nextDep = link;
        activeSub.depsTail = link;
      }

      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) link.prevDep.nextDep = next;

        link.prevDep = activeSub.depsTail;
        link.nextDep = undefined;
        activeSub.depsTail!.nextDep = link;
        activeSub.depsTail = link;

        if (activeSub.deps === link) activeSub.deps = next;
      }
    }

    if (__DEV__ && activeSub.onTrack) {
      activeSub.onTrack(extend({ effect: activeSub }, debugInfo));
    }

    return link;
  }

  trigger(debugInfo?: DebuggerEventExtraInfo): void {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }

  notify(debugInfo?: DebuggerEventExtraInfo): void {
    startBatch();
    try {
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          (link.sub as ComputedRefImpl).dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
}

function addSub(link: Link) {
  link.dep.sc++;
  if (link.sub.flags & EffectFlags.TRACKING) {
    const computed = link.dep.computed;
    if (computed && !link.dep.subs) {
      computed.flags |= EffectFlags.TRACKING | EffectFlags.DIRTY;
      for (let l = computed.deps; l; l = l.nextDep) {
        addSub(l);
      }
    }

    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    link.dep.subs = link;
  }
}

// Global Target Map
type KeyToDepMap = Map<any, Dep>;
export const targetMap: WeakMap<object, KeyToDepMap> = new WeakMap();

export function track(target: object, type: TrackOpTypes, key: unknown): void {
  const activeSub = getActiveSub();
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Dep()));
      dep.map = depsMap;
      dep.key = key;
    }
    dep.track({ target, type, key });
  }
}
