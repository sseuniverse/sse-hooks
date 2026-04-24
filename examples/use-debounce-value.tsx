import React, { useState } from "react";
import { useDebounceValue } from "@/hooks/useDebounceValue";

export function SearchFilter() {
  const [input, setInput] = useState("");

  // 1. Initialize the debounced value.
  // It will only update 500ms after the last 'input' change.
  const [debouncedSearchTerm] = useDebounceValue(input, 500);

  return (
    <div style={{ padding: "20px" }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search users..."
        style={{ width: "100%", padding: "8px" }}
      />
      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>Immediate value:</strong> {input}
        </p>
        <p>
          <strong>Debounced value (API target):</strong> {debouncedSearchTerm}
        </p>
      </div>

      {/* In a real app, you would trigger a useEffect based on debouncedSearchTerm */}
    </div>
  );
}
