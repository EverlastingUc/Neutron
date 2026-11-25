const MAX_SOURCE_BYTES = 1024 * 1024;

export const SOURCE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!?";

const SYMBOL_INDEX = new Map(
  Array.from(SOURCE_ALPHABET, (character, index) => [character, index])
);

export class ElectaLexError extends Error {
  constructor(message, { code = "E001", line, column, offset } = {}) {
    super(message);
    this.name = "ElectaLexError";
    this.code = code;
    this.line = line;
    this.column = column;
    this.offset = offset;
  }
}

/**
 * Convert Electa source into six-bit ciphertext symbols.
 * Whitespace is ignored; all other characters must belong to SOURCE_ALPHABET.
 *
 * @param {string} source
 * @returns {{ value: number, character: string, offset: number, line: number, column: number }[]}
 */
export function lex(source) {
  if (typeof source !== "string") {
    throw new TypeError("Electa source must be a string.");
  }

  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) {
    throw new ElectaLexError("Source exceeds the 1 MiB limit.", { code: "E005" });
  }

  const symbols = [];
  let line = 1;
  let column = 1;

  for (let offset = 0; offset < source.length; offset += 1) {
    const character = source[offset];

    if (character === "\n") {
      line += 1;
      column = 1;
      continue;
    }

    if (character === "\r") {
      if (source[offset + 1] === "\n") offset += 1;
      line += 1;
      column = 1;
      continue;
    }

    if (character === " " || character === "\t") {
      column += 1;
      continue;
    }

    const value = SYMBOL_INDEX.get(character);
    if (value === undefined) {
      throw new ElectaLexError(
        `Invalid source character at line ${line}, column ${column}.`,
        { line, column, offset }
      );
    }

    symbols.push({ value, character, offset, line, column });
    column += 1;
  }

  return symbols;
}
