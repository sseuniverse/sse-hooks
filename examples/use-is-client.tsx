import React from "react";
import { useIsClient } from "@/hooks/useIsClient";

export function BrowserOnlyComponent() {
  const isClient = useIsClient();

  // On the server, this returns null.
  // On the client, it renders the window width.
  if (!isClient) return <div>Loading browser features...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <p>Client-side only info:</p>
      <p>Window Width: {window.innerWidth}px</p>
    </div>
  );
}
