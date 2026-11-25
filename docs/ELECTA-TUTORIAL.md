# Electa Beginner Tutorial

This tutorial uses the reference interpreter in Neutron. You do not need to know JavaScript to run the examples.

## 1. Requirements

Install Node.js 22 or newer, then open a terminal in the Neutron repository.

Run the tests:

```sh
npm test
```

Show the command help:

```sh
npm start -- --help
```

## 2. Your first Electa program

Open [examples/hello.el](../examples/hello.el), then run:

```sh
npm start -- examples/hello.el
```

Expected output:

```text
< [ ~41 ] ; HALTED >
```

Electa output is byte-oriented. `~41` is hexadecimal byte 0x41, which represents the ASCII character `A`. The result wrapper says the program halted normally.

The source looks unusual because the visible characters are not direct instruction names. Each character is a six-bit source symbol that must be decoded using the current key.

## 3. The machine in plain language

Electa v0.1 has:

- A program counter (`PC`) that selects the next source symbol.
- A 256-cell data tape of bytes, controlled by `DP`.
- A second 256-cell control tape of bytes, controlled by `CP`.
- A six-bit decoder key (`K`), initially zero.
- An input byte sequence and an output byte sequence.
- An instruction fuel budget.

Both tape pointers wrap around: moving left from cell 0 reaches cell 255; moving right from cell 255 reaches cell 0.

## 4. Why the source is difficult to read

For every source symbol:

1. Find its index `S` in the 64-character alphabet from the language specification.
2. Decode the instruction using `O = (S XOR K) AND 63`.
3. Execute the decoded instruction.
4. Update the key from the post-instruction machine state and resulting program counter.

The key changes after every instruction. Therefore, the same visible character can decode to different instructions at different points in a program.

For example, the first character of `16q` is `1`, whose alphabet index is 1. With initial key 0, it decodes to opcode 1 (`INC`). After incrementing the first data cell to 1, the key becomes 3. The next source symbol is decoded using key 3—not key 0.

## 5. Read and emit a byte

Run:

```sh
npm start -- examples/read-echo.el --input examples/read-echo-input.txt
```

Expected output:

```text
< [ ~41 ] ; HALTED >
```

The input file contains the single ASCII byte `A`. The Electa source `6DV` reads that byte, emits it, and halts. The program is deliberately short, but its characters still pass through the stateful decoder.

## 6. Conditional jumps

Run:

```sh
npm start -- examples/skip.el
```

Expected output:

```text
< [ ] ; HALTED >
```

The first decoded instruction is `JZ`. The initial data cell is zero, so the jump skips one source symbol. The symbol at the new program counter decodes to `HALT`.

Jumps count source-symbol positions, not the number of instructions that have been executed.

## 7. The instruction set

| Opcode | Instruction | Meaning |
|---:|---|---|
| 0 | NOP | Do nothing. |
| 1 | INC | Increment the current data byte. |
| 2 | DEC | Decrement the current data byte. |
| 3 / 4 | RIGHT / LEFT | Move the data pointer. |
| 5 / 6 | EMIT / READ | Write or read one byte. |
| 7 / 8 | JZ / JNZ | Conditional forward/backward jumps. |
| 9 / 10 | CINC / CDEC | Change the current control byte. |
| 11 / 12 | CRIGHT / CLEFT | Move the control pointer. |
| 13 | MIX | XOR the data and control bytes. |
| 14 | ROT | Rotate the data byte left. |
| 15 | HALT | Stop successfully. |

The exact arithmetic and jump rules are in the [language specification](ELECTA-LANGUAGE-SPEC.md).

## 8. Try the REPL

```sh
npm start -- --repl
```

Enter one source fragment per line. Each line runs as a separate program with fresh tapes and a fresh decoder key. Use `.help` for the command reminder and `.exit` to quit.

## 9. Execution limits

- Source: at most 1 MiB.
- Input: 1 MiB by default; runtime API can be configured up to 16 MiB.
- Fuel: 1,000,000 instructions by default, with a hard ceiling of 10,000,000.
- Data and control tapes: 256 bytes each.

These limits keep accidental infinite loops and oversized inputs bounded. See the [runtime API guide](ELECTA-RUNTIME.md) for the host interface.

## 10. What to learn next

- Read the [full language specification](ELECTA-LANGUAGE-SPEC.md).
- Run the [starter challenge suite](../challenges/README.md).
- Review the [CLI/REPL guide](ELECTA-CLI.md).
- Inspect the [runtime implementation](../src/runtime.js) after you are comfortable with the machine model.
