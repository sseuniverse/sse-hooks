## 🪝 Available Hooks

<!-- HOOKS:START -->

### 📡 Sensors
- [`useAudioRecorder`](https://sse-hooks.vercel.app/docs/hooks/use-audio-recorder) — A comprehensive hook for audio recording with real-time analysis using getUserMedia, MediaRecorder, and Web Audio APIs
- [`useBreakpoint`](https://sse-hooks.vercel.app/docs/hooks/use-breakpoint) — Reactive hooks and utilities to be used with user provided breakpoints.
- [`useConferenceSystem`](https://sse-hooks.vercel.app/docs/hooks/use-conference-system) — A comprehensive hook for managing video conferencing state, including camera access, screen sharing, network monitoring, and automatic media quality adjustment.
- [`useHover`](https://sse-hooks.vercel.app/docs/hooks/use-hover) — Custom hook that tracks whether a DOM element is being hovered over.
- [`useKey`](https://sse-hooks.vercel.app/docs/hooks/use-key) — A powerful sensor hook for handling keyboard shortcuts, sequences, and modifiers.  It supports complex key combinations (`Ctrl+Shift+S`), Gmail-style sequences (`g then i`), and provides metadata for generating \"Keyboard Shortcut\" UI help modals.
- [`useMediaQuery`](https://sse-hooks.vercel.app/docs/hooks/use-media-query) — Custom hook that tracks the state of a media query using the `Match Media API`.
- [`useMediaSession`](https://sse-hooks.vercel.app/docs/hooks/use-media-session) — Custom hook that interacts with the Media Session API. It allows you to customize media notifications and handle media control events (like play, pause, next track) from the system's notification area or lock screen.
- [`useResizeObserver`](https://sse-hooks.vercel.app/docs/hooks/use-resize-observer) — Custom hook that observes the size of an element using the `ResizeObserver API`.
- [`useScreen`](https://sse-hooks.vercel.app/docs/hooks/use-screen) — Custom hook that tracks the `screen` dimensions and properties.
- [`useScreenShare`](https://sse-hooks.vercel.app/docs/hooks/use-screen-share) — Custom hook that captures the user's screen or specific application window. It handles permission errors, stream management, native stop events, and cleanup.
- [`useUserMedia`](https://sse-hooks.vercel.app/docs/hooks/use-user-media) — Custom hook that captures audio and video from the user's device. It handles permission errors, stream management, and cleanup automatically.
- [`useWindowSize`](https://sse-hooks.vercel.app/docs/hooks/use-window-size) — Custom hook that tracks the size of the window.

### 💾 State
- [`useBoolean`](https://sse-hooks.vercel.app/docs/hooks/use-boolean) — Custom hook that handles boolean state with useful utility functions.
- [`useCounter`](https://sse-hooks.vercel.app/docs/hooks/use-counter) — Custom hook that manages a counter with increment, decrement, reset, and setCount functionalities.
- [`useMap`](https://sse-hooks.vercel.app/docs/hooks/use-map) — Custom hook that manages a key-value `Map` state with setter actions.
- [`useRoleGuard`](https://sse-hooks.vercel.app/docs/hooks/use-role-guard) — Custom hook for Role-Based Access Control (RBAC). Checks if a user has specific permissions and handles redirection for unauthorized access.
- [`useStep`](https://sse-hooks.vercel.app/docs/hooks/use-step) — Custom hook that manages and navigates between steps in a multi-step process.
- [`useToggle`](https://sse-hooks.vercel.app/docs/hooks/use-toggle) — Custom hook that manages a boolean toggle state in React components.

### ⚡ Side Effects
- [`useCountdown`](https://sse-hooks.vercel.app/docs/hooks/use-countdown) — Custom hook that manages countdown.
- [`useDebounceCallback`](https://sse-hooks.vercel.app/docs/hooks/use-debounce-callback) — Custom hook that creates a debounced version of a callback function.
- [`useDebounceValue`](https://sse-hooks.vercel.app/docs/hooks/use-debounce-value) — Custom hook that returns a debounced version of the provided value, along with a function to update it.
- [`useEventListener`](https://sse-hooks.vercel.app/docs/hooks/use-event-listener) — Custom hook that attaches event listeners to DOM elements, the window, or media query lists.
- [`useInterval`](https://sse-hooks.vercel.app/docs/hooks/use-interval) — Custom hook that creates an interval that invokes a callback function at a specified delay using the `setInterval API`.
- [`useTimeout`](https://sse-hooks.vercel.app/docs/hooks/use-timeout) — Custom hook that handles timeouts in React components using the `setTimeout API`.

### 🔄 LifeCycle
- [`useIsClient`](https://sse-hooks.vercel.app/docs/hooks/use-is-client) — Custom hook that determines if the code is running on the client side (in the browser).
- [`useIsMounted`](https://sse-hooks.vercel.app/docs/hooks/use-is-mounted) — Custom hook that determines if the component is currently mounted.
- [`useUnmount`](https://sse-hooks.vercel.app/docs/hooks/use-unmount) — Custom hook that runs a cleanup function when the component is unmounted.

### 🎨 DOM & UI
- [`useClickAnyWhere`](https://sse-hooks.vercel.app/docs/hooks/use-click-any-where) — Custom hook that handles click events anywhere on the document.
- [`useClickAway`](https://sse-hooks.vercel.app/docs/hooks/use-click-away) — Custom hook that triggers a callback when a user clicks outside the referenced element. It handles portal elements, scrollbar clicks, and touch interactions intelligently.
- [`useDarkMode`](https://sse-hooks.vercel.app/docs/hooks/use-dark-mode) — Custom hook that returns the current state of the dark mode.
- [`useDocumentTitle`](https://sse-hooks.vercel.app/docs/hooks/use-document-title) — Custom hook that sets the document title.
- [`useFavicon`](https://sse-hooks.vercel.app/docs/hooks/use-favicon) — Custom hook that sets the document favicon.
- [`useForkRef`](https://sse-hooks.vercel.app/docs/hooks/use-fork-ref) — Merges refs into a single memoized callback ref or `null`.
- [`useIntersectionObserver`](https://sse-hooks.vercel.app/docs/hooks/use-intersection-observer) — Custom hook that tracks the intersection of a DOM element with its containing element or the viewport using the `Intersection Observer API`.
- [`usePortal`](https://sse-hooks.vercel.app/docs/hooks/use-portal) — Custom hook to manage the creation and state of DOM Portals. Handles mounting, unmounting, outside clicks, and \"Escape\" key closure.
- [`useScript`](https://sse-hooks.vercel.app/docs/hooks/use-script) — Custom hook that dynamically loads scripts and tracking their loading status.
- [`useScrollLock`](https://sse-hooks.vercel.app/docs/hooks/use-scroll-lock) — A custom hook that locks and unlocks scroll.
- [`useTernaryDarkMode`](https://sse-hooks.vercel.app/docs/hooks/use-ternary-dark-mode) — Custom hook that manages ternary (system, dark, light) dark mode with local storage support.

### 📦 Storage
- [`useAutoSave`](https://sse-hooks.vercel.app/docs/hooks/use-auto-save) — A robust hook for auto-saving form data with debouncing, race-condition handling, and lifecycle safety.  It monitors the `data` state and triggers the `onSave` callback after a specified `delay` of inactivity. It also provides a smart `onChange` handler that adapts to both React Events and direct values.
- [`useCookie`](https://sse-hooks.vercel.app/docs/hooks/use-cookie) — Custom hook that manages state synchronized with a browser `cookie`. It handles serialization, prefixes, updates across tabs, and custom event synchronization.
- [`useIndexedDB`](https://sse-hooks.vercel.app/docs/hooks/use-indexed-db) — Custom hook that provides an interface to the `IndexedDB API` for client-side storage of significant amounts of structured data.
- [`useLocalStorage`](https://sse-hooks.vercel.app/docs/hooks/use-local-storage) — Custom hook that uses the `localStorage API` to persist state across page reloads.
- [`useReadLocalStorage`](https://sse-hooks.vercel.app/docs/hooks/use-read-local-storage) — Custom hook that reads a value from `localStorage`, closely related to `useLocalStorage()`.
- [`useSessionStorage`](https://sse-hooks.vercel.app/docs/hooks/use-session-storage) — Custom hook that uses the `sessionStorage API` to persist state across page reloads.

### 🌐 Network
- [`useFetch`](https://sse-hooks.vercel.app/docs/hooks/use-fetch) — Custom hook that provides a wrapper around the native `fetch API` to handle HTTP requests with state management, abort capability, and TypeScript support.
- [`useNetworkInformation`](https://sse-hooks.vercel.app/docs/hooks/use-network-information) — Custom hook that tracks the device's network connection status and details (speed, type) using the Network Information API.

### 🛠️ Utilities
- [`useCallbackRef`](https://sse-hooks.vercel.app/docs/hooks/use-callback-ref) — A custom hook that converts a callback to a ref to avoid triggering re-renders when passed as a prop or avoid re-executing effects when passed as a dependency
- [`useCopyToClipboard`](https://sse-hooks.vercel.app/docs/hooks/use-copy-to-clipboard) — Custom hook that copies text to the clipboard using the `Clipboard API`.
- [`useEventCallback`](https://sse-hooks.vercel.app/docs/hooks/use-event-callback) — Custom hook that creates a memoized event callback.
- [`useKbd`](https://sse-hooks.vercel.app/docs/hooks/use-kbd) — Custom hook that detects the operating system (Mac vs. Windows/Linux) and provides a normalized map of keyboard keys (e.g., mapping \"Meta\" to \"Command\" on Mac and \"Ctrl\" on Windows).
- [`useMediaQuality`](https://sse-hooks.vercel.app/docs/hooks/use-media-quality) — Custom hook to manage video stream quality by applying constraints (resolution and frame rate) to a MediaStream track.
- [`useMemoizedFn`](https://sse-hooks.vercel.app/docs/hooks/use-memoized-fn) — A hook that returns a memoized version of a function. Unlike `useCallback`, the function identity remains stable across re-renders, but it always has access to the latest props and state without needing a dependency array. This is particularly useful for passing callbacks to optimized child components to prevent unnecessary re-renders while avoiding closure staleness.
- [`useSearchWithSuggestions`](https://sse-hooks.vercel.app/docs/hooks/use-search-with-suggestions) — A comprehensive hook for building \"Command Palette\" or \"Omnibar\" style search interfaces. * It provides \"Ghost Text\" autocomplete (like Google search), command scoping (like Slack's `/` commands), and keyboard support. It handles the complex logic of parsing input strings to separate commands from queries.
- [`useSSR`](https://sse-hooks.vercel.app/docs/hooks/use-ssr) — Custom hook that detects the current environment (Browser, Server, or Native) and capability support (Workers, EventListeners). useful for avoiding hydration mismatches.
- [`useSymbol`](https://sse-hooks.vercel.app/docs/hooks/use-symbol) — Custom hook for managing ES6 Symbols. Provides utilities to create unique symbols, manage a registry of symbols, and access well-known symbols.
<!-- HOOKS:END -->
