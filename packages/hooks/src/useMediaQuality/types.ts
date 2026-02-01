export type MediaQuality = "low" | "medium" | "high";
export type QualityPresetTypes = Record<MediaQuality, MediaTrackConstraints>;

export interface UseMediaQualityReturn {
  quality: MediaQuality;
  isChanging: boolean;
  setQuality: (level: MediaQuality) => Promise<void>;
}
