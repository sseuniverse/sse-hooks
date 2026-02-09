import { useEffect, useRef, useState } from "react";
import { BaseConfig, UseAutoSaveReturn, ValueOrEvent } from "./types";
import { useCallbackRef } from "../useCallbackRef";
import { useDebounceCallback } from "../useDebounceCallback";

/**
 * A robust hook for auto-saving form data with debouncing, race-condition handling, and lifecycle safety.
 *
 * It monitors the `data` state and triggers the `onSave` callback after a specified `delay` of inactivity.
 * It also provides a smart `onChange` handler that adapts to both React Events and direct values.
 *
 * @category storage
 * @template T - The shape of the data object.
 * @template K - The keys of T to exclude from the save payload.
 *
 * @param {T} initialData - The initial state of the data object.
 * @param {Function} onSave - The async function to call when data changes. Receives the clean data payload.
 * @param {Object} [config] - Configuration options.
 * @param {number} [config.delay=1000] - Debounce delay in ms.
 * @param {K[]} [config.exclude] - Array of keys to exclude from the `onSave` payload (e.g., transient UI state).
 *
 * @returns {UseAutoSaveReturn<T>} Object containing data, setters, and saving state.
 *
 * @public
 * @example
 * ```tsx
 * const { data, onChange, isSaving } = useAutoSave(
 * { title: "My Draft", content: "", isOpen: true },
 * async (cleanData) => {
 * // 'isOpen' is excluded, so cleanData only has title and content
 * await api.saveDraft(cleanData);
 * },
 * { delay: 2000, exclude: ["isOpen"] }
 * );
 *
 * return (
 * <input
 * value={data.title}
 * onChange={onChange("title")} // Handles event automatically
 * />
 * );
 * ```
 */
export function useAutoSave<
  T extends Record<string, any>,
  K extends keyof T = keyof T,
>(
  initialData: T,
  onSave: (data: Omit<T, K>) => Promise<void> | void,
  config: BaseConfig & { exclude: readonly K[] },
): UseAutoSaveReturn<T>;
export function useAutoSave<T extends Record<string, any>>(
  initialData: T,
  onSave: (data: T) => Promise<void> | void,
  config?: BaseConfig,
): UseAutoSaveReturn<T>;
export function useAutoSave<
  T extends Record<string, any>,
  K extends keyof T = keyof T,
>(
  initialData: T,
  onSave: (data: T | Omit<T, K>) => Promise<void> | void,
  config: BaseConfig & { exclude?: readonly K[] } = {},
): UseAutoSaveReturn<T> {
  const { delay = 1000, exclude = [] } = config;

  const [data, setData] = useState<T>(initialData);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const initialRender = useRef<boolean>(true);
  const isMounted = useRef<boolean>(true);
  const onSaveRef = useRef(onSave);
  const excludeRef = useRef(exclude);
  const saveRequestId = useRef<number>(0);

  const lastSavedStateRef = useRef<string>(
    JSON.stringify(getCleanPayload(initialData, exclude)),
  );

  useEffect(() => {
    onSaveRef.current = onSave;
    excludeRef.current = exclude;
  }, [onSave, exclude]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSave = useCallbackRef(async (dataToSave: T) => {
    const payload = getCleanPayload(dataToSave, excludeRef.current);
    const payloadString = JSON.stringify(payload);

    if (payloadString === lastSavedStateRef.current) {
      return;
    }

    const currentRequestId = ++saveRequestId.current;
    if (isMounted.current) setIsSaving(true);

    try {
      await onSaveRef.current(payload as Omit<T, K>);

      // Only update "last saved" if this was the most recent request
      // and the component is still mounted
      if (currentRequestId === saveRequestId.current && isMounted.current) {
        lastSavedStateRef.current = payloadString;
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      if (currentRequestId === saveRequestId.current && isMounted.current) {
        setIsSaving(false);
      }
    }
  });

  const debouncedSave = useDebounceCallback(handleSave, delay);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    debouncedSave(data);
  }, [data, debouncedSave]);

  /**
   * Generates a change handler for a specific field.
   * Handles both React Events (e.target.value) and direct values.
   */
  const onChange = useCallbackRef((key: keyof T) => {
    return (valueOrEvent: ValueOrEvent) => {
      let value = valueOrEvent;

      // Check if it's a React Event object
      if (
        valueOrEvent &&
        typeof valueOrEvent === "object" &&
        "target" in valueOrEvent
      ) {
        const target = valueOrEvent.target;
        // Handle Checkboxes vs Text inputs
        value = target.type === "checkbox" ? target.checked : target.value;
      }

      setData((prev) => ({ ...prev, [key]: value }));
    };
  });

  return {
    data,
    setData,
    onChange,
    isSaving,
  };
}

/**
 * Helper to remove excluded keys from the data object.
 * @internal
 */
function getCleanPayload<T, K extends keyof T>(
  data: T,
  keys: readonly K[],
): Omit<T, K> {
  if (!keys || keys.length === 0) return data;

  const payload: any = { ...data };
  keys.forEach((key) => {
    delete payload[key];
  });
  return payload;
}
