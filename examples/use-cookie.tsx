import React from "react";
import { useCookie } from "@/hooks/useCookie";

export function CookiePreferences() {
  const [userTheme, setUserTheme, removeTheme] = useCookie("theme", "light", {
    prefix: "__Host-", // Comply with secure cookie naming conventions
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  // Complex object cookie
  const [consent, setConsent] = useCookie("gdpr_consent", {
    analytics: false,
    marketing: false,
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Cookie Management</h2>

      <div style={{ marginBottom: "20px" }}>
        <p>
          Current Theme: <strong>{userTheme}</strong>
        </p>
        <button onClick={() => setUserTheme("light")}>Light</button>
        <button onClick={() => setUserTheme("dark")}>Dark</button>
        <button onClick={removeTheme}>Reset Theme</button>
      </div>

      <div style={{ border: "1px solid #ddd", padding: "15px" }}>
        <h4>Privacy Settings</h4>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={consent.analytics}
            onChange={(e) =>
              setConsent((prev) => ({ ...prev, analytics: e.target.checked }))
            }
          />
          Enable Analytics
        </label>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={consent.marketing}
            onChange={(e) =>
              setConsent((prev) => ({ ...prev, marketing: e.target.checked }))
            }
          />
          Enable Marketing
        </label>
      </div>
    </div>
  );
}
