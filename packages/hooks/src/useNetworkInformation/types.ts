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
  networkInfo: NetworkInformation | null;
  isOnline: boolean;
  isSupported: boolean;
  refresh: () => void;
}
