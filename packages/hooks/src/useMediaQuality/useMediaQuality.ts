import { useState, useCallback } from "react";
import {
  MediaQuality,
  QualityPresetTypes,
  UseMediaQualityReturn,
} from "./types";

const QUALITY_PRESETS: QualityPresetTypes = {
  low: {
    width: { ideal: 320 },
    height: { ideal: 240 },
    frameRate: { max: 15 },
  },
  medium: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { max: 24 },
  },
  high: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { max: 30 },
  },
};

export const useMediaQuality = (
  stream: MediaStream | null,
): UseMediaQualityReturn => {
  const [quality, setQuality] = useState<MediaQuality>("high");
  const [isChanging, setIsChanging] = useState(false);

  const applyQuality = useCallback(
    async (level: MediaQuality) => {
      if (!stream) return;
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;
      if (level === quality && !isChanging) return;

      setIsChanging(true);
      try {
        await videoTrack.applyConstraints(QUALITY_PRESETS[level]);
        setQuality(level);
        console.log(`Video quality switched to: ${level}`);
      } catch (err) {
        console.warn("Camera hardware could not satisfy constraints:", err);
      } finally {
        setIsChanging(false);
      }
    },
    [stream, quality, isChanging],
  );

  return { quality, isChanging, setQuality: applyQuality };
};
