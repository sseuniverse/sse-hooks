import React from "react";
import { useCountdown } from "@/hooks/useCountdown";

export function OtpTimer() {
  // Configured to start at 60 and stop at 0
  const [timeLeft, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      countStop: 0,
      intervalMs: 1000,
      isIncrement: false,
    });

  return (
    <div
      style={{ padding: "20px", textAlign: "center", border: "1px solid #ddd" }}
    >
      <h3>Verification Code</h3>
      <p>Please enter the code sent to your phone.</p>

      <div style={{ fontSize: "24px", fontWeight: "bold", margin: "20px 0" }}>
        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={startCountdown} disabled={timeLeft === 0}>
          Start Timer
        </button>
        <button onClick={stopCountdown}>Pause</button>
        <button onClick={resetCountdown}>Reset</button>
      </div>

      {timeLeft === 0 && (
        <p style={{ color: "red", marginTop: "10px" }}>
          Code expired.{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              resetCountdown();
            }}
          >
            Resend?
          </a>
        </p>
      )}
    </div>
  );
}
