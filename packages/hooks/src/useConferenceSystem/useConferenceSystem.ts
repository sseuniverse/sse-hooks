import { useState, useEffect } from "react";
import { useUserMedia } from "../useUserMedia";
import { useScreenShare } from "../useScreenShare";
import { useNetworkInformation } from "../useNetworkInformation";
import { useMediaQuality, type MediaQuality } from "../useMediaQuality";
import {
  UseConferenceSystemOptions,
  UseConferenceSystemReturns,
} from "./types";

/**
 * A comprehensive hook for managing video conferencing state, including camera access, screen sharing, network monitoring, and automatic media quality adjustment.
 *
 * @category sensors
 * @param {UseConferenceSystemOptions} [options={}] - Configuration options for the conference system.
 * @param {boolean} [options.defaultAutoQuality=true] - Whether to enable network-based quality scaling by default.
 * @returns {UseConferenceSystemReturns} An object containing camera, screen, quality, and network state controllers.
 * @public
 * @see [Documentation](/docs/use-conference-system)
 * @example
 * ```tsx
 * const { camera, screen, quality, network } = useConferenceSystem({
 * defaultAutoQuality: true
 * });
 * * return (
 * <div>
 * <video ref={v => v.srcObject = camera.stream} autoPlay />
 * <button onClick={camera.start}>Start Camera</button>
 * <p>Current Quality: {quality.current} (Auto: {quality.isAuto ? 'On' : 'Off'})</p>
 * <p>Network Speed: {network.speed} Mbps</p>
 * </div>
 * );
 * ```
 */
export const useConferenceSystem = (
  options: UseConferenceSystemOptions = {},
): UseConferenceSystemReturns => {
  const camera = useUserMedia();
  const screen = useScreenShare();
  const network = useNetworkInformation();

  const {
    quality,
    setQuality: applyQuality,
    isChanging: isQualityChanging,
  } = useMediaQuality(camera.stream);

  const [isAutoQuality, setIsAutoQuality] = useState(
    options.defaultAutoQuality ?? true,
  );

  useEffect(() => {
    if (!isAutoQuality || !camera.stream || !network.networkInfo) return;
    const { downlink, effectiveType, saveData } = network.networkInfo;
    let targetQuality: MediaQuality = "high";

    if (saveData) {
      targetQuality = "low";
    } else if (effectiveType === "2g" || effectiveType === "slow-2g") {
      targetQuality = "low";
    } else if (downlink && downlink < 1.5) {
      targetQuality = "low";
    } else if (downlink && downlink < 5) {
      targetQuality = "medium";
    } else {
      targetQuality = "high";
    }

    if (quality !== targetQuality) {
      applyQuality(targetQuality);
    }
  }, [
    network.networkInfo,
    isAutoQuality,
    camera.stream,
    quality,
    applyQuality,
  ]);

  return {
    camera: {
      stream: camera.stream,
      start: camera.startCapture,
      stop: camera.stopCapture,
      isActive: !!camera.stream,
      error: camera.error,
      isLoading: camera.isLoading,
    },
    screen: {
      stream: screen.stream,
      start: screen.startCapture,
      stop: screen.stopCapture,
      isActive: !!screen.stream,
      error: screen.error,
    },
    quality: {
      current: quality,
      isChanging: isQualityChanging,
      set: applyQuality, // Manual Override
      isAuto: isAutoQuality,
      toggleAuto: () => setIsAutoQuality((prev) => !prev),
    },
    network: {
      isOnline: network.isOnline,
      speed: network.networkInfo?.downlink || 0, // Mbps
      type: network.networkInfo?.effectiveType || "unknown",
    },
  };
};
