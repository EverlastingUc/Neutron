import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "../src/parser.js";
import { execute } from "../src/runtime.js";
import { formatResult } from "../src/format.js";

const manifest = JSON.parse(
  readFileSync(new URL("../challenges/manifest.json", import.meta.url), "utf8")
);

for (const fixture of manifest.fixtures) {
  test(`challenge fixture ${fixture.id}`, () => {
    const source = readFileSync(new URL(`../${fixture.source}`, import.meta.url), "utf8");
    const options = {};
    if (fixture.inputHex !== undefined) options.input = Buffer.from(fixture.inputHex, "hex");
    if (fixture.fuel !== undefined) options.fuel = fixture.fuel;

    if (fixture.expectedError) {
      assert.throws(
        () => execute(parse(source), options),
        (error) => error.code === fixture.expectedError
      );
      return;
    }

    assert.equal(formatResult(execute(parse(source), options)), fixture.expected);
  });
}
