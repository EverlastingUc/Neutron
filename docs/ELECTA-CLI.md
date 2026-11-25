# Electa CLI and REPL

The command-line interface is implemented in `src/cli.js` and requires Node.js 22, 24, or 26 LTS.

## Run a source file

From the repository root:

```sh
npm start -- examples/hello.el
# or
node src/cli.js examples/hello.el
```

Only files ending in `.el` are accepted. Source must be valid UTF-8 without a byte-order mark and may not exceed 1 MiB.

## Options

```sh
npm start -- --help
npm start -- --version
npm start -- examples/program.el --fuel 500000
npm start -- examples/program.el --input input.bin
npm start -- --repl
```

- `--fuel N` sets the instruction budget. The default is 1,000,000; zero is valid; the hard maximum is 10,000,000.
- `--input FILE` supplies raw input bytes to Electa's `READ` instruction. The default input is empty. The input limit is 1 MiB.
- `--repl` starts the interactive console.

## Canonical output

The CLI renders execution results using the Electa output grammar, not JavaScript arrays or strings.

For example, source `16q` increments the first data cell, emits byte 1, and halts:

```text
< [ ~01 ] ; HALTED >
```

If fuel is exhausted, the CLI prints the partial output and the `FUEL` status:

```text
< [ ] ; FUEL >
```

## REPL

Start it with:

```sh
npm start -- --repl
```

Enter one Electa source fragment per line. Each line is a separate execution with a fresh machine state; it does not share tape or decoder state with previous lines. Use `.help` for the short command reminder and `.exit` to leave.

## Exit codes

| Code | Meaning |
|---:|---|
| 0 | Help/version displayed, REPL ended, or source completed normally. |
| 2 | Invalid command-line arguments, file/encoding/source error, or runtime error. |
| 3 | Program exhausted its configured instruction fuel. |

Diagnostics are written to standard error and include a stable Electa error code where one is defined. They are host-tooling messages, not Electa program values.
