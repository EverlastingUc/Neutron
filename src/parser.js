import { lex } from "./lexer.js";

export class ElectaParseError extends Error {
  constructor(message, { code = "E007", line, column, offset } = {}) {
    super(message);
    this.name = "ElectaParseError";
    this.code = code;
    this.line = line;
    this.column = column;
    this.offset = offset;
  }
}

/**
 * Build Electa's immutable source-level program representation.
 * Electa opcodes cannot be parsed statically because decoding depends on runtime state.
 *
 * @param {{ value: number, character: string, offset: number, line: number, column: number }[]} symbols
 * @returns {{ type: "ElectaProgram", symbols: readonly object[], length: number }}
 */
export function parseSymbols(symbols) {
  if (!Array.isArray(symbols)) {
    throw new TypeError("Electa parser expects an array of lexer symbols.");
  }

  const validated = [];
  let previousOffset = -1;

  for (const symbol of symbols) {
    if (
      symbol === null ||
      typeof symbol !== "object" ||
      !Number.isInteger(symbol.value) ||
      symbol.value < 0 ||
      symbol.value > 63 ||
      typeof symbol.character !== "string" ||
      symbol.character.length !== 1 ||
      !Number.isInteger(symbol.offset) ||
      symbol.offset <= previousOffset ||
      !Number.isInteger(symbol.line) ||
      symbol.line < 1 ||
      !Number.isInteger(symbol.column) ||
      symbol.column < 1
    ) {
      throw new ElectaParseError("Invalid lexer symbol stream.", {
        offset: symbol?.offset,
        line: symbol?.line,
        column: symbol?.column
      });
    }

    previousOffset = symbol.offset;
    validated.push(Object.freeze({
      value: symbol.value,
      character: symbol.character,
      offset: symbol.offset,
      line: symbol.line,
      column: symbol.column
    }));
  }

  const frozenSymbols = Object.freeze(validated);
  return Object.freeze({
    type: "ElectaProgram",
    symbols: frozenSymbols,
    length: frozenSymbols.length
  });
}

/**
 * Parse Electa source into its immutable source-level program representation.
 *
 * @param {string} source
 */
export function parse(source) {
  return parseSymbols(lex(source));
}
