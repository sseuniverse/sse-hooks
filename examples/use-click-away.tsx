import React, { useRef, useState } from "react";
import { useClickAway } from "@/hooks/useClickAway";

export function DropdownExample() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickAway(dropdownRef, () => {
    setIsOpen(false);
  });

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h2>useClickAway Example</h2>
      <p>
        Click the button to open the menu, then click anywhere outside the blue
        box to close it.
      </p>

      <div style={{ position: "relative", display: "inline-block" }}>
        <button onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? "Close Menu" : "Open Menu"}
        </button>

        {isOpen && (
          <div
            ref={dropdownRef} // 3. Attach the ref to the target element
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "200px",
              padding: "15px",
              marginTop: "10px",
              backgroundColor: "#e3f2fd",
              border: "1px solid #2196f3",
              borderRadius: "4px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              zIndex: 10,
            }}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ padding: "5px 0" }}>📂 Edit Profile</li>
              <li style={{ padding: "5px 0" }}>⚙️ Settings</li>
              <li style={{ padding: "5px 0", color: "red" }}>🚪 Logout</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
