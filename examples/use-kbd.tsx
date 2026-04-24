import React from "react";
import { useKbd } from "@/hooks/useKBD";

export function AdminPanel() {
  // Listen for 'Ctrl + Shift + A' to open an admin dashboard
  useKbd({
    key: "a",
    ctrl: true,
    shift: true,
    onKeyDown: (event) => {
      event.preventDefault();
      alert("Admin Shortcut Triggered!");
    },
  });

  return (
    <div style={{ padding: "20px" }}>
      <h3>Keyboard Shortcut Demo</h3>
      <p>
        Press <strong>Ctrl + Shift + A</strong> to trigger the secret action.
      </p>
    </div>
  );
}
