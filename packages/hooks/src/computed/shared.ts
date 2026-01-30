export const extend = Object.assign;
export const isArray = Array.isArray;
export const isMap = (val: unknown): val is Map<any, any> => val instanceof Map;

export const isFunction = (val: unknown): val is Function =>
  typeof val === "function";

export const isSymbol = (val: unknown): val is symbol =>
  typeof val === "symbol";

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === "object";

export const isIntegerKey = (key: any) =>
  typeof key === "string" &&
  key !== "NaN" &&
  key[0] !== "-" &&
  "" + parseInt(key, 10) === key;

export const __DEV__ = process.env.NODE_ENV !== "production";
