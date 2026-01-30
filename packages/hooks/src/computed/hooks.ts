import { useEffect, useMemo, useRef, useState } from "react";
import { EffectFlags } from "./constants";
import { Link } from "./dep";
import { getActiveSub, setActiveSub, Subscriber } from "./effect";
import { Ref } from "./ref";
import { computed } from "./computed";

/**
 * A subscriber bridge that connects the Vue-like Dep system to React's state.
 */
class ReactSubscriber implements Subscriber {
  deps?: Link;
  depsTail?: Link;
  flags: EffectFlags = EffectFlags.TRACKING;

  constructor(private triggerUpdate: () => void) {}

  notify() {
    // When a dependency changes, trigger a React state update
    this.triggerUpdate();
  }
}

export function useReactive<T>(refObj: Ref<T>): T {
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick((t) => t + 1);
  const subscriberRef = useRef<ReactSubscriber | null>(null);

  if (!subscriberRef.current) {
    subscriberRef.current = new ReactSubscriber(forceUpdate);
  }

  const sub = subscriberRef.current!;
  const prevSub = getActiveSub();
  setActiveSub(sub);
  const value = refObj.value;
  setActiveSub(prevSub);

  useEffect(() => {
    return () => {};
  }, []);

  return value;
}

export function useComputed<T>(getter: () => T, deps: any[] = []): T {
  const cRef = useMemo(() => computed(getter), deps);
  return useReactive(cRef);
}
