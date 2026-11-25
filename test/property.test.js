import test from "node:test";
import assert from "node:assert/strict";
import { SOURCE_ALPHABET } from "../src/lexer.js";
import { parse } from "../src/parser.js";
import { execute, ElectaRuntimeError } from "../src/runtime.js";
import { createConsoler } from "../src/consoler.js";

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

test("deterministic random Electa programs remain bounded and structurally valid", () => {
  const random = seededRandom(0xE1EC7A);
  for (let sample = 0; sample < 500; sample += 1) {
    const length = Math.floor(random() * 80);
    let source = "";
    for (let index = 0; index < length; index += 1) {
      source += SOURCE_ALPHABET[Math.floor(random() * SOURCE_ALPHABET.length)];
    }

    try {
      const result = execute(parse(source), { fuel: 128, input: [0, 1, 255] });
      assert.ok(result.steps <= 128);
      assert.ok(result.output.length <= result.steps);
      assert.ok(result.state.pc >= 0);
      assert.ok(result.state.dp >= 0 && result.state.dp < 256);
      assert.ok(result.state.cp >= 0 && result.state.cp < 256);
      assert.ok(result.state.key >= 0 && result.state.key < 64);
      assert.equal(result.state.data.length, 256);
      assert.equal(result.state.control.length, 256);
      assert.ok(result.status === "HALTED" || result.status === "FUEL");
    } catch (error) {
      assert.ok(error instanceof ElectaRuntimeError);
      assert.equal(error.code, "E002");
    }
  }
});

test("random malformed Consoler signals never escape validation", () => {
  const random = seededRandom(0xC05A01E);
  const consoler = createConsoler({ maxSignals: 1000 });
  const candidates = [
    null,
    undefined,
    0,
    "state-mismatch",
    [],
    {},
    { type: "unknown" },
    { type: "state-mismatch", code: "valid-code" },
    { type: "integrity-mismatch", code: "contains spaces" },
    { type: "unexpected-transition", extra: "not allowed" },
    { type: "state-mismatch", code: 123 }
  ];

  for (let index = 0; index < 1000; index += 1) {
    const candidate = candidates[Math.floor(random() * candidates.length)];
    assert.doesNotThrow(() => {
      const accepted = consoler.reportSignal(candidate);
      assert.equal(typeof accepted, "boolean");
    });
  }
});
