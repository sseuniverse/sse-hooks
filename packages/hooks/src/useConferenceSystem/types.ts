import { UseScreenShareOptions } from "../useScreenShare";
import { UseUserMediaConstraints } from "../useUserMedia";
import { MediaQuality } from "../useMediaQuality";

/**
 * Configuration options for the conference system hook.
 */
export interface UseConferenceSystemOptions {
  /**
   * Whether to enable automatic network-based quality scaling on mount.
   * @default true
   */
  defaultAutoQuality?: boolean;
}

/**
 * The state and controller object returned by the useConferenceSystem hook.
 */
export interface UseConferenceSystemReturns {
  /** Camera management and state */
  camera: {
    /** The active MediaStream for the camera, or null if inactive. */
    stream: MediaStream | null;
    /** Starts the camera capture with optional constraints. */
    start: (constraints?: UseUserMediaConstraints) => Promise<void>;
    /** Stops the camera capture and clears the stream. */
    stop: () => void;
    /** Whether the camera stream is currently active. */
    isActive: boolean;
    /** Error message if camera access or capture fails. */
    error: string | null;
    /** Indicates if the camera is currently requesting permissions or initializing. */
    isLoading: boolean;
  };

  /** Screen sharing management and state */
  screen: {
    /** The active MediaStream for screen sharing, or null if inactive. */
    stream: MediaStream | null;
    /** Starts the screen share capture process. */
    start: (options?: UseScreenShareOptions) => Promise<void>;
    /** Stops the screen share and clears the stream. */
    stop: () => void;
    /** Whether the screen share is currently active. */
    isActive: boolean;
    /** Error message if screen share access fails or is denied. */
    error: string | null;
  };

  /** Media quality management */
  quality: {
    /** The currently applied quality level ('low', 'medium', 'high'). */
    current: MediaQuality;
    /** Whether a quality transition is currently in progress. */
    isChanging: boolean;
    /** Manually sets the media quality level (overrides auto-quality). */
    set: (level: MediaQuality) => Promise<void>;
    /** Whether automatic quality adjustment is currently enabled. */
    isAuto: boolean;
    /** Toggles the automatic quality scaling logic on or off. */
    toggleAuto: () => void;
  };

  /** Network status and telemetry */
  network: {
    /** Boolean indicating if the browser has an active internet connection. */
    isOnline: boolean;
    /** Estimated downlink speed in Mbps. */
    speed: number;
    /** The network connection type (e.g., '4g', 'wifi', 'unknown'). */
    type: string;
  };
}
