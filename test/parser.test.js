import test from "node:test";
import assert from "node:assert/strict";
import { parse, parseSymbols, ElectaParseError } from "../src/parser.js";

test("parser returns an immutable program containing source symbols", () => {
  const program = parse("A B!?");
  assert.equal(program.type, "ElectaProgram");
  assert.equal(program.length, 3);
  assert.deepEqual(program.symbols.map((symbol) => symbol.value), [10, 62, 63]);
  assert.ok(Object.isFrozen(program));
  assert.ok(Object.isFrozen(program.symbols));
  assert.ok(Object.isFrozen(program.symbols[0]));
});

test("parser accepts an empty source program", () => {
  const program = parse(" \n\t");
  assert.equal(program.length, 0);
});

test("parser rejects non-array token streams", () => {
  assert.throws(() => parseSymbols("A"), TypeError);
});

test("parser rejects out-of-range symbols", () => {
  assert.throws(
    () => parseSymbols([{ value: 64, character: "A", offset: 0, line: 1, column: 1 }]),
    ElectaParseError
  );
});

test("parser rejects duplicate or out-of-order source offsets", () => {
  const token = { value: 1, character: "1", offset: 2, line: 1, column: 3 };
  assert.throws(() => parseSymbols([token, token]), ElectaParseError);
});

test("parser preserves lexer diagnostics for invalid source", () => {
  assert.throws(() => parse("A#"), (error) => error.code === "E001");
});
