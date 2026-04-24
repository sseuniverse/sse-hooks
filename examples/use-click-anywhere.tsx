import React, { useState } from "react";
import { useClickAnyWhere } from "@/hooks/useClickAnyWhere";

export function ClickTrackerExample() {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickPos, setLastClickPos] = useState({ x: 0, y: 0 });

  /**
   * The hook accepts a callback function that receives the native MouseEvent.
   * This callback is executed regardless of where the user clicks on the page.
   */
  useClickAnyWhere((event) => {
    setClickCount((prev) => prev + 1);
    setLastClickPos({
      x: event.clientX,
      y: event.clientY,
    });
  });

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        minHeight: "200px",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2>useClickAnyWhere Example</h2>
      <p>
        Click anywhere inside or outside this box (but within the document) to
        track interactions.
      </p>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#fff",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p>
          <strong>Total Document Clicks:</strong> {clickCount}
        </p>
        <p>
          <strong>Last Click Coordinates:</strong> X: {lastClickPos.x}, Y:{" "}
          {lastClickPos.y}
        </p>
      </div>

      <button
        onClick={(e) => {
          // Note: Standard button clicks will also trigger the hook
          // because the event bubbles up to the document.
          setClickCount(0);
          // If you wanted to prevent the hook from firing here,
          // you would use e.stopPropagation().
        }}
        style={{ marginTop: "20px" }}
      >
        Reset Counter
      </button>
    </div>
  );
}
