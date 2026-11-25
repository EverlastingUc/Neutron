# Neutron Security and Resource Review

Review baseline: 2026-11-25. This is an engineering self-review, not an independent security audit or formal verification.

## Dependency inventory

- Runtime dependencies: none.
- Development dependencies: none.
- Test runner: Node.js built-in `node:test`.
- CI matrix: Node.js 22, 24, and 26.
- Runtime modules use Node.js built-ins only.

## Electa controls

| Area | Control |
|---|---|
| Source loading | CLI reads regular files through an open file handle, checks the handle's size, and reads no more than the configured limit plus one byte. |
| Source parsing | UTF-8 validation in the CLI; one MiB source-byte limit in both CLI and lexer; parser caps token streams at one MiB symbols. |
| Program representation | Runtime rejects forged program objects whose symbol count exceeds the source-symbol ceiling. |
| Input | One MiB CLI default; runtime default one MiB and hard configurable ceiling 16 MiB. Oversized input is rejected before copying; sparse arrays are rejected. |
| Execution | One million default fuel; hard ceiling ten million instructions. |
| Memory | Two fixed 256-byte tapes; output is bounded by executed instructions and therefore by fuel. |
| Capabilities | Electa programs have no filesystem, network, process, clock, or environment access. |
| Output | Canonical byte formatter validates byte ranges and accepted execution statuses. |

## Consoler controls

- No automatic instrumentation, network calls, persistence, DevTools detection, or browser API access.
- Signal types are a finite allowlist; optional codes are limited to 32 uppercase ASCII identifier characters.
- Unknown properties, symbols, accessors, malformed objects, and hostile proxy traps are rejected or contained.
- Signal objects are minimal and frozen.
- A per-instance signal budget is incremented before callback invocation to prevent re-entrant bypass.
- Callback and diagnostic sink failures are contained; asynchronous callbacks are unsupported.
- Production diagnostics are silent by default.
- Server authorization, validation, and persistence are shown in a separate example and are not derived from client telemetry.

## Test coverage

The test suite includes:

- Golden language and challenge fixtures.
- Lexer/parser source and token-stream boundaries.
- Runtime opcode, jump, tape-wrap, EOF, fuel, and input-limit cases.
- CLI file, REPL, UTF-8, source-size, input-size, and fuel-limit cases.
- Consoler malformed-input, proxy, accessor, callback, re-entrancy, rate-budget, and privacy-schema cases.
- Deterministic property tests over 500 generated Electa programs and 1,000 malformed Consoler signal candidates.

Run with:

```sh
npm test
```

## Residual risks and non-goals

- This repository has not undergone an independent penetration test, external audit, or formal verification.
- The interpreter runs synchronously. The ten-million-instruction ceiling bounds work but can still occupy the Node.js event loop; untrusted multi-tenant execution should use process/worker isolation and OS-level CPU/memory controls.
- A compromised host application can misuse its own Consoler callback or diagnostics sink.
- Client-side Consoler signals are forgeable and suppressible. They must never authorize, deauthorize, or punish a user by themselves.
- File size checks and regular-file checks reduce resource risks but do not make the host filesystem trustworthy.

## Release gate

Before v1.0.0, repeat the dependency and security review, run CI on every supported Node.js version, review all examples for secrets and unsafe trust assumptions, and obtain an independent security review appropriate to the deployment context.
