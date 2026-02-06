import { Device } from "./enum";

export interface UseSSRReturn {
  /** Whether code is running in the browser. */
  isBrowser: boolean;
  /** Whether code is running on the server. */
  isServer: boolean;
  /** Whether code is running in a Native environment (e.g. React Native). */
  isNative: boolean;
  /** The detected device type. */
  device: Device;
  /** Whether Web Workers are supported. */
  canUseWorkers: boolean;
  /** Whether window.addEventListener is available. */
  canUseEventListeners: boolean;
  /** Whether window.screen is available. */
  canUseViewport: boolean;
}
