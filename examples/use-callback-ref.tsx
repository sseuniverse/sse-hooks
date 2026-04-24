import React, { useState, useEffect } from "react";
import { useCallbackRef } from "@/hooks/useCallbackRef";

// A memoized child component that would re-render if its props change
const ExpensiveChild = React.memo(({ onAction }: { onAction: () => void }) => {
  console.log("ExpensiveChild rendered");
  return <button onClick={onAction}>Click Me</button>;
});

export function CallbackRefExample() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(false);

  /**
   * Unlike a standard useCallback, this hook doesn't require a dependency array.
   * The returned function identity is stable and will never change,
   * yet it will always have access to the latest 'count' value.
   */
  const handleAction = useCallbackRef(() => {
    console.log(`Action triggered. Current count is: ${count}`);
    // You can perform logic here that depends on the latest state
  });

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>useCallbackRef Example</h2>
      <p>Count: {count}</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setCount((c) => c + 1)}>Increment Count</button>
        <button onClick={() => setOtherState((s) => !s)}>
          Toggle Other State ({String(otherState)})
        </button>
      </div>

      <div
        style={{
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h4>Stable Callback Demo</h4>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Clicking "Increment Count" updates state, but "ExpensiveChild" will
          NOT re-render because the reference to <code>handleAction</code> is
          stable.
        </p>
        <ExpensiveChild onAction={handleAction} />
      </div>
    </div>
  );
}
