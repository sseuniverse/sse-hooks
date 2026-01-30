/**
 * Constraints for the `useUserMedia` hook.
 * Defines the video and audio settings for the media stream.
 */
export interface UseUserMediaConstraints {
  /**
   * Boolean or specific constraints for the video track.
   * @default true
   */
  video?: boolean | MediaTrackConstraints;
  /**
   * Boolean or specific constraints for the audio track.
   * @default true
   */
  audio?: boolean | MediaTrackConstraints;
}

/**
 * Return type for the `useUserMedia` hook.
 */
export interface UseUserMediaReturn {
  /**
   * The current MediaStream object, or null if no stream is active.
   */
  stream: MediaStream | null;
  /**
   * An error message string if the media capture failed, or null otherwise.
   */
  error: string | null;
  /**
   * A boolean indicating if the media stream is currently loading (requesting permission).
   */
  isLoading: boolean;
  /**
   * A boolean indicating if the `getUserMedia` API is supported in the current environment.
   */
  isSupported: boolean;
  /**
   * Function to start capturing media. Accepts optional constraints to override defaults.
   */
  startCapture: (constraints?: UseUserMediaConstraints) => Promise<void>;
  /**
   * Function to stop the current media capture and release tracks.
   */
  stopCapture: () => void;
}
