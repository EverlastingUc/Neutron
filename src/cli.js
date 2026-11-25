#!/usr/bin/env node

import { open } from "node:fs/promises";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { parse } from "./parser.js";
import { execute, ElectaRuntimeError } from "./runtime.js";
import { formatResult } from "./format.js";

const VERSION = "0.1.0";
const MAX_SOURCE_BYTES = 1024 * 1024;
const MAX_INPUT_BYTES = 1024 * 1024;
const MAX_FUEL = 10_000_000;

function printHelp(stdout) {
  stdout.write([
    "Neutron / Electa",
    "",
    "Usage:",
    "  electa --help",
    "  electa --version",
    "  electa --repl [--fuel <instructions>]",
    "  electa <file.el> [--fuel <instructions>] [--input <file>]",
    "",
    "Options:",
    "  --repl              Start the interactive Electa REPL.",
    "  --fuel <number>     Set the instruction budget (default: 1000000; max: 10000000).",
    "  --input <file>      Read program input bytes from a file.",
    "  -h, --help          Show this help.",
    "  -v, --version       Show the Electa version.",
    "",
    "REPL commands: .help, .exit",
    ""
  ].join("\n"));
}

function parseArguments(args) {
  const options = { repl: false, fuel: 1_000_000, inputPath: null, filePath: null };
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--repl") {
      options.repl = true;
    } else if (arg === "--fuel" || arg === "--input") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}.`);
      }
      index += 1;
      if (arg === "--fuel") {
        if (!/^(0|[1-9][0-9]*)$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > MAX_FUEL) {
          throw new Error(`--fuel must be an integer from 0 through ${MAX_FUEL}.`);
        }
        options.fuel = Number(value);
      } else {
        options.inputPath = value;
      }
    } else if (arg === "--help" || arg === "-h" || arg === "--version" || arg === "-v") {
      // Handled before normal argument parsing.
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length > 1) throw new Error("Only one Electa source file may be supplied.");
  if (options.repl && positional.length > 0) throw new Error("Choose either --repl or a source file, not both.");
  options.filePath = positional[0] ?? null;
  if (options.inputPath && options.repl) throw new Error("--input is available only when running a source file.");
  return options;
}

function decodeSource(bytes) {
  if (bytes.length > MAX_SOURCE_BYTES) {
    throw new ElectaRuntimeError("Source exceeds the 1 MiB limit.", { code: "E005" });
  }
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new ElectaRuntimeError("Source is not valid UTF-8.", { code: "E006" });
  }
}

function writeDiagnostic(error, stderr) {
  const code = typeof error.code === "string" ? error.code : "E000";
  const location = Number.isInteger(error.line) && Number.isInteger(error.column)
    ? ` at ${error.line}:${error.column}`
    : "";
  stderr.write(`Electa ${code}${location}: ${error.message}\n`);
}

async function readBoundedFile(filePath, maxBytes, errorCode, label) {
  const handle = await open(filePath, "r");
  try {
    const fileInfo = await handle.stat();
    if (!fileInfo.isFile()) throw new Error(`${label} must be a regular file.`);
    if (fileInfo.size > maxBytes) {
      throw new ElectaRuntimeError(`${label} exceeds the 1 MiB limit.`, { code: errorCode });
    }

    const chunks = [];
    const chunk = Buffer.alloc(Math.min(64 * 1024, maxBytes + 1));
    let total = 0;
    while (total <= maxBytes) {
      const length = Math.min(chunk.length, maxBytes + 1 - total);
      const { bytesRead } = await handle.read(chunk, 0, length, null);
      if (bytesRead === 0) break;
      chunks.push(Buffer.from(chunk.subarray(0, bytesRead)));
      total += bytesRead;
    }
    if (total > maxBytes) {
      throw new ElectaRuntimeError(`${label} exceeds the 1 MiB limit.`, { code: errorCode });
    }
    return Buffer.concat(chunks, total);
  } finally {
    await handle.close();
  }
}

async function runFile(filePath, options, io) {
  const sourceBytes = await readBoundedFile(filePath, MAX_SOURCE_BYTES, "E005", "Source");
  const source = decodeSource(sourceBytes);
  let input = new Uint8Array(0);
  if (options.inputPath) {
    input = new Uint8Array(await readBoundedFile(options.inputPath, MAX_INPUT_BYTES, "E004", "Input"));
  }
  const result = execute(parse(source), {
    fuel: options.fuel,
    input,
    maxInputBytes: MAX_INPUT_BYTES
  });
  io.stdout.write(`${formatResult(result)}\n`);
  return result.status === "FUEL" ? 3 : 0;
}

async function runRepl(options, io) {
  const terminal = Boolean(io.stdin.isTTY);
  const rl = createInterface({ input: io.stdin, terminal, crlfDelay: Infinity });
  if (terminal) io.stdout.write("Electa REPL 0.1.0 — .help for commands\n");

  try {
    if (terminal) io.stdout.write("electa> ");
    for await (const line of rl) {
      const command = line.trim();
      if (command === ".exit") break;
      if (command === ".help") {
        io.stdout.write("Enter an Electa source fragment. Commands: .help, .exit\n");
      } else {
        try {
          const result = execute(parse(line), { fuel: options.fuel });
          io.stdout.write(`${formatResult(result)}\n`);
        } catch (error) {
          writeDiagnostic(error, io.stderr);
        }
      }
      if (terminal) io.stdout.write("electa> ");
    }
  } finally {
    rl.close();
  }
  return 0;
}

export async function runCli(args = process.argv.slice(2), io = {
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr
}) {
  if (args.includes("--version") || args.includes("-v")) {
    io.stdout.write(`Electa ${VERSION}\n`);
    return 0;
  }
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    printHelp(io.stdout);
    return 0;
  }

  try {
    const options = parseArguments(args);
    if (options.repl) return await runRepl(options, io);
    if (!options.filePath) throw new Error("Provide a .el file or use --repl.");
    if (!options.filePath.toLowerCase().endsWith(".el")) {
      throw new Error("Electa source files must use the .el extension.");
    }
    return await runFile(options.filePath, options, io);
  } catch (error) {
    writeDiagnostic(error, io.stderr);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = await runCli();
}
