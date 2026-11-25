# Neutron FAQ

## Electa

### Is Electa a general-purpose language?

Not yet. The current v0.1 implementation is a small esoteric byte-machine with a fixed instruction set. It is a foundation for the planned stable release, not a production application language.

### Why does the source look like random characters?

The 64-character alphabet encodes six-bit values. Each value is XOR-decoded using a key that changes after every executed instruction. The same source character can therefore represent different opcodes in different machine states.

### Why use two tapes?

The data tape stores working bytes. The control tape provides a second state channel used by jumps, XOR mixing, and bit rotation. Both tapes are fixed at 256 bytes in v0.1.

### Can Electa print normal text?

The machine emits bytes. The canonical representation prints each byte as uppercase hexadecimal prefixed by `~`. For example, ASCII `A` is `~41`. A later library may provide explicit text decoding, but the core output remains byte-based.

### Why are some source characters invalid instructions?

Decoded opcodes 16–63 are reserved. Encountering one produces E002. This makes source construction fragile by design.

### Does Electa beat Malbolge?

That has not been established. The project has a difficulty benchmark protocol, but no independent participant study has been run. The comparison remains an ambition, not a measured result.

### Does the REPL preserve state between lines?

No. Each input line is a separate program execution with fresh tapes and a fresh key.

## Consoler

### Does Consoler disable F12 or browser DevTools?

No. A website cannot reliably control the user's browser or prevent inspection of code already delivered to the client. Consoler does not block shortcuts, freeze pages, or interfere with legitimate debugging.

### What does Consoler actually do?

It offers an opt-in, bounded channel for application code to report a small set of typed anomaly signals, plus diagnostics that are silent by default and can be enabled in development.

### Are Consoler signals proof of hacking?

No. Signals can be forged, suppressed, duplicated, or caused by ordinary bugs. They are low-confidence telemetry, never authorization evidence.

### Where should real security live?

On the server: authenticate requests, authorize every sensitive operation, validate inputs, rate-limit abuse, protect sessions, and keep privileged secrets out of browser code.

## Repository

### Where does development happen?

The repository is [EverlastingUc/Neutron](https://github.com/EverlastingUc/Neutron). Project changes are being committed directly to `main`.

### Does the project use external dependencies?

The current implementation uses Node.js built-ins and has no runtime or development dependencies.
