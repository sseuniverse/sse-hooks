import React from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useMediaQuery } from "./useMediaQuery";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const LOCAL_STORAGE_KEY = "usehooks-ts-ternary-dark-mode";

export type TernaryDarkMode = "system" | "dark" | "light";

export type TernaryDarkModeOptions = {
  defaultValue?: TernaryDarkMode;
  localStorageKey?: string;
  initializeWithValue?: boolean;
};

export type TernaryDarkModeReturn = {
  isDarkMode: boolean;
  ternaryDarkMode: TernaryDarkMode;
  setTernaryDarkMode: React.Dispatch<React.SetStateAction<TernaryDarkMode>>;
  toggleTernaryDarkMode: () => void;
};

export function useTernaryDarkMode({
  defaultValue = "system",
  localStorageKey = LOCAL_STORAGE_KEY,
  initializeWithValue = true,
}: TernaryDarkModeOptions = {}): TernaryDarkModeReturn {
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY, { initializeWithValue });
  const [mode, setMode] = useLocalStorage(localStorageKey, defaultValue, {
    initializeWithValue,
  });

  const isDarkMode = mode === "dark" || (mode === "system" && isDarkOS);

  const toggleTernaryDarkMode = () => {
    const modes: TernaryDarkMode[] = ["light", "system", "dark"];
    setMode((prevMode): TernaryDarkMode => {
      const nextIndex = (modes.indexOf(prevMode) + 1) % modes.length;
      return modes[nextIndex];
    });
  };

  return {
    isDarkMode,
    ternaryDarkMode: mode,
    setTernaryDarkMode: setMode,
    toggleTernaryDarkMode,
  };
}
