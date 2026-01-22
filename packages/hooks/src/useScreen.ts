import { useState } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useEventListener } from "./useEventListener";
import { useDebounceCallback } from "./useDebounceCallback";

type UseScreenOptions<InitializeWithValue extends boolean | undefined> = {
  initializeWithValue: InitializeWithValue;
  debounceDelay?: number;
};

const IS_SERVER = typeof window === "undefined";

// SSR version of useScreen.
export function useScreen(options: UseScreenOptions<false>): Screen | undefined;
// CSR version of useScreen.
export function useScreen(options?: Partial<UseScreenOptions<true>>): Screen;
export function useScreen(
  options: Partial<UseScreenOptions<boolean>> = {},
): Screen | undefined {
  let { initializeWithValue = true } = options;
  if (IS_SERVER) {
    initializeWithValue = false;
  }

  const readScreen = () => {
    if (IS_SERVER) {
      return undefined;
    }
    return window.screen;
  };

  const [screen, setScreen] = useState<Screen | undefined>(() => {
    if (initializeWithValue) {
      return readScreen();
    }
    return undefined;
  });

  const debouncedSetScreen = useDebounceCallback(
    setScreen,
    options.debounceDelay,
  );

  // Handles the resize event of the window.
  function handleSize() {
    const newScreen = readScreen();
    const setSize = options.debounceDelay ? debouncedSetScreen : setScreen;

    if (newScreen) {
      // Create a shallow clone to trigger a re-render (#280).
      const {
        width,
        height,
        availHeight,
        availWidth,
        colorDepth,
        orientation,
        pixelDepth,
      } = newScreen;

      setSize({
        width,
        height,
        availHeight,
        availWidth,
        colorDepth,
        orientation,
        pixelDepth,
      });
    }
  }

  useEventListener("resize", handleSize);

  // Set size at the first client-side load
  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, []);

  return screen;
}
