import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const cli = new URL("../src/cli.js", import.meta.url);

test("CLI prints help without arguments", () => {
  const result = spawnSync(process.execPath, [cli.pathname], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Neutron \/ Electa/);
  assert.match(result.stdout, /file\.el/);
});

test("CLI reports its version", () => {
  const result = spawnSync(process.execPath, [cli.pathname, "--version"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^Electa 0\.1\.0\n$/);
});

test("CLI rejects execution before the runtime exists", () => {
  const result = spawnSync(process.execPath, [cli.pathname, "example.el"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /not implemented yet/);
});
