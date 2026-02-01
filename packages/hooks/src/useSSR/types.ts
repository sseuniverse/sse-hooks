import { Device } from "./enum";

export interface UseSSRReturn {
  isBrowser: boolean;
  isServer: boolean;
  isNative: boolean;
  device: Device;
  canUseWorkers: boolean;
  canUseEventListeners: boolean;
  canUseViewport: boolean;
}
