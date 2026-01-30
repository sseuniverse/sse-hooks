/** Supported audio MIME types for recording. */
type AudioMimeType =
  | "audio/webm"
  | "audio/webm;codecs=opus"
  | "audio/webm;codecs=vorbis"
  | "audio/ogg"
  | "audio/ogg;codecs=opus"
  | "audio/ogg;codecs=vorbis"
  | "application/ogg"
  | "audio/mp4"
  | "audio/mp4;codecs=mp4a.40.2"
  | "audio/aac"
  | "audio/x-m4a"
  | "audio/mpeg"
  | "audio/mp3"
  | "audio/wav"
  | "audio/x-wav"
  | "audio/wave"
  | "audio/flac"
  | "audio/3gpp"
  | "audio/3gpp2";

/** Options for configuring the useAudioRecorder hook. */
export interface UseAudioRecorderOptions {
  /**
   * Audio bitrate in bits per second.
   * @default 128000
   */
  audioBitsPerSecond?: number;
  /**
   * MIME type for the recorded audio.
   * @default "audio/webm"
   */
  mimeType?: AudioMimeType;
  /**
   * Timeslice (ms) for MediaRecorder data chunks.
   */
  timeslice?: number;
  /**
   * If set, enables real-time audio analysis during recording.
   */
  enableAnalysis?: boolean;
  /**
   * FFT size for audio analysis.
   * @default 2048
   */
  fftSize?: number;
}

/** Audio analysis data returned when `enableAnalysis` is true. */
export interface AudioAnalysisData {
  /** Frequency domain data (FFT). */
  frequencyData: Uint8Array;
  /** Time domain waveform data. */
  timeData: Uint8Array;
  /** Calculated RMS volume level. */
  volume: number;
}

/** The useAudioRecorder return type. */
export interface UseAudioRecorderReturn {
  /** Whether audio recording is supported in the current browser. */
  isSupported: boolean;
  /** Whether recording is currently active. */
  isRecording: boolean;
  /** Whether recording is currently paused. */
  isPaused: boolean;
  /** Active media stream. */
  stream: MediaStream | null;
  /** MediaRecorder instance. */
  mediaRecorder: MediaRecorder | null;
  /** Final recorded audio blob. */
  audioBlob: Blob | null;
  /** Object URL for the recorded audio. */
  audioUrl: string | null;
  /** Duration of the recording in seconds. */
  duration: number;
  /** Error message if recording fails. */
  error: string | null;
  /** Live audio analysis data. */
  analysisData: AudioAnalysisData | null;
  /** Starts audio recording. */
  startRecording: () => Promise<void>;
  /** Stops audio recording. */
  stopRecording: () => void;
  /** Pauses the recording. */
  pauseRecording: () => void;
  /** Resumes a paused recording. */
  resumeRecording: () => void;
  /** Clears the current recording state. */
  clearRecording: () => void;
  /** Downloads the recording as a file. */
  downloadRecording: (filename?: string) => void;
}
