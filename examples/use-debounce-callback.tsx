import React, { useState } from "react";
import { useDebounceCallback } from "@/hooks/useDebounceCallback";

export function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<string[]>([]);

  // 1. Define the debounced function
  const debouncedSearch = useDebounceCallback(
    async (query: string) => {
      console.log("Fetching results for:", query);
      // Simulate API call
      const mockData = ["React", "Hooks", "TypeScript", "Vite"].filter((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      );
      setResults(mockData);
    },
    500, // Wait for 500ms of inactivity before firing
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // 2. Call the debounced function
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setResults([]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Search Library</h3>
      <input
        type="text"
        placeholder="Type to search..."
        value={searchTerm}
        onChange={handleChange}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {debouncedSearch.isPending() && (
        <p style={{ fontSize: "12px", color: "blue" }}>User is typing...</p>
      )}

      <ul style={{ marginTop: "15px" }}>
        {results.map((res) => (
          <li key={res}>{res}</li>
        ))}
      </ul>
    </div>
  );
}
