import React, { useState, useRef } from "react";
import { useEventListener } from "@/hooks/useEventListener";

export function InteractionTracker() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 1. Window Event: Track mouse movement globally
  useEventListener("mousemove", (event) => {
    setCoords({ x: event.clientX, y: event.clientY });
  });

  useEventListener(
    "click",
    () => alert("Button clicked via useEventListener!"),
    buttonRef as any,
  );

  return (
    <div style={{ padding: "20px", height: "200px", border: "1px solid #ccc" }}>
      <h3>Event Listener Tracker</h3>
      <p>
        Mouse Position: X: {coords.x}, Y: {coords.y}
      </p>

      <button ref={buttonRef} style={{ marginTop: "20px" }}>
        Special Action Button
      </button>
    </div>
  );
}
