import { useCallback, useEffect, useState } from "react";
import { useSupported } from "../useSupported";

export interface UseGeolocationReturns {
  readonly coordinates: GeolocationCoordinates;
  readonly locatedAt: number | null;
  readonly error: GeolocationPositionError | null;
  readonly isSupported: boolean;
}

export const initCoord: GeolocationPosition["coords"] = {
  accuracy: 0,
  latitude: Number.POSITIVE_INFINITY,
  longitude: Number.POSITIVE_INFINITY,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
  toJSON() {},
};

/**
 * Custom hook that tracks the user's geographic location using the Geolocation API.
 * @category sensors
 * @param {Partial<PositionOptions>} [options={}] - Configuration options for the geolocation requests.
 * @returns {UseGeolocationReturns} An object containing the coordinates, timestamp, error state, and API support status.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-geolocation)
 * @public
 */
export function useGeolocation(
  options: Partial<PositionOptions> = {},
): UseGeolocationReturns {
  const {
    enableHighAccuracy = true,
    maximumAge = 30000,
    timeout = 27000,
  } = options;

  const isSupported = useSupported(
    () =>
      typeof navigator !== "undefined" &&
      !!navigator.geolocation &&
      typeof navigator.geolocation.getCurrentPosition === "function" &&
      typeof navigator.geolocation.watchPosition === "function" &&
      typeof navigator.geolocation.clearWatch === "function",
  );

  const [coordinates, setCoordinates] =
    useState<GeolocationPosition["coords"]>(initCoord);
  const [locatedAt, setLocatedAt] = useState<number | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setCoordinates(position.coords);
    setLocatedAt(position.timestamp);
    setError(null);
  }, []);

  const updateError = useCallback((err: GeolocationPositionError) => {
    setCoordinates(initCoord);
    setLocatedAt(null);
    setError(err);
  }, []);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    // watchPosition automatically grabs the initial location,
    // so getCurrentPosition is not needed here.
    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      updateError,
      {
        enableHighAccuracy,
        maximumAge,
        timeout,
      },
    );

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [
    enableHighAccuracy,
    isSupported,
    maximumAge,
    timeout,
    updateError,
    updatePosition,
  ]);

  return {
    coordinates,
    locatedAt,
    error,
    isSupported,
  };
}
