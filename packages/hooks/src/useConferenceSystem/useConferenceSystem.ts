import { useState, useEffect, useMemo } from "react";
import { useUserMedia } from "../useUserMedia";
import { useScreenShare } from "../useScreenShare";
import { useNetworkInformation } from "../useNetworkInformation";
import { useMediaQuality, type MediaQuality } from "../useMediaQuality";

interface UseConferenceSystemOptions {
  defaultAutoQuality?: boolean;
}

export const useConferenceSystem = (
  options: UseConferenceSystemOptions = {},
) => {
  // 1. Initialize Sub-Hooks
  const camera = useUserMedia();
  const screen = useScreenShare();
  const network = useNetworkInformation();

  // 2. Initialize Quality Control on the Camera Stream
  const {
    quality,
    setQuality: applyQuality,
    isChanging: isQualityChanging,
  } = useMediaQuality(camera.stream);

  // 3. System State
  const [isAutoQuality, setIsAutoQuality] = useState(
    options.defaultAutoQuality ?? true,
  );

  // 4. THE BRAIN: Network Intelligence System
  useEffect(() => {
    // If auto-mode is off, or we have no stream, or network info is missing, do nothing.
    if (!isAutoQuality || !camera.stream || !network.networkInfo) return;

    const { downlink, effectiveType, saveData } = network.networkInfo;

    // Logic: Determine optimal quality based on network conditions
    let targetQuality: MediaQuality = "high";

    if (saveData) {
      // User has "Data Saver" mode on in their OS/Browser
      targetQuality = "low";
    } else if (effectiveType === "2g" || effectiveType === "slow-2g") {
      targetQuality = "low";
    } else if (downlink && downlink < 1.5) {
      // Below 1.5 Mbps -> Low Quality
      targetQuality = "low";
    } else if (downlink && downlink < 5) {
      // Between 1.5 and 5 Mbps -> Medium Quality
      targetQuality = "medium";
    } else {
      // Above 5 Mbps -> High Quality
      targetQuality = "high";
    }

    // Apply the calculation
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

  // 5. Combine everything into a clean API
  return {
    // Media Streams
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

    // Quality Management
    quality: {
      current: quality,
      isChanging: isQualityChanging,
      set: applyQuality, // Manual Override
      isAuto: isAutoQuality,
      toggleAuto: () => setIsAutoQuality((prev) => !prev),
    },

    // Network Status (Exposed for UI feedback)
    network: {
      isOnline: network.isOnline,
      speed: network.networkInfo?.downlink || 0, // Mbps
      type: network.networkInfo?.effectiveType || "unknown",
    },
  };
};
