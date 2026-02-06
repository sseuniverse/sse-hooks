export type MediaQuality = "low" | "medium" | "high";
export type QualityPresetTypes = Record<MediaQuality, MediaTrackConstraints>;

export interface UseMediaQualityReturn {
  /** The current quality preset being used. */
  quality: MediaQuality;
  /** Whether the constraints are currently being applied to the track. */
  isChanging: boolean;
  /** Function to change the video quality. */
  setQuality: (level: MediaQuality) => Promise<void>;
}
