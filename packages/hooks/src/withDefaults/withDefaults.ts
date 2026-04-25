import { useMemo } from "react";

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export type DefineProps<T, BKeys extends keyof T> = Readonly<T> & {
  readonly [K in BKeys]-?: boolean;
};

type NotUndefined<T> = T extends undefined ? never : T;
type MappedOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>;
};

type NativeType =
  | null
  | undefined
  | number
  | string
  | boolean
  | symbol
  | Function;

type InferDefault<P, T> =
  | ((props: P) => T & {})
  | (T extends NativeType ? T : never);

type PropsWithDefaults<
  T,
  Defaults extends InferDefaults<T>,
  BKeys extends keyof T,
> = T extends unknown
  ? Readonly<MappedOmit<T, keyof Defaults>> & {
      readonly [K in keyof Defaults as K extends keyof T
        ? K
        : never]-?: K extends keyof T
        ? Defaults[K] extends undefined
          ? IfAny<Defaults[K], NotUndefined<T[K]>, T[K]>
          : NotUndefined<T[K]>
        : never;
    } & {
      readonly [K in BKeys]-?: K extends keyof Defaults
        ? Defaults[K] extends undefined
          ? boolean | undefined
          : boolean
        : boolean;
    }
  : never;

/**
 * Utility hook that merges default values into a props object, resolving function defaults and memoizing the result.
 * @category utilities
 * @template T - The type of the properties object.
 * @template BKeys - The boolean keys within the properties object.
 * @param {DefineProps<T, BKeys>} props - The base properties object.
 * @param {InferDefaults<T>} defaults - An object containing default values or factory functions for the properties.
 * @returns {PropsWithDefaults<T, InferDefaults<T>, BKeys>} A memoized props object with the default values applied.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/with-defaults)
 * @public
 */
export function withDefaults<T, BKeys extends keyof T = never>(
  props: DefineProps<T, BKeys>,
  defaults: InferDefaults<T>,
): PropsWithDefaults<T, InferDefaults<T>, BKeys> {
  const merged = useMemo(() => {
    const result = { ...props } as any;

    for (const key in defaults) {
      if (!(key in result) || result[key] === undefined) {
        const def = defaults[key];
        if (typeof def === "function") {
          result[key] = (def as (props: T) => any)(result);
        } else {
          result[key] = def;
        }
      }
    }

    return result;
  }, [props, defaults]);

  return merged as PropsWithDefaults<T, InferDefaults<T>, BKeys>;
}
