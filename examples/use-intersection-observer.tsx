import React, { useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export function LazyContent() {
  const [isVisible, setIsVisible] = useState(false);

  // setRef is a callback ref to attach to the target element
  const [setRef] = useIntersectionObserver({
    threshold: 0.5, // Trigger when 50% of the element is visible
    freezeOnceVisible: true, // Stop observing once it's seen
    onChange: (isIntersecting) => {
      if (isIntersecting) setIsVisible(true);
    },
  });

  return (
    <div style={{ height: "150vh", paddingTop: "100vh" }}>
      <p>Scroll down to see the magic...</p>
      <div
        ref={setRef}
        style={{
          height: "200px",
          background: isVisible ? "#4caf50" : "#ccc",
          transition: "background 0.5s",
        }}
      >
        {isVisible ? "🎉 I have been observed!" : "Waiting to be seen..."}
      </div>
    </div>
  );
}
