import React from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  large: 1440,
};

const { useGreater, useSmaller, useBetween, isGreater } =
  useBreakpoint(BREAKPOINTS);

export function ResponsiveComponent() {
  const isTabletOrAbove = useGreater("tablet");
  const isMobileOnly = useSmaller("tablet");
  const isStrictlyTablet = useBetween("tablet", "desktop");

  const checkInitialSize = () => {
    if (isGreater("large")) {
      console.log("Started on a very large screen");
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <h2>Breakpoint Tracker</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <p>
          <strong>Current Viewport Logic:</strong>
        </p>

        {isMobileOnly && (
          <div style={{ color: "red" }}>📱 You are on a Mobile device.</div>
        )}

        {isStrictlyTablet && (
          <div style={{ color: "blue" }}>
            {" "}
            tablet Viewport (Between 768px and 1024px)
          </div>
        )}

        {isTabletOrAbove && (
          <div style={{ color: "green" }}>
            ✅ Desktop or Tablet features enabled
          </div>
        )}
      </div>

      <button onClick={checkInitialSize} style={{ marginTop: "20px" }}>
        Run Manual Logic Check
      </button>
    </div>
  );
}
