function validateByte(value) {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new TypeError("Electa output values must be integer bytes (0–255).");
  }
}

/** Render one byte using Electa's canonical uppercase hexadecimal atom. */
export function formatByte(value) {
  validateByte(value);
  return `~${value.toString(16).toUpperCase().padStart(2, "0")}`;
}

/** Render a byte sequence using the canonical Electa sequence grammar. */
export function formatBytes(bytes) {
  if (!(bytes instanceof Uint8Array) && !Array.isArray(bytes)) {
    throw new TypeError("Electa byte sequences must be a Uint8Array or an array of bytes.");
  }
  for (const value of bytes) validateByte(value);
  if (bytes.length === 0) return "[ ]";
  return `[ ${Array.from(bytes, formatByte).join(" ")} ]`;
}

/** Render a completed runtime result in canonical Electa notation. */
export function formatResult(result) {
  if (
    result === null ||
    typeof result !== "object" ||
    (result.status !== "HALTED" && result.status !== "FUEL")
  ) {
    throw new TypeError("Electa result must have status HALTED or FUEL.");
  }
  return `< ${formatBytes(result.output)} ; ${result.status} >`;
}
