import React from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

export function ThemeToggle() {
  const { isDarkMode, toggle, enable, disable } = useDarkMode({
    defaultValue: false,
    localStorageKey: "my-app-theme",
  });

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#000000",
        transition: "all 0.3s ease",
      }}
    >
      <h1>{isDarkMode ? "Dark" : "Light"} Mode Active</h1>
      <p>
        The theme is persisted in local storage and listens to system
        preferences.
      </p>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button onClick={toggle}>🌓 Toggle Theme</button>
        <button onClick={enable}>🌙 Force Dark</button>
        <button onClick={disable}>☀️ Force Light</button>
      </div>

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h3>Card Content</h3>
        <p>
          This content stays readable because it uses the{" "}
          <code>isDarkMode</code> boolean to adjust its colors.
        </p>
      </div>
    </div>
  );
}
