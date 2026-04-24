import React, { useState } from "react";
import { useEventCallback } from "@/hooks/useEventCallback";

export function ChatInput({
  onSendMessage,
}: {
  onSendMessage: (text: string) => void;
}) {
  const [text, setText] = useState("");

  // This callback identity remains stable across renders,
  // but it will always see the freshest 'text' value when called.
  const handleSend = useEventCallback(() => {
    if (text.trim()) {
      onSendMessage(text);
      setText("");
    }
  });

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
