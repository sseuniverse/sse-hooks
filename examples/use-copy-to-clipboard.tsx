import React, { useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export function ShareButton() {
  const [copiedValue, copy] = useCopyToClipboard();
  const [text, setText] = useState("https://example.com/share-link");

  const handleCopy = async () => {
    const success = await copy(text);
    if (success) {
      alert("Link copied to clipboard!");
    } else {
      alert("Failed to copy.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Share Content</h3>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "300px", marginRight: "10px" }}
      />
      <button onClick={handleCopy}>
        {copiedValue === text ? "✅ Copied" : "📋 Copy Link"}
      </button>

      {copiedValue && (
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          Currently in clipboard: <em>{copiedValue}</em>
        </p>
      )}
    </div>
  );
}
