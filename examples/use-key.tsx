import React, { useState } from "react";
import { useKey } from "@/hooks/useKey";

export function EscapeMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const { bindings } = useKey(
    {
      Escape: () => setIsOpen(false),
      "Ctrl+S": {
        action: (e) => saveDocument(),
        preventDefault: true,
        description: "Save changes",
        category: "File",
      },
      "g i": {
        action: () => navigate("/inbox"),
        description: "Go to Inbox",
        category: "Navigation",
      },
    },
    {
      debug: true,
      allowInInputs: false,
    },
  );

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setIsOpen(true)}>Open Overlay</button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1>Overlay Menu</h1>
          <p>
            Press <strong>ESC</strong> to close this.
          </p>
        </div>
      )}
    </div>
  );
}
