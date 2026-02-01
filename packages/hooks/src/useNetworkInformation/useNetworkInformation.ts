import { useCallback, useEffect, useState } from "react";
import { NetworkInformation, UseNetworkInformationReturn } from "./types";

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

export const useNetworkInformation = (): UseNetworkInformationReturn => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInformation | null>(
    null,
  );

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const isSupported =
    typeof navigator !== "undefined" &&
    "connection" in navigator &&
    navigator.connection !== undefined;

  const updateNetworkInfo = useCallback(() => {
    if (!isSupported || !navigator.connection) return;

    const connection = navigator.connection;

    setNetworkInfo({
      downlink: connection.downlink,
      downlinkMax: connection.downlinkMax,
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      saveData: connection.saveData,
      type: connection.type,
    });
  }, [isSupported]);

  const handleOnlineStatusChange = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  const handleConnectionChange = useCallback(() => {
    updateNetworkInfo();
  }, [updateNetworkInfo]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    updateNetworkInfo();

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    if (isSupported) {
      const connection = (navigator as any).connection;
      connection.addEventListener("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);

      if (isSupported) {
        const connection = (navigator as any).connection;
        connection.removeEventListener("change", handleConnectionChange);
      }
    };
  }, [
    isSupported,
    updateNetworkInfo,
    handleOnlineStatusChange,
    handleConnectionChange,
  ]);

  return {
    networkInfo,
    isOnline,
    isSupported,
    refresh: updateNetworkInfo,
  };
};
