import { useAudioRecorder } from "@/hooks/useAudioRecorder";

export function AudioRecorderExample() {
  const {
    isSupported,
    isRecording,
    isPaused,
    duration,
    audioUrl,
    error,
    analysisData,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    downloadRecording,
  } = useAudioRecorder({
    enableAnalysis: true, // Enables real-time volume/frequency data
    mimeType: "audio/webm",
  });

  if (!isSupported) {
    return <div>Your browser does not support audio recording.</div>;
  }

  // Calculate volume percentage (0 to 100) for the visualizer bar
  const volumePercentage = analysisData
    ? Math.min(Math.round(analysisData.volume * 100 * 5), 100)
    : 0;

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Voice Recorder</h2>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <strong>Status: </strong>
        {isRecording ? (isPaused ? "Paused ⏸️" : "Recording 🔴") : "Idle ⏹️"}
        <span style={{ marginLeft: "10px" }}>{duration}s</span>
      </div>

      {/* Live Volume Visualizer */}
      <div
        style={{
          width: "100%",
          height: "20px",
          background: "#eee",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: `${volumePercentage}%`,
            height: "100%",
            background: isRecording && !isPaused ? "#4caf50" : "#ccc",
            transition: "width 0.1s ease-out",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {!isRecording && !audioUrl && (
          <button onClick={startRecording}>Start Recording</button>
        )}

        {isRecording && (
          <>
            <button onClick={stopRecording}>Stop</button>
            <button onClick={isPaused ? resumeRecording : pauseRecording}>
              {isPaused ? "Resume" : "Pause"}
            </button>
          </>
        )}

        {audioUrl && (
          <>
            <button onClick={clearRecording}>Clear</button>
            <button onClick={() => downloadRecording("my-voice-note.webm")}>
              Download
            </button>
          </>
        )}
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div>
          <h3>Preview:</h3>
          <audio src={audioUrl} controls style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}
