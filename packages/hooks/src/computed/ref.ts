import { Dep } from "./dep";
import { TrackOpTypes, TriggerOpTypes } from "./constants";

export interface Ref<T = any> {
  value: T;
}

export class RefImpl<T> implements Ref<T> {
  private _value: T;
  public dep: Dep;
  public __v_isRef = true;

  constructor(value: T) {
    this._value = value;
    this.dep = new Dep();
  }

  get value() {
    this.dep.track({ target: this, type: TrackOpTypes.GET, key: "value" });
    return this._value;
  }

  set value(newVal: T) {
    if (newVal !== this._value) {
      this._value = newVal;
      this.dep.trigger({
        target: this,
        type: TriggerOpTypes.SET,
        key: "value",
        newValue: newVal,
      });
    }
  }
}

export function ref<T>(value: T): Ref<T> {
  return new RefImpl(value);
}
