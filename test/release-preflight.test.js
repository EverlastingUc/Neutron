import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../scripts/release-preflight.js", import.meta.url));

test("release preflight validates package metadata and required artifacts", () => {
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Release preflight passed for neutron-electa@0\.1\.0/);
});
