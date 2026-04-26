import { HistoryAction, HistoryStateInternal } from "./type";

export const useHistoryStateReducer = <T>(
  state: HistoryStateInternal<T>,
  action: HistoryAction<T>,
): HistoryStateInternal<T> => {
  const { past, present, future } = state;

  switch (action.type) {
    case "UNDO":
      if (past.length === 0) return state;
      return {
        past: past.slice(0, past.length - 1),
        present: past[past.length - 1],
        future: [present, ...future],
      };

    case "REDO":
      if (future.length === 0) return state;
      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
      };

    case "SET":
      if (action.newPresent === present) return state;
      return {
        past: [...past, present],
        present: action.newPresent,
        future: [],
      };

    case "CLEAR":
      return {
        past: [],
        present: action.initialPresent,
        future: [],
      };

    default:
      throw new Error("Unsupported action type");
  }
};
