import { useEffect, useState } from "react";

/**
 * Custom hook that determines if the code is running on the client side (in the browser).
 *
 * @category lifecycle
 * @returns {boolean} A boolean value indicating whether the code is running on the client side.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-is-client)
 * @public
 */
export function useIsClient(): boolean {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  return isClient;
}
