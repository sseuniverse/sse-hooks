import React from "react";
import { useBoolean } from "@/hooks/useBoolean";

export function SideDrawerExample() {
  // Returns { value, setTrue, setFalse, toggle, setValue }
  const {
    value: isOpen,
    setTrue: openDrawer,
    setFalse: closeDrawer,
    toggle: toggleDrawer,
  } = useBoolean(false);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>useBoolean Example</h2>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={openDrawer}>Open Drawer</button>
        <button onClick={toggleDrawer}>Toggle State</button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {/* Drawer Content */}
          <div
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            style={{
              width: "300px",
              height: "100%",
              background: "white",
              padding: "20px",
              boxShadow: "-2px 0 5px rgba(0,0,0,0.2)",
            }}
          >
            <h3>Navigation Menu</h3>
            <p>
              The drawer is currently <strong>Open</strong>.
            </p>
            <button onClick={closeDrawer} style={{ marginTop: "20px" }}>
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <p style={{ marginTop: "20px", color: "#666" }}>
          The drawer is closed.
        </p>
      )}
    </div>
  );
}
