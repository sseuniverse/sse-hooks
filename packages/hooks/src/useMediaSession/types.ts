/**
 * Represents an image associated with the media (e.g., album art).
 */
export interface MediaImage {
  /** The URL of the image. */
  src: string;
  /** The sizes of the image (e.g., "96x96"). */
  sizes?: string;
  /** The MIME type of the image (e.g., "image/png"). */
  type?: string;
}

/**
 * Metadata for the current media session.
 */
export interface MediaMetadataInit {
  /** The title of the media. */
  title?: string;
  /** The artist name. */
  artist?: string;
  /** The album name. */
  album?: string;
  /** An array of artwork images. */
  artwork?: MediaImage[];
}

/**
 * Supported media session actions.
 */
export type MediaSessionAction =
  | "play"
  | "pause"
  | "stop"
  | "seekbackward"
  | "seekforward"
  | "seekto"
  | "skipad"
  | "previoustrack"
  | "nexttrack";

/**
 * The current playback state of the media session.
 */
export type MediaSessionPlaybackState = "none" | "paused" | "playing";

/**
 * Handler function for media session actions.
 */
export type MediaSessionActionHandler = (details?: any) => void;

/**
 * Options for the `useMediaSession` hook.
 */
export interface UseMediaSessionOptions {
  /** Initial metadata to set for the session. */
  metadata?: MediaMetadataInit;
  /** Initial playback state. */
  playbackState?: MediaSessionPlaybackState;
  /** Initial action handlers to register. */
  actionHandlers?: Partial<
    Record<MediaSessionAction, MediaSessionActionHandler>
  >;
}

/**
 * Return value of the `useMediaSession` hook.
 */
export interface UseMediaSessionReturn {
  /** Whether the Media Session API is supported in the current environment. */
  isSupported: boolean;
  /** Function to update the media metadata. */
  setMetadata: (metadata: MediaMetadataInit) => void;
  /** Function to update the playback state. */
  setPlaybackState: (state: MediaSessionPlaybackState) => void;
  /** Function to set a specific action handler. */
  setActionHandler: (
    action: MediaSessionAction,
    handler: MediaSessionActionHandler | null,
  ) => void;
  /** Function to clear all registered action handlers. */
  clearActionHandlers: () => void;
}
