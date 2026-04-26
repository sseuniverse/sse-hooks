import * as React from "react";
import Form from "./Form";
import { useHistoryState } from "@/hooks/useHistoryState";

export default function App() {
  const { state, set, undo, redo, clear, canUndo, canRedo } = useHistoryState({
    items: [],
  });

  const addTodo = (val) => {
    set({
      ...state,
      items: state.items.concat({ id: crypto.randomUUID(), name: val }),
    });
  };

  const removeTodo = (id) => {
    set({
      ...state,
      items: state.items.filter((item) => item.id !== id),
    });
  };

  return (
    <section>
      <header>
        <h1>useHistoryState</h1>
        <div>
          <button disabled={!canUndo} className="link" onClick={undo}>
            Undo
          </button>
          <button disabled={!canRedo} className="link" onClick={redo}>
            Redo
          </button>

          <button
            disabled={!state.items.length}
            className="link"
            onClick={clear}
          >
            Clear
          </button>
        </div>
        <Form addItem={addTodo} />
      </header>

      <ul>
        {state.items.map((item, index) => {
          return (
            <li key={index}>
              <span>{item.name}</span>
              <button className="link" onClick={() => removeTodo(item.id)}>
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
E;
