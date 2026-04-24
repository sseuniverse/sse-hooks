import React, { useRef, useEffect } from "react";
import { useConferenceSystem } from "@/hooks/useConferenceSystem";

export function ConferenceRoom() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  const { camera, screen, quality, network } = useConferenceSystem({
    defaultAutoQuality: true,
  });

  // Sync streams to video elements
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = camera.stream;
  }, [camera.stream]);

  useEffect(() => {
    if (screenRef.current) screenRef.current.srcObject = screen.stream;
  }, [screen.stream]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Conference System</h1>

      {/* Network Status Header */}
      <div
        style={{
          padding: "10px",
          background: network.isOnline ? "#e8f5e9" : "#ffebee",
          borderRadius: "4px",
        }}
      >
        <strong>Network:</strong> {network.isOnline ? "Online" : "Offline"} |
        <strong> Speed:</strong> {network.speed} Mbps ({network.type}) |
        <strong> Quality:</strong> {quality.current}{" "}
        {quality.isAuto ? "(Auto)" : "(Manual)"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Camera Section */}
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <h3>Camera</h3>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", background: "#000" }}
          />
          <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
            <button
              onClick={() => camera.start({ video: true })}
              disabled={camera.isActive}
            >
              Start Camera
            </button>
            <button onClick={camera.stop} disabled={!camera.isActive}>
              Stop Camera
            </button>
          </div>
          {camera.error && (
            <p style={{ color: "red" }}>Error: {camera.error}</p>
          )}
        </div>

        {/* Screen Share Section */}
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <h3>Screen Share</h3>
          <video
            ref={screenRef}
            autoPlay
            playsInline
            style={{ width: "100%", background: "#000" }}
          />
          <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
            <button onClick={() => screen.start} disabled={screen.isActive}>
              Start Sharing
            </button>
            <button onClick={screen.stop} disabled={!screen.isActive}>
              Stop Sharing
            </button>
          </div>
        </div>
      </div>

      {/* Manual Quality Controls */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={quality.toggleAuto}>
          {quality.isAuto ? "Disable Auto Quality" : "Enable Auto Quality"}
        </button>
        {!quality.isAuto && (
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => quality.set("low")}>Low</button>
            <button onClick={() => quality.set("medium")}>Medium</button>
            <button onClick={() => quality.set("high")}>High</button>
          </div>
        )}
      </div>
    </div>
  );
}
