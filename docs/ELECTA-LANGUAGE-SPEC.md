# Electa Language Specification — Draft 0.1

Status: design baseline for the v1.0.0 implementation. Changes require updating this document and its conformance fixtures together.

## 1. Design goals

Electa is a deterministic, intentionally difficult esoteric language. Its difficulty comes from state-dependent instruction decoding, a mutable circular data tape, a second control tape, and a compact symbol alphabet. The implementation must still be auditable and bounded.

Electa's ambition is to be harder to program in than Malbolge. That is not an objectively established fact; the project must publish challenge programs and compare independent solver outcomes before making comparative claims.

## 2. Source format

- File extension: .el
- Encoding: UTF-8, no byte-order mark.
- Source alphabet: the 64 ASCII characters in this exact order:
  `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!?`
- Whitespace (ASCII space, tab, CR, LF) is ignored and does not advance the decoder.
- Any other character is a lexical error with a one-based line and column.
- There are no comments in v1.0.0. This keeps the source representation unambiguous.
- The source is a stream of six-bit symbols. Each symbol's alphabet index is a ciphertext value, not a direct opcode.

## 3. Machine state

The abstract machine contains:

- Program: an immutable array of six-bit source symbols.
- PC: program counter, initially 0.
- Data tape: 256 unsigned 8-bit cells, initially all zero.
- DP: data pointer, initially 0; tape addressing wraps modulo 256.
- Control tape: 256 unsigned 8-bit cells, initially all zero.
- CP: control pointer, initially 0; addressing wraps modulo 256.
- Key K: unsigned 6-bit decoder key, initially 0.
- Input: finite byte sequence supplied by the host.
- Output: byte sequence accumulated by the machine.
- Fuel: a host-configured instruction budget consumed once per executed instruction.

The machine is deterministic for a given source, input, and execution configuration.

## 4. Stateful instruction decoding

For each source symbol at PC:

1. Let S be its alphabet index (0–63).
2. Decode opcode O = (S XOR K) AND 63.
3. Execute O according to the instruction table.
4. After execution, update K using the *post-instruction* state:

   K = ( (K * 17) + O + D + (DP * 3) + (CP * 5) + (PC AND 63) ) AND 63

   where D is the value of the data cell at the current DP after the instruction.
5. Advance PC according to the instruction's control-flow rule. If an instruction changes PC explicitly, the key update uses the destination PC.

All arithmetic in the key update is integer arithmetic. AND is bitwise AND. Multiplication and addition use unbounded mathematical integers before the final AND 63.

## 5. Instruction set

Opcodes not listed below are reserved and MUST halt with a ReservedOpcode error. This intentionally makes arbitrary source streams fragile.

| Opcode | Mnemonic | Semantics |
|---:|---|---|
| 0 | NOP | No operation. |
| 1 | INC | Increment data cell at DP modulo 256. |
| 2 | DEC | Decrement data cell at DP modulo 256. |
| 3 | RIGHT | DP = (DP + 1) modulo 256. |
| 4 | LEFT | DP = (DP - 1) modulo 256. |
| 5 | EMIT | Append the current data cell as one output byte. |
| 6 | READ | Read one input byte into the current cell; if input is exhausted, write 0 and set EOF status. |
| 7 | JZ | If current data cell is zero, jump forward by 1 + current control cell instructions; otherwise continue. |
| 8 | JNZ | If current data cell is nonzero, jump backward by 1 + current control cell instructions; otherwise continue. |
| 9 | CINC | Increment control cell at CP modulo 256. |
| 10 | CDEC | Decrement control cell at CP modulo 256. |
| 11 | CRIGHT | CP = (CP + 1) modulo 256. |
| 12 | CLEFT | CP = (CP - 1) modulo 256. |
| 13 | MIX | Data cell = (data cell XOR control cell) modulo 256. |
| 14 | ROT | Rotate current data cell left by (current control cell AND 7) bits. A rotation by zero is unchanged. |
| 15 | HALT | Halt successfully after applying the key update. |

### Program-counter rules

- Ordinary instructions advance PC by 1.
- JZ with a zero data cell advances PC by 1 + 1 + control-cell; with a nonzero data cell it advances by 1.
- JNZ with a nonzero data cell sets PC to max(0, PC - (1 + 1 + control-cell)); with a zero data cell it advances by 1.
- Jumps are measured in source symbols, not decoded instructions.
- A PC at or beyond program length halts successfully.
- A backward jump clamps at zero; it never wraps.
- Key update occurs once after every executed instruction, including HALT, before final termination.

## 6. I/O and canonical Electa output

The machine's output is a byte sequence. The REPL and CLI MUST NOT print host-language representations of internal values.

Canonical Electa output notation:

- A byte is rendered as exactly two uppercase hexadecimal digits prefixed by `~`, e.g. byte 65 is `~41`.
- A byte sequence is rendered as `[ ` followed by space-separated byte atoms and ` ]`. Empty output is `[ ]`.
- A completed execution result is rendered as `< [ ... ] ; HALTED >` or `< [ ... ] ; FUEL >` (the inner sequence uses the same byte atoms).
- A runtime error is a host diagnostic, not a language value. It must include a stable error code and source location where available; it must never interpolate arbitrary host objects.

Examples:
- Empty successful result: `< [ ] ; HALTED >`
- Output bytes 65 and 66: `< [ ~41 ~42 ] ; HALTED >`
- Fuel exhaustion: `< [ ] ; FUEL >`

The REPL accepts source fragments and displays each execution result using this grammar. Tooling prompts such as `electa>` are not program output.

## 7. Errors and limits

Stable error codes for v1.0.0:

- E001 InvalidSourceCharacter
- E002 ReservedOpcode
- E003 FuelExhausted (used only when the CLI is configured to report exhaustion as an error; default result status is FUEL)
- E004 InputLimitExceeded
- E005 SourceLimitExceeded
- E006 InvalidUtf8

Required host-configurable limits:

- Maximum source bytes: 1 MiB by default.
- Maximum input bytes: 1 MiB by default.
- Maximum fuel: 1,000,000 instructions by default.
- Tape sizes are fixed at 256 cells each in v1.0.0.
- No filesystem, network, process, clock, or environment access is available to Electa programs.

## 8. Conformance requirements

An implementation conforms only if it:

1. Uses the exact source alphabet and whitespace rules.
2. Decodes symbols using the specified stateful key.
3. Applies instructions and PC rules exactly as specified.
4. Updates the key after every instruction using the post-instruction state and specified PC.
5. Enforces source, input, and fuel limits.
6. Produces byte-for-byte identical output and canonical rendering for the same inputs.
7. Passes published golden fixtures for normal execution, jumps, wraparound, EOF, reserved opcodes, HALT, and fuel exhaustion.

## 9. Open design note

This draft intentionally fixes a small machine before adding more complexity. Any proposed instruction or decoding change must come with a versioned spec update, test vectors, and a migration note. The v1.0.0 implementation must not silently reinterpret existing programs.
