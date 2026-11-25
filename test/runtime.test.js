import test from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/parser.js";
import { execute, ElectaRuntimeError } from "../src/runtime.js";

test("empty program halts without executing an instruction", () => {
  const result = execute(parse(""));
  assert.equal(result.status, "HALTED");
  assert.equal(result.steps, 0);
  assert.deepEqual([...result.output], []);
  assert.equal(result.state.pc, 0);
});

test("INC, EMIT, and HALT produce the expected byte", () => {
  // The stateful key makes the source symbols for these three opcodes: 1, 6, q.
  const result = execute(parse("16q"));
  assert.equal(result.status, "HALTED");
  assert.equal(result.steps, 3);
  assert.deepEqual([...result.output], [1]);
  assert.equal(result.state.data[0], 1);
});

test("HALT is counted and applies the key update", () => {
  const result = execute(parse("F"));
  assert.equal(result.status, "HALTED");
  assert.equal(result.steps, 1);
  assert.equal(result.state.pc, 1);
  assert.equal(result.state.key, 16);
});

test("data and control pointers wrap around their 256-cell tapes", () => {
  const dataResult = execute(parse("4"));
  assert.equal(dataResult.state.dp, 255);

  const controlResult = execute(parse("C"));
  assert.equal(controlResult.state.cp, 255);
});

test("READ consumes bytes and sets EOF only when input is exhausted", () => {
  const withInput = execute(parse("6"), { input: [173] });
  assert.equal(withInput.state.data[0], 173);
  assert.equal(withInput.eof, false);

  const atEof = execute(parse("6"));
  assert.equal(atEof.state.data[0], 0);
  assert.equal(atEof.eof, true);
});

test("reserved opcodes fail with a stable error and source location", () => {
  assert.throws(
    () => execute(parse("Q")),
    (error) => {
      assert.ok(error instanceof ElectaRuntimeError);
      assert.equal(error.code, "E002");
      assert.equal(error.line, 1);
      assert.equal(error.column, 1);
      assert.equal(error.offset, 0);
      return true;
    }
  );
});

test("fuel exhaustion returns a bounded FUEL result", () => {
  const result = execute(parse("111"), { fuel: 2 });
  assert.equal(result.status, "FUEL");
  assert.equal(result.steps, 2);
  assert.equal(result.state.pc, 2);
});

test("zero fuel executes no instructions", () => {
  const result = execute(parse("1"), { fuel: 0 });
  assert.equal(result.status, "FUEL");
  assert.equal(result.steps, 0);
  assert.equal(result.state.pc, 0);
});

test("input size limit is enforced", () => {
  assert.throws(
    () => execute(parse(""), { input: [1, 2], maxInputBytes: 1 }),
    (error) => error.code === "E004"
  );
});

test("invalid runtime configuration is rejected", () => {
  assert.throws(() => execute(parse(""), { fuel: -1 }), RangeError);
  assert.throws(() => execute(parse(""), { input: [256] }), TypeError);
  assert.throws(() => execute({}), TypeError);
});

test("ROT rotates bytes left by the low three control bits", () => {
  // Build the required stateful encoding in the test so this checks the real decoder.
  const source = encodeOpcodes([1, 9, 14, 5, 15]);
  const result = execute(parse(source));
  assert.deepEqual([...result.output], [2]);
});

function encodeOpcodes(opcodes) {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!?";
  let key = 0;
  let dp = 0;
  let cp = 0;
  const data = new Uint8Array(256);
  const control = new Uint8Array(256);
  let pc = 0;
  let source = "";

  for (const opcode of opcodes) {
    source += alphabet[(opcode ^ key) & 63];
    let nextPC = pc + 1;
    switch (opcode) {
      case 1: data[dp] = (data[dp] + 1) & 255; break;
      case 9: control[cp] = (control[cp] + 1) & 255; break;
      case 14: {
        const shift = control[cp] & 7;
        const value = data[dp];
        data[dp] = shift === 0 ? value : ((value << shift) | (value >>> (8 - shift))) & 255;
        break;
      }
      case 5: break;
      case 15: break;
      default: throw new Error("Unsupported opcode in test encoder.");
    }
    key = ((key * 17) + opcode + data[dp] + (dp * 3) + (cp * 5) + (nextPC & 63)) & 63;
    pc = nextPC;
  }
  return source;
}

test("JZ skips one source symbol when the current data cell is zero", () => {
  // JZ at PC 0 jumps to PC 2; the symbol at PC 1 is never decoded.
  // The post-JZ key is 9, so source symbol 6 decodes to HALT (15).
  const result = execute(parse("7?6"));
  assert.equal(result.status, "HALTED");
  assert.equal(result.steps, 2);
  assert.equal(result.state.pc, 3);
});
