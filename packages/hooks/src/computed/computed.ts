import { isFunction, __DEV__ } from "./shared";
import {
  type DebuggerEvent,
  type DebuggerOptions,
  type Subscriber,
  getActiveSub,
  setActiveSub,
} from "./effect";
import { Dep, type Link, globalVersion } from "./dep";
import { EffectFlags, TrackOpTypes } from "./constants";
import { Ref } from "./ref";

declare const ComputedRefSymbol: unique symbol;

type BaseComputedRef<T> = Ref<T> & {
  [ComputedRefSymbol]: true;
  effect: Subscriber;
};

export type ComputedRef<T = any> = BaseComputedRef<T> & {
  readonly value: T;
};

export type ComputedGetter<T> = (oldValue?: T) => T;
export type ComputedSetter<T> = (newValue: T) => void;

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

export function refreshComputed(computed: ComputedRefImpl) {
  if (computed.flags & EffectFlags.DIRTY) {
    const prevSub = getActiveSub();
    setActiveSub(computed);
    try {
      for (let link = computed.deps; link; link = link.nextDep) {
        link.version = -1;
        link.prevActiveLink = link.prevDep;
      }
      const value = computed.fn(computed._value);
      computed._value = value;
      computed.flags &= ~EffectFlags.DIRTY;
    } finally {
      setActiveSub(prevSub);
    }
  }
}

export class ComputedRefImpl<T = any> implements Subscriber {
  _value: any = undefined;
  readonly dep: Dep = new Dep(this);
  readonly __v_isRef = true;

  deps?: Link = undefined;
  depsTail?: Link = undefined;
  flags: EffectFlags = EffectFlags.DIRTY;
  globalVersion: number = globalVersion - 1;
  isSSR: boolean;

  effect: this = this;
  onTrack?: (event: DebuggerEvent) => void;
  onTrigger?: (event: DebuggerEvent) => void;

  constructor(
    public fn: ComputedGetter<T>,
    private readonly setter: ComputedSetter<T> | undefined,
    isSSR: boolean,
  ) {
    this.isSSR = isSSR;
  }

  notify(): true | void {
    this.flags |= EffectFlags.DIRTY;
    return true;
  }

  get value(): T {
    const link = __DEV__
      ? this.dep.track({ target: this, type: TrackOpTypes.GET, key: "value" })
      : this.dep.track();

    refreshComputed(this);

    if (link) link.version = this.dep.version;
    return this._value;
  }

  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    } else {
      console.warn("Write operation failed: computed value is readonly");
    }
  }
}

export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
  debugOptions?: DebuggerOptions,
  isSSR = false,
) {
  let getter: ComputedGetter<T>;
  let setter: ComputedSetter<T> | undefined;

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef as any;
}
