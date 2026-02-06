export interface NetworkInformation {
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: "2g" | "3g" | "4g" | "slow-2g";
  rtt?: number;
  saveData?: boolean;
  type?:
    | "bluetooth"
    | "cellular"
    | "ethernet"
    | "none"
    | "wifi"
    | "wimax"
    | "other"
    | "unknown";
}

export interface UseNetworkInformationReturn {
  /** Detailed information about the network connection. */
  networkInfo: NetworkInformation | null;
  /** Whether the browser detects an internet connection. */
  isOnline: boolean;
  /** Whether the Network Information API is supported in this browser. */
  isSupported: boolean;
  /** Function to manually update the network information. */
  refresh: () => void;
}
