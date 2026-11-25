# Electa Runtime API

The reference runtime is implemented in `src/runtime.js`. It executes only programs created by `parse()` from `src/parser.js`.

## Quick start

```js
import { parse } from "./src/parser.js";
import { execute } from "./src/runtime.js";

const program = parse("16q");
const result = execute(program);

console.log(result.status);       // HALTED
console.log([...result.output]);  // [1]
```

The source above increments the first data cell, emits its byte value, and halts. The runtime returns raw bytes to the host API. Use `formatResult()` from `src/format.js` to render a runtime result in canonical Electa notation.

## Execution options

`execute(program, options)` accepts:

| Option | Default | Meaning |
|---|---:|---|
| `input` | empty byte sequence | Input as a `Uint8Array` or array of integers from 0 through 255. |
| `fuel` | 1,000,000 | Maximum number of instructions executed. |
| `maxInputBytes` | 1,048,576 | Maximum accepted input size in bytes. |

Invalid option types or values throw a host-side `TypeError` or `RangeError`. Input exceeding its configured limit throws `ElectaRuntimeError` with code `E004`.

## Result shape

A successful call returns:

- `status`: `HALTED` if the program halted or its PC reached the end; `FUEL` if the instruction budget was exhausted before completion.
- `output`: a `Uint8Array` containing emitted bytes.
- `steps`: number of instructions actually executed.
- `eof`: whether a READ instruction attempted to read after input was exhausted.
- `state`: final `pc`, `dp`, `cp`, `key`, and copies of the data and control tapes.

The tape arrays in `state` are snapshots. Mutating them cannot change the completed execution.

## Canonical output formatting

`formatByte(value)` renders a byte as a two-digit uppercase hexadecimal atom such as `~41`. `formatBytes(bytes)` renders a sequence such as `[ ~41 ~42 ]`, with the empty sequence written `[ ]`. `formatResult(result)` combines the sequence and execution status, for example `< [ ~41 ~42 ] ; HALTED >` or `< [ ] ; FUEL >`. The formatter validates all bytes and rejects unknown result statuses rather than silently printing host values.

## Runtime errors

Reserved decoded opcodes halt execution by throwing `ElectaRuntimeError` with code `E002` and the source location of the offending symbol. The runtime does not execute filesystem, network, process, clock, or environment operations.

## Determinism

Given the same parsed source, input bytes, and options, the reference runtime produces the same status, output bytes, step count, EOF flag, and final machine state.
