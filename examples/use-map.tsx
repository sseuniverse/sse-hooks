import React from "react";
import { useMap } from "@/hooks/useMap";

export function CartManager() {
  // Returns [map, actions]
  const [cart, { set, remove, reset }] = useMap<string, number>([
    ["apple", 1],
    ["banana", 2],
  ]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Shopping Cart</h2>
      <ul>
        {Array.from(cart.entries()).map(([item, qty]) => (
          <li key={item}>
            {item}: {qty}
            <button onClick={() => remove(item)}>Remove</button>
            <button onClick={() => set(item, qty + 1)}>+</button>
          </li>
        ))}
      </ul>
      <button onClick={() => set("orange", 1)}>Add Orange</button>
      <button onClick={reset}>Clear Cart</button>
    </div>
  );
}
