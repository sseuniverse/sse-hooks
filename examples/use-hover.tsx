import React, { useRef } from "react";
import { useHover } from "@/hooks/useHover";

export function HoverCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHovered = useHover(cardRef);

  return (
    <div
      ref={cardRef}
      style={{
        width: "200px",
        padding: "20px",
        textAlign: "center",
        borderRadius: "8px",
        transition: "transform 0.2s",
        backgroundColor: isHovered ? "#e0f7fa" : "#f5f5f5",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        cursor: "pointer",
      }}
    >
      <h3>{isHovered ? "Hello there!" : "Hover over me"}</h3>
      <p>{isHovered ? "✨ Looking good!" : "I change colors"}</p>
    </div>
  );
}
