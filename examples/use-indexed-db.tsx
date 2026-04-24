import React from "react";
import { useIndexedDB } from "@/hooks/useIndexedDB";

export function NoteStorage() {
  const { data, loading, error, put, get } = useIndexedDB(
    "MyNotesDB",
    "notes",
    {
      version: 1,
      onUpgradeNeeded: (db) => {
        if (!db.objectStoreNames.contains("notes")) {
          db.createObjectStore("notes");
        }
      },
    },
  );

  const saveNote = async () => {
    await put("current_note", "This is a note saved in IndexedDB!");
    alert("Note saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Local Storage (IndexedDB)</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={saveNote} disabled={loading}>
        Save Draft
      </button>
      <button onClick={() => get("current_note")} disabled={loading}>
        Load Draft
      </button>

      {data && (
        <div style={{ marginTop: "10px", padding: "10px", background: "#eee" }}>
          <strong>Loaded:</strong> {data}
        </div>
      )}
    </div>
  );
}
