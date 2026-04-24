import React, { useRef, useEffect } from "react";
import { useMediaQuality } from "@/hooks/useMediaQuality";
import { useUserMedia } from "@/hooks/useUserMedia";

export function VideoQualitySelector() {
  const { stream } = useUserMedia();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { quality, setQuality, isChanging } = useMediaQuality(stream);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div style={{ padding: "20px" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", maxWidth: "400px" }}
      />

      <div style={{ marginTop: "10px" }}>
        <p>
          Current Quality: {quality} {isChanging && "(Switching...)"}
        </p>
        <button onClick={() => setQuality("low")}>Low (360p)</button>
        <button onClick={() => setQuality("medium")}>Medium (720p)</button>
        <button onClick={() => setQuality("high")}>High (1080p)</button>
      </div>
    </div>
  );
}
