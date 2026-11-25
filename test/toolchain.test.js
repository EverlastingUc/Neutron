import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cli = new URL("../src/cli.js", import.meta.url);

function run(args, input) {
  return spawnSync(process.execPath, [cli.pathname, ...args], {
    encoding: "utf8",
    input
  });
}

test("CLI prints help without arguments", () => {
  const result = run([]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Neutron \/ Electa/);
  assert.match(result.stdout, /--repl/);
});

test("CLI reports its version", () => {
  const result = run(["--version"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^Electa 0\.1\.0\n$/);
});

test("CLI executes an Electa source file and prints canonical output", () => {
  const directory = mkdtempSync(join(tmpdir(), "electa-cli-"));
  try {
    const source = join(directory, "hello.el");
    writeFileSync(source, "16q", "utf8");
    const result = run([source]);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "< [ ~01 ] ; HALTED >\n");
    assert.equal(result.stderr, "");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI reports fuel exhaustion in canonical Electa notation", () => {
  const directory = mkdtempSync(join(tmpdir(), "electa-cli-"));
  try {
    const source = join(directory, "fuel.el");
    writeFileSync(source, "1", "utf8");
    const result = run([source, "--fuel", "0"]);
    assert.equal(result.status, 3);
    assert.equal(result.stdout, "< [ ] ; FUEL >\n");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI starts a REPL and evaluates source fragments", () => {
  const result = run(["--repl"], "16q\n.exit\n");
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "< [ ~01 ] ; HALTED >\n");
});

test("CLI rejects non-.el files and invalid source", () => {
  const wrongExtension = run(["program.txt"]);
  assert.equal(wrongExtension.status, 2);
  assert.match(wrongExtension.stderr, /must use the \.el extension/);

  const directory = mkdtempSync(join(tmpdir(), "electa-cli-"));
  try {
    const source = join(directory, "bad.el");
    writeFileSync(source, "A#", "utf8");
    const result = run([source]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Electa E001 at 1:2/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI rejects invalid UTF-8 source files", () => {
  const directory = mkdtempSync(join(tmpdir(), "electa-cli-"));
  try {
    const source = join(directory, "invalid.el");
    writeFileSync(source, Buffer.from([0xff, 0xfe]));
    const result = run([source]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Electa E006/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI reads byte input from a file", () => {
  const directory = mkdtempSync(join(tmpdir(), "electa-cli-"));
  try {
    const source = join(directory, "read.el");
    const input = join(directory, "input.bin");
    writeFileSync(source, "6DV", "utf8");
    writeFileSync(input, Buffer.from([65]));
    const result = run([source, "--input", input]);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "< [ ~41 ] ; HALTED >\\n");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI enforces the source byte limit before parsing", () => {
  const directory = mkdtempSync(join(tmpdir(), "electa-cli-"));
  try {
    const source = join(directory, "large.el");
    writeFileSync(source, Buffer.alloc(1024 * 1024 + 1, 48));
    const result = run([source]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Electa E005/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI rejects fuel budgets above the hard ceiling", () => {
  const result = run(["--repl", "--fuel", "10000001"], "");
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--fuel must be an integer/);
});
