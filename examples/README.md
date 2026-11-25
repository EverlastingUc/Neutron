# Electa Examples

| File | Purpose | Run |
|---|---|---|
| [hello.el](hello.el) | Emit ASCII `A` (byte `~41`). | `npm start -- examples/hello.el` |
| [read-echo.el](read-echo.el) | Read one byte, emit it, and halt. | `npm start -- examples/read-echo.el --input examples/read-echo-input.txt` |
| [skip.el](skip.el) | Exercise a conditional forward jump. | `npm start -- examples/skip.el` |

Expected results are tested by `npm test`. The [beginner tutorial](../docs/ELECTA-TUTORIAL.md) walks through these programs.
