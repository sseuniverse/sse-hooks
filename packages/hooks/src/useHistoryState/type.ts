/**
 * Internal state structure for the history reducer.
 * @template T The type of the state value being tracked.
 */
export interface HistoryStateInternal<T> {
  /** Array of previous state values. */
  past: T[];
  /** The current state value. */
  present: T;
  /** Array of state values that were undone and can be redone. */
  future: T[];
}

/**
 * Union of all possible actions that can be dispatched to the history reducer.
 * @template T The type of the state value.
 */
export type HistoryAction<T> =
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET"; newPresent: T }
  | { type: "CLEAR"; initialPresent: T };

/**
 * The public API returned by the useHistoryState hook.
 * @template T The type of the state value.
 */
export type HistoryState<T> = {
  /** The current value of the state. */
  state: T;
  /** Function to update the current state and push the previous state to history. */
  set: (newPresent: T) => void;
  /** Reverts the state to the previous value in history. */
  undo: () => void;
  /** Advances the state to the next value in the redo stack. */
  redo: () => void;
  /** Resets the state to the initial value and clears all history. */
  clear: () => void;
  /** Boolean indicating if there is history available to undo. */
  canUndo: boolean;
  /** Boolean indicating if there are values available to redo. */
  canRedo: boolean;
};
