import React from "react";
import { useGet } from "@/hooks/useFetch";

export function UserProfile({ userId }: { userId: string }) {
  // 1. Initialize the fetch hook
  const { data, loading, error, execute } = useGet(
    `https://api.example.com/users/${userId}`,
    {
      immediate: true, // Fetch as soon as the component mounts
    },
  );

  if (loading) return <div>Loading user data...</div>;
  if (error)
    return (
      <div>
        Error: {error.message} <button onClick={execute}>Retry</button>
      </div>
    );
  if (!data) return null;

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <h2>{data.name}</h2>
      <p>Email: {data.email}</p>
      <button onClick={execute}>Refresh Data</button>
    </div>
  );
}
