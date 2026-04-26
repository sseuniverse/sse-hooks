/**
 * Creates a throttled function that only invokes the provided callback
 * at most once per every `ms` milliseconds.
 * @category utilities
 * @template T - The array of argument types for the callback.
 * @param {(...args: T) => void} cb - The callback function to throttle.
 * @param {number} ms - The number of milliseconds to throttle invocations to.
 * @returns {(...args: T) => void} A new throttled function.
 * @public
 */
export function throttle<T extends any[]>(
  cb: (...args: T) => void,
  ms: number,
): (...args: T) => void {
  let lastTime = 0;

  return (...args: T) => {
    const now = Date.now();
    if (now - lastTime >= ms) {
      cb(...args);
      lastTime = now;
    }
  };
}
