import { useEffect, useCallback, useRef } from "react";
import { UseMediaSessionOptions, UseMediaSessionReturn } from "./types";

/**
 * Custom hook that interacts with the [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API).
 * It allows you to customize media notifications and handle media control events (like play, pause, next track) from the system's notification area or lock screen.
 *
 * @param options - Initial configuration for the media session.
 * @returns Object containing methods to control the media session and a flag indicating support.
 * @public
 * @example
 * ```tsx
 * const MyPlayer = () => {
 * const { setMetadata, setPlaybackState } = useMediaSession({
 * playbackState: "playing",
 * metadata: {
 * title: "Awesome Song",
 * artist: "Cool Artist",
 * album: "Best Hits",
 * artwork: [{ src: "/album-art.jpg", sizes: "512x512", type: "image/jpeg" }]
 * },
 * actionHandlers: {
 * play: () => console.log("Play clicked"),
 * pause: () => console.log("Pause clicked"),
 * nexttrack: () => console.log("Next track clicked"),
 * }
 * });
 *
 * return <div>Now Playing...</div>;
 * };
 * ```
 */
export const useMediaSession = (
  options?: UseMediaSessionOptions,
): UseMediaSessionReturn => {
  const actionHandlersRef = useRef<Set<MediaSessionAction>>(new Set());

  const isSupported =
    typeof navigator !== "undefined" && "mediaSession" in navigator;

  const setMetadata = useCallback(
    (metadata: MediaMetadataInit) => {
      if (!isSupported) return;

      try {
        navigator.mediaSession.metadata = new MediaMetadata(metadata);
      } catch (error) {
        console.warn("Failed to set media metadata:", error);
      }
    },
    [isSupported],
  );

  const setPlaybackState = useCallback(
    (state: MediaSessionPlaybackState) => {
      if (!isSupported) return;

      try {
        navigator.mediaSession.playbackState = state;
      } catch (error) {
        console.warn("Failed to set playback state:", error);
      }
    },
    [isSupported],
  );

  const setActionHandler = useCallback(
    (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      if (!isSupported) return;

      try {
        navigator.mediaSession.setActionHandler(action, handler);
        if (handler) {
          actionHandlersRef.current.add(action);
        } else {
          actionHandlersRef.current.delete(action);
        }
      } catch (error) {
        console.warn(`Failed to set action handler for ${action}:`, error);
      }
    },
    [isSupported],
  );

  const clearActionHandlers = useCallback(() => {
    if (!isSupported) return;

    actionHandlersRef.current.forEach((action) => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch (error) {
        console.warn(`Failed to clear action handler for ${action}:`, error);
      }
    });
    actionHandlersRef.current.clear();
  }, [isSupported]);

  // Set initial metadata if provided
  useEffect(() => {
    if (options?.metadata) {
      setMetadata(options.metadata);
    }
  }, [setMetadata, options?.metadata]);

  // Set initial playback state if provided
  useEffect(() => {
    if (options?.playbackState) {
      setPlaybackState(options.playbackState);
    }
  }, [setPlaybackState, options?.playbackState]);

  // Set initial action handlers if provided
  useEffect(() => {
    if (options?.actionHandlers) {
      Object.entries(options.actionHandlers).forEach(([action, handler]) => {
        if (handler) {
          setActionHandler(action as MediaSessionAction, handler);
        }
      });
    }

    // Cleanup function to clear all action handlers when component unmounts
    return () => {
      clearActionHandlers();
    };
  }, [setActionHandler, clearActionHandlers, options?.actionHandlers]);

  return {
    isSupported,
    setMetadata,
    setPlaybackState,
    setActionHandler,
    clearActionHandlers,
  };
};
