# Electa Starter Challenges

These fixtures exercise the current Electa v0.1 machine. They are both beginner examples and regression vectors.

| ID | Focus | Source |
|---|---|---|
| 001 | Emit one byte | `001-byte-one.el` |
| 002 | Conditional forward jump | `002-conditional-skip.el` |
| 003 | Read and emit input | `003-read-emit.el` |
| 004 | Backward jump and fuel | `004-backward-jump.el` |
| 005 | Reserved opcode error | `005-reserved-opcode.el` |

The exact execution configuration and expected result for each fixture are in [manifest.json](manifest.json). Run the full conformance suite with `npm test`.

These are starter-level conformance tasks, not evidence that Electa is harder than another esoteric language.
