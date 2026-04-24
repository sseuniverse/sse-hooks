import React, { useState } from "react";
import { useFavicon } from "@/hooks/useFavicon";

export function NotificationManager() {
  const [hasUnread, setHasUnread] = useState(false);

  // Switch favicon based on application state
  const faviconUrl = hasUnread
    ? "/favicons/unread-dot.ico"
    : "/favicons/standard.ico";

  useFavicon(faviconUrl, {
    preserveFaviconOnUnmount: false, // Reverts to default icon when component is destroyed
    type: "image/x-icon",
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Favicon Hook</h2>
      <p>
        Current status:{" "}
        {hasUnread ? "🔴 New Notifications" : "⚪ No Notifications"}
      </p>
      <button onClick={() => setHasUnread(!hasUnread)}>
        Toggle Unread State
      </button>
    </div>
  );
}
