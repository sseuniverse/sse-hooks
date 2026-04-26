import { useEffect, useState } from "react";
import { throttle } from "./helper";

/**
 * Custom hook that tracks whether the user is idle based on activity events.
 * @category sensors
 * @param {number} [ms=60000] - The time in milliseconds before the user is considered idle.
 * @returns {boolean} A boolean value indicating if the user is currently idle.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-idle)
 * @public
 */
export function useIdle(ms: number = 1000 * 60): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    const handleTimeout = () => {
      setIdle(true);
    };

    const handleEvent = throttle(() => {
      setIdle(false);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleTimeout, ms);
    }, 500);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleEvent();
      }
    };

    timeoutId = window.setTimeout(handleTimeout, ms);

    window.addEventListener("mousemove", handleEvent);
    window.addEventListener("mousedown", handleEvent);
    window.addEventListener("resize", handleEvent);
    window.addEventListener("keydown", handleEvent);
    window.addEventListener("touchstart", handleEvent);
    window.addEventListener("wheel", handleEvent);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleEvent);
      window.removeEventListener("mousedown", handleEvent);
      window.removeEventListener("resize", handleEvent);
      window.removeEventListener("keydown", handleEvent);
      window.removeEventListener("touchstart", handleEvent);
      window.removeEventListener("wheel", handleEvent);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearTimeout(timeoutId);
    };
  }, [ms]);

  return idle;
}
