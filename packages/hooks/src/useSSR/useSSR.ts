import { Device } from "./enum";
import { UseSSRReturn } from "./types";

const { Browser, Server, Native } = Device;

const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const canUseNative: boolean =
  typeof navigator != "undefined" && navigator.product == "ReactNative";

const device = canUseNative ? Native : canUseDOM ? Browser : Server;

const SSRObject: UseSSRReturn = {
  isBrowser: device === Browser,
  isServer: device === Server,
  isNative: device === Native,
  device,
  canUseWorkers: typeof Worker !== "undefined",
  canUseEventListeners: device === Browser && !!window.addEventListener,
  canUseViewport: device === Browser && !!window.screen,
};

const assign = (...args: any[]) =>
  args.reduce((acc, obj) => ({ ...acc, ...obj }), {});
const values = (obj: any) => Object.keys(obj).map((key) => obj[key]);
const toArrayObject = (): UseSSRReturn =>
  assign((values(SSRObject), SSRObject));

let useSSRObject = toArrayObject();

export const weAreServer = () => {
  SSRObject.isServer = true;
  useSSRObject = toArrayObject();
};

/**
 * Custom hook that detects the current environment (Browser, Server, or Native)
 * and capability support (Workers, EventListeners). useful for avoiding hydration mismatches.
 * * @category utilities
 * @returns {UseSSRReturn} Object containing boolean flags for the current environment.
 * @public
 * @see [Documentation](/docs/use-ssr)
 * @example
 * ```tsx
 * const { isBrowser, isServer } = useSSR();
 * * if (isServer) {
 * return <StaticLoader />;
 * }
 * * return <ClientComponent />;
 * ```
 */
export const useSSR = (): UseSSRReturn => useSSRObject;
