import { useCallback, useEffect, useRef, useState } from "react";
import { UseScreenShareOptions } from "./types";

const DEFAULT_OPTIONS: UseScreenShareOptions = {
  video: true,
  audio: false,
};

/**
 * Custom hook that captures the user's screen or specific application window.
 * It handles permission errors, stream management, native stop events, and cleanup.
 *
 * @param initialOptions - The initial options for screen sharing (video/audio).
 * @returns {UseScreenShareReturn} An object containing the stream, error state, and control functions.
 * @public
 * @example
 * ```tsx
 * const { stream, error, startCapture, stopCapture } = useScreenShare();
 *
 * return (
 * <div>
 * {error && <p>Error: {error}</p>}
 * <video
 * autoPlay
 * muted
 * playsInline
 * ref={(node) => {
 * if (node && stream) node.srcObject = stream;
 * }}
 * />
 * <button onClick={() => startCapture()}>Share Screen</button>
 * <button onClick={stopCapture}>Stop Sharing</button>
 * </div>
 * );
 * ```
 */
export function useScreenShare(
  initialOptions: UseScreenShareOptions = DEFAULT_OPTIONS,
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported =
    typeof navigator !== "undefined" &&
    "mediaDevices" in navigator &&
    "getDisplayMedia" in navigator.mediaDevices;

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
    setError(null);
  }, []);

  const startCapture = useCallback(
    async (options: UseScreenShareOptions = initialOptions) => {
      if (!isSupported) {
        setError("getDisplayMedia is not supported in this browser");
        return;
      }

      // Stop any existing stream before starting a new one
      stopCapture();

      setIsLoading(true);
      setError(null);

      try {
        const mediaStream =
          await navigator.mediaDevices.getDisplayMedia(options);

        // Handle the native browser "Stop Sharing" button/banner
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            stopCapture();
          };
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
      } catch (err: any) {
        let errorMessage = "Failed to start screen sharing";

        if (err instanceof Error) {
          switch (err.name) {
            case "NotAllowedError":
              errorMessage =
                "Permission denied or user cancelled the selection.";
              break;
            case "NotFoundError":
              errorMessage = "No screen video source found.";
              break;
            case "NotReadableError":
              errorMessage =
                "Could not capture the screen (OS or hardware error).";
              break;
            case "OverconstrainedError":
              errorMessage = "The specified constraints cannot be satisfied.";
              break;
            case "AbortError":
              errorMessage = "Screen sharing selection was aborted.";
              break;
            default:
              errorMessage = err.message || errorMessage;
          }
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported, initialOptions, stopCapture],
  );

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    stream,
    error,
    isLoading,
    isSupported,
    startCapture,
    stopCapture,
  };
}
