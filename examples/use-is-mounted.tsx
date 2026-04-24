import React, { useState, useEffect } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";

export function AsyncUserLoader({ userId }: { userId: string }) {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Initialize the hook
  const isMounted = useIsMounted();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);

      try {
        const response = await fetch(`https://api.example.com/users/${userId}`);
        const data = await response.json();

        // 2. Check if the component is still mounted before calling state setters
        // This is important if the user navigated away while the fetch was pending
        if (isMounted()) {
          setUser(data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted()) {
          setLoading(false);
          console.error("Failed to fetch user", error);
        }
      }
    }

    fetchUser();
  }, [userId, isMounted]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd" }}>
      <h3>User Profile</h3>
      <p>Name: {user.name}</p>
    </div>
  );
}
