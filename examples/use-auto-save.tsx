import React from "react";
import { useAutoSave } from "@/hooks/useAutoSave";

export function ProfileEditor() {
  const { data, onChange, isSaving } = useAutoSave(
    {
      username: "johndoe",
      bio: "Software Developer",
      isExpanded: false,
    },
    async (cleanData) => {
      console.log("Sending to API...", cleanData);
      await new Promise((resolve) => setTimeout(resolve, 800));
    },
    {
      delay: 1500,
      exclude: ["isExpanded"],
    },
  );

  return (
    <div
      style={{ maxWidth: "400px", margin: "0 auto", fontFamily: "sans-serif" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Edit Profile</h2>
        <span
          style={{ fontSize: "12px", color: isSaving ? "#0066cc" : "#888" }}
        >
          {isSaving ? "⏳ Saving..." : "✅ Saved"}
        </span>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Username:
        </label>
        <input
          type="text"
          value={data.username}
          onChange={onChange("username")}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Bio:</label>
        <textarea
          value={data.bio}
          onChange={onChange("bio")}
          rows={4}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
        />
      </div>

      <div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <input
            type="checkbox"
            checked={data.isExpanded}
            onChange={onChange("isExpanded")}
          />
          Show advanced settings (Local UI state)
        </label>
      </div>
    </div>
  );
}
