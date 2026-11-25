import test from "node:test";
import assert from "node:assert/strict";
import { formatByte, formatBytes, formatResult } from "../src/format.js";

test("formatByte uses two uppercase hexadecimal digits", () => {
  assert.equal(formatByte(0), "~00");
  assert.equal(formatByte(10), "~0A");
  assert.equal(formatByte(65), "~41");
  assert.equal(formatByte(255), "~FF");
});

test("formatBytes renders empty and non-empty byte sequences", () => {
  assert.equal(formatBytes([]), "[ ]");
  assert.equal(formatBytes(new Uint8Array([65, 66, 255])), "[ ~41 ~42 ~FF ]");
});

test("formatResult renders the canonical completed-result grammar", () => {
  assert.equal(formatResult({ status: "HALTED", output: [] }), "< [ ] ; HALTED >");
  assert.equal(
    formatResult({ status: "HALTED", output: new Uint8Array([65, 66]) }),
    "< [ ~41 ~42 ] ; HALTED >"
  );
  assert.equal(formatResult({ status: "FUEL", output: [1] }), "< [ ~01 ] ; FUEL >");
});

test("formatter rejects invalid byte values and malformed result objects", () => {
  assert.throws(() => formatByte(-1), TypeError);
  assert.throws(() => formatByte(256), TypeError);
  assert.throws(() => formatBytes("A"), TypeError);
  assert.throws(() => formatBytes([1, 2.5]), TypeError);
  assert.throws(() => formatResult({ status: "ERROR", output: [] }), TypeError);
  assert.throws(() => formatResult({ status: "HALTED", output: "A" }), TypeError);
});
