import React, { useState, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

export function Tooltip({ text }: { text: string }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef<HTMLDivElement>(null);

  // useIsomorphicLayoutEffect runs synchronously after DOM mutations but before paint.
  // In SSR, it safely falls back to useEffect to avoid server-side warnings.
  useIsomorphicLayoutEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [text]);

  return (
    <div style={{ padding: "50px" }}>
      <div
        ref={targetRef}
        style={{ display: "inline-block", border: "1px solid black" }}
      >
        Hover target
      </div>
      <div style={{ position: "absolute", ...position, background: "yellow" }}>
        {text}
      </div>
    </div>
  );
}
