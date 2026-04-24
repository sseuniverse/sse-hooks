import React from "react";
import { useCounter } from "@/hooks/useCounter";

export function ShoppingCartItem() {
  const { count, increment, decrement, reset, setCount } = useCounter(1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "10px",
        borderBottom: "1px solid #eee",
      }}
    >
      <img src="https://via.placeholder.com/50" alt="Product" />
      <div style={{ flex: 1 }}>
        <strong>Premium Coffee Beans</strong>
        <p>$15.00</p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <button
          onClick={decrement}
          style={{ padding: "5px 10px", border: "none", background: "none" }}
        >
          -
        </button>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{
            width: "40px",
            textAlign: "center",
            border: "none",
            borderLeft: "1px solid #ccc",
            borderRight: "1px solid #ccc",
          }}
        />
        <button
          onClick={increment}
          style={{ padding: "5px 10px", border: "none", background: "none" }}
        >
          +
        </button>
      </div>

      <button onClick={reset} style={{ color: "gray", fontSize: "12px" }}>
        Reset to 1
      </button>

      <div style={{ width: "80px", textAlign: "right" }}>
        <strong>${(count * 15).toFixed(2)}</strong>
      </div>
    </div>
  );
}
