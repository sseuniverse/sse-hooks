import React, { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function DynamicTitlePage() {
  const [count, setCount] = useState(0);

  useDocumentTitle(`Unread Messages (${count})`, {
    preserveTitleOnUnmount: false,
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Document Title Hook</h2>
      <p>Check your browser tab title!</p>
      <button onClick={() => setCount((c) => c + 1)}>
        Simulate New Message
      </button>
    </div>
  );
}
