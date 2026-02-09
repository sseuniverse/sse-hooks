import React from "react";

/**
 * Configuration options for the useAutoSave hook.
 */
export interface BaseConfig {
  /**
   * The debounce delay in milliseconds before triggering the onSave callback.
   * @default 1000
   */
  delay?: number;
}

/**
 * The return object of the useAutoSave hook.
 */
export interface UseAutoSaveReturn<T extends Record<string, any>> {
  /** The current state of the data. */
  data: T;
  /** Standard React state setter for the data. */
  setData: React.Dispatch<React.SetStateAction<T>>;
  /**
   * A smart change handler factory.
   * Can be used with standard inputs `onChange("name")` or direct values `onChange("age")(30)`.
   */
  onChange: (key: keyof T) => (valueOrEvent: any) => void;
  /** Indicates if a save operation is currently in progress. */
  isSaving: boolean;
}

export type ValueOrEvent =
  | React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  | any;
