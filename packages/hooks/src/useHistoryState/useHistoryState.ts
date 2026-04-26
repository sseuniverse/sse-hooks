import { useCallback, useReducer, useRef } from "react";
import { useHistoryStateReducer } from "./reducer";
import { HistoryAction, HistoryState, HistoryStateInternal } from "./type";

/**
 * Custom hook for managing state history, providing undo, redo, and clear functionality.
 * @category state
 * @template T - The type of the state being managed.
 * @param {T} initialPresent - The initial value to populate the state history.
 * @returns {HistoryState<T>} An object containing the current state, control functions, and status booleans.
 * @see [Documentation](https://sse-hooks.vercel.app/docs/hooks/use-history-state)
 * @public
 */
export function useHistoryState<T>(initialPresent: T): HistoryState<T> {
  const initialPresentRef = useRef(initialPresent);

  const [state, dispatch] = useReducer(
    (s: HistoryStateInternal<T>, a: HistoryAction<T>) =>
      useHistoryStateReducer<T>(s, a),
    {
      past: [],
      present: initialPresentRef.current,
      future: [],
    },
  );

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  const undo = useCallback(() => {
    if (canUndo) dispatch({ type: "UNDO" });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) dispatch({ type: "REDO" });
  }, [canRedo]);

  const set = useCallback(
    (newPresent: T) => dispatch({ type: "SET", newPresent }),
    [],
  );

  const clear = useCallback(
    () =>
      dispatch({ type: "CLEAR", initialPresent: initialPresentRef.current }),
    [],
  );

  return {
    state: state.present,
    set,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
  };
}
