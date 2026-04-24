import { useBattery } from "@/hooks/useBattery";

export function BatteryStatus() {
  const battery = useBattery();

  if (!battery.isSupported) {
    return (
      <div style={styles.card}>
        <h3>🔋 Battery Status</h3>
        <p style={{ color: "red" }}>
          The Battery Status API is not supported on this device/browser.
        </p>
      </div>
    );
  }

  if (!battery.fetched) {
    return (
      <div style={styles.card}>
        <h3>🔋 Battery Status</h3>
        <p>Fetching battery information...</p>
      </div>
    );
  }

  const levelPercentage = (battery.level * 100).toFixed(0);
  const isFullyCharged = battery.level === 1 && battery.charging;

  return (
    <div style={styles.card}>
      <h3>🔋 Battery Status</h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "30px",
            border: "2px solid #333",
            borderRadius: "4px",
            padding: "2px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${levelPercentage}%`,
              height: "100%",
              backgroundColor: battery.charging
                ? "#4caf50"
                : battery.level > 0.2
                  ? "#2196f3"
                  : "#f44336",
              transition: "width 0.3s ease-in-out",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "-6px",
              top: "5px",
              width: "4px",
              height: "16px",
              backgroundColor: "#333",
              borderRadius: "0 2px 2px 0",
            }}
          />
        </div>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
          {levelPercentage}% {battery.charging && "⚡"}
        </span>
      </div>

      <ul
        style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: "1.6" }}
      >
        <li>
          <strong>Status:</strong>{" "}
          {isFullyCharged
            ? "Fully Charged"
            : battery.charging
              ? "Charging"
              : "Discharging"}
        </li>

        {battery.charging &&
          !isFullyCharged &&
          battery.chargingTime !== Infinity && (
            <li>
              <strong>Time to full:</strong>{" "}
              {formatSeconds(battery.chargingTime)}
            </li>
          )}

        {/* Only show discharging time if not charging */}
        {!battery.charging && battery.dischargingTime !== Infinity && (
          <li>
            <strong>Time remaining:</strong>{" "}
            {formatSeconds(battery.dischargingTime)}
          </li>
        )}
      </ul>
    </div>
  );
}

function formatSeconds(seconds: number): string {
  if (seconds === Infinity) return "Calculating...";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

const styles = {
  card: {
    maxWidth: "300px",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "sans-serif",
  },
};
