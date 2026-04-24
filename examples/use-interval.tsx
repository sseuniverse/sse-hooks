import React, { useState } from "react";
import { useInterval } from "@/hooks/useInterval";

export function RealTimeClock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Update the time every second
  useInterval(() => {
    setTime(new Date().toLocaleTimeString());
  }, 1000);

  return (
    <div style={{ padding: "20px", fontSize: "2rem", fontFamily: "monospace" }}>
      Current Time: {time}
    </div>
  );
}
