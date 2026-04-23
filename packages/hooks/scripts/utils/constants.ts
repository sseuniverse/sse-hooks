import path from "path";

export const SRC_DIR = path.join(process.cwd(), "src");
export const MANIFEST_FILE = path.join(process.cwd(), "manifest.json");
export const SCHEMA_URL =
  "https://sse-hooks.vercel.app/api/registry/schema/hook.json";
export const TS_CONFIG_PATH = path.join(process.cwd(), "tsconfig.json");

export const NATIVE_TYPES = new Set([
  // JS & Browser Built-ins
  "Blob",
  "MediaStream",
  "MediaRecorder",
  "Uint8Array",
  "Float32Array",
  "AudioContext",
  "AnalyserNode",
  "Error",
  "File",
  "Date",
  "Promise",
  "ArrayBuffer",
  "ArrayBufferLike",
  "MediaStreamTrack",
  "EventTarget",
  "AudioNode",
  "Window",
  "Document",
  "HTMLElement",
  "Event",
  "URL",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",

  // React Built-ins (prevent deep traversal of these)
  "RefObject",
  "React.RefObject",
  "MutableRefObject",
  "React.MutableRefObject",
  "Dispatch",
  "React.Dispatch",
  "SetStateAction",
  "React.SetStateAction",
  "ReactNode",
  "React.ReactNode",
  "ReactElement",
  "React.ReactElement",
]);
