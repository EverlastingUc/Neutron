import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "../src/parser.js";
import { execute } from "../src/runtime.js";
import { formatResult } from "../src/format.js";

test("hello example emits ASCII A", () => {
  const source = readFileSync(new URL("../examples/hello.el", import.meta.url), "utf8");
  assert.equal(formatResult(execute(parse(source))), "< [ ~41 ] ; HALTED >");
});

test("read-echo example emits the supplied byte", () => {
  const source = readFileSync(new URL("../examples/read-echo.el", import.meta.url), "utf8");
  const input = readFileSync(new URL("../examples/read-echo-input.txt", import.meta.url));
  assert.equal(formatResult(execute(parse(source), { input })), "< [ ~41 ] ; HALTED >");
});

test("conditional skip example halts with empty output", () => {
  const source = readFileSync(new URL("../examples/skip.el", import.meta.url), "utf8");
  assert.equal(formatResult(execute(parse(source))), "< [ ] ; HALTED >");
});
