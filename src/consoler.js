const SIGNAL_TYPES = new Set([
  "state-mismatch",
  "integrity-mismatch",
  "unexpected-transition"
]);
const CODE_PATTERN = /^[A-Z0-9_-]{1,32}$/;
const noop = () => {};

/**
 * Create an opt-in, bounded client anomaly-signal reporter.
 * Signals are untrusted telemetry and are never authorization evidence.
 *
 * @param {{ onSignal?: (signal: Readonly<object>) => void, maxSignals?: number }} options
 */
export function createConsoler(options = {}) {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Consoler options must be an object.");
  }

  const { onSignal, maxSignals = 20 } = options;
  if (onSignal !== undefined && typeof onSignal !== "function") {
    throw new TypeError("onSignal must be a function when provided.");
  }
  if (!Number.isInteger(maxSignals) || maxSignals < 1 || maxSignals > 1000) {
    throw new RangeError("maxSignals must be an integer from 1 through 1000.");
  }

  let emitted = 0;
  let disposed = false;

  function reportSignal(input) {
    if (disposed || emitted >= maxSignals) return false;
    try {
      if (
        input === null ||
        typeof input !== "object" ||
        Array.isArray(input) ||
        (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
      ) {
        return false;
      }

      const keys = Reflect.ownKeys(input);
      if (keys.some((key) => typeof key !== "string" || (key !== "type" && key !== "code"))) {
        return false;
      }

      const descriptors = Object.getOwnPropertyDescriptors(input);
      if (Object.values(descriptors).some((descriptor) => !("value" in descriptor))) {
        return false;
      }

      const { type, code } = input;
      if (!SIGNAL_TYPES.has(type)) return false;
      if (code !== undefined && (typeof code !== "string" || !CODE_PATTERN.test(code))) {
        return false;
      }

      const signal = Object.freeze({
        version: 1,
        type,
        ...(code === undefined ? {} : { code })
      });

      // Increment before calling user code to prevent re-entrant budget bypass.
      emitted += 1;
      if (onSignal) {
        const callbackResult = onSignal(signal);
        if (callbackResult && typeof callbackResult.then === "function") {
          // The API is intentionally synchronous; avoid an unhandled rejection
          // if an integrator accidentally supplies an async callback.
          Promise.resolve(callbackResult).catch(noop);
          return false;
        }
      }
      return true;
    } catch {
      // Proxies, getters, and application callbacks are untrusted input paths.
      return false;
    }
  }

  function dispose() {
    disposed = true;
  }

  return Object.freeze({ reportSignal, dispose });
}

/**
 * Create a diagnostics sink that is silent unless explicitly enabled for development.
 * The sink receives only short application-defined codes, never arbitrary payloads.
 *
 * @param {{ mode?: "development" | "production", sink?: (event: Readonly<object>) => void }} options
 */
export function createDiagnostics(options = {}) {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Diagnostics options must be an object.");
  }
  const { mode = "production", sink = noop } = options;
  if (mode !== "development" && mode !== "production") {
    throw new TypeError("Diagnostics mode must be development or production.");
  }
  if (typeof sink !== "function") {
    throw new TypeError("Diagnostics sink must be a function.");
  }

  function debug(code) {
    if (mode !== "development" || typeof code !== "string" || !CODE_PATTERN.test(code)) {
      return false;
    }
    try {
      const sinkResult = sink(Object.freeze({ level: "debug", code }));
      if (sinkResult && typeof sinkResult.then === "function") {
        Promise.resolve(sinkResult).catch(noop);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  return Object.freeze({ debug });
}
