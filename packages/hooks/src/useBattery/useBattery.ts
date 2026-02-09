import { useEffect, useState } from "react";

/**
 * Represents the state of the battery.
 */
export interface BatteryState {
  /**
   * A boolean value indicating whether the battery is currently being charged.
   */
  charging: boolean;
  /**
   * A number representing the remaining time in seconds until the battery is fully charged,
   * or 0 if the battery is already fully charged.
   */
  chargingTime: number;
  /**
   * A number representing the remaining time in seconds until the battery is completely discharged
   * and the system will suspend.
   */
  dischargingTime: number;
  /**
   * A number representing the system's battery charge level scaled to a value between 0.0 and 1.0.
   */
  level: number;
}

interface BatteryManager extends Readonly<BatteryState>, EventTarget {
  onchargingchange: () => void;
  onchargingtimechange: () => void;
  ondischargingtimechange: () => void;
  onlevelchange: () => void;
}

interface NavigatorWithPossibleBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

/**
 * Return type for the `useBattery` hook.
 * It is a discriminated union based on the `isSupported` and `fetched` states.
 */
type UseBatteryState =
  | { isSupported: false }
  | { isSupported: true; fetched: false }
  | (BatteryState & { isSupported: true; fetched: true });

const nav: NavigatorWithPossibleBattery | undefined =
  typeof navigator !== "undefined" ? navigator : undefined;

const isBatteryApiSupported = nav && typeof nav.getBattery === "function";

function useBatteryMock(): UseBatteryState {
  return { isSupported: false };
}

/**
 * Custom hook that tracks the state of the device's battery using the [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API).
 *
 * It returns the battery level, charging status, charging time, and discharging time.
 * If the API is not supported, `isSupported` will be false.
 *
 * @returns {UseBatteryState} The current state of the battery, including support and fetch status.
 * @public
 * @example
 * ```tsx
 * const battery = useBattery();
 *
 * if (!battery.isSupported) {
 * return <p>Battery API is not supported on this device.</p>;
 * }
 *
 * if (!battery.fetched) {
 * return <p>Fetching battery status...</p>;
 * }
 *
 * return (
 * <div>
 * <p>Battery Level: {(battery.level * 100).toFixed(0)}%</p>
 * <p>Charging: {battery.charging ? 'Yes' : 'No'}</p>
 * </div>
 * );
 * ```
 */
function useBattery(): UseBatteryState {
  const [state, setState] = useState<UseBatteryState>({
    isSupported: true,
    fetched: false,
  });

  useEffect(() => {
    let isMounted = true;
    let battery: BatteryManager | null = null;

    const handleChange = () => {
      if (!isMounted || !battery) {
        return;
      }

      const newState: UseBatteryState = {
        isSupported: true,
        fetched: true,
        level: battery.level,
        charging: battery.charging,
        dischargingTime: battery.dischargingTime,
        chargingTime: battery.chargingTime,
      };
      setState(newState);
    };

    nav!.getBattery!().then((bat: BatteryManager) => {
      if (!isMounted) {
        return;
      }

      battery = bat;
      battery.addEventListener("chargingchange", handleChange);
      battery.addEventListener("chargingtimechange", handleChange);
      battery.addEventListener("dischargingtimechange", handleChange);
      battery.addEventListener("levelchange", handleChange);
      handleChange();
    });

    return () => {
      isMounted = false;
      if (battery) {
        battery.removeEventListener("chargingchange", handleChange);
        battery.removeEventListener("chargingtimechange", handleChange);
        battery.removeEventListener("dischargingtimechange", handleChange);
        battery.removeEventListener("levelchange", handleChange);
      }
    };
  }, []);

  return state;
}

/**
 * Custom hook that tracks the state of the device's battery using the [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API).
 *
 * It returns the battery level, charging status, charging time, and discharging time.
 * If the API is not supported, `isSupported` will be false.
 *
 * @returns {UseBatteryState} The current state of the battery, including support and fetch status.
 * @public
 * @example
 * ```tsx
 * const battery = useBattery();
 *
 * if (!battery.isSupported) {
 * return <p>Battery API is not supported on this device.</p>;
 * }
 *
 * if (!battery.fetched) {
 * return <p>Fetching battery status...</p>;
 * }
 *
 * return (
 * <div>
 * <p>Battery Level: {(battery.level * 100).toFixed(0)}%</p>
 * <p>Charging: {battery.charging ? 'Yes' : 'No'}</p>
 * </div>
 * );
 * ```
 */
const useBatteryHook = isBatteryApiSupported ? useBattery : useBatteryMock;

export { useBatteryHook as useBattery };
