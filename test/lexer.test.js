import test from "node:test";
import assert from "node:assert/strict";
import { ElectaLexError, SOURCE_ALPHABET, lex } from "../src/lexer.js";

test("source alphabet contains exactly 64 unique symbols", () => {
  assert.equal(SOURCE_ALPHABET.length, 64);
  assert.equal(new Set(SOURCE_ALPHABET).size, 64);
});

test("lexer maps source characters to their alphabet indexes", () => {
  const result = lex("0Aaz!?");
  assert.deepEqual(result.map((symbol) => symbol.value), [0, 10, 36, 61, 62, 63]);
});

test("lexer ignores the four permitted whitespace characters", () => {
  const result = lex("A B\tC\nD\r\nE\rF");
  assert.equal(result.map((symbol) => symbol.character).join(""), "ABCDEF");
});

test("lexer reports a stable error and one-based source position", () => {
  assert.throws(
    () => lex("AB\nC@"),
    (error) => {
      assert.ok(error instanceof ElectaLexError);
      assert.equal(error.code, "E001");
      assert.equal(error.line, 2);
      assert.equal(error.column, 2);
      assert.equal(error.offset, 4);
      return true;
    }
  );
});

test("lexer rejects non-ASCII lookalikes and Unicode whitespace", () => {
  assert.throws(() => lex("Ａ"), ElectaLexError);
  assert.throws(() => lex("A\u00a0B"), ElectaLexError);
});

test("lexer rejects non-string input", () => {
  assert.throws(() => lex(null), TypeError);
});

test("lexer enforces the one-megabyte UTF-8 source limit", () => {
  assert.throws(
    () => lex("A".repeat(1024 * 1024 + 1)),
    (error) => error instanceof ElectaLexError && error.code === "E005"
  );
});
