# Electa & Consoler — Stable Release Roadmap

> Repository: **Neutron** · Language: **Electa** · Source extension: **.el** · Defensive console-security toolkit: **Consoler**

This roadmap defines the first stable release. Work is performed directly on **main**, as requested. Each phase must be completed, tested, documented, and committed before the next phase begins.

## Product boundaries

### Electa
Electa is an intentionally hostile, esoteric programming language. Its design goal is to be exceptionally difficult to read and write—aiming to exceed Malbolge in practical puzzle difficulty—while remaining deterministic, specified, testable, and implementable. “Harder than Malbolge” is a design target, not a provable ranking; benchmarks and independent challenge tests will be needed.

The language will use .el source files. The interactive console/REPL will parse Electa source and render every language-level result in canonical Electa notation. Host diagnostics (for example, a source location for a syntax error) are tooling metadata, not Electa program output.

### Consoler
Consoler is a defensive toolkit for reducing abuse of browser developer consoles and application debug surfaces. It cannot make hacking impossible, disable a user's browser console, or secure code that has already been delivered to an untrusted client. Client-side checks are bypassable. Real security must be enforced server-side with authentication, authorization, validation, rate limits, secure session handling, and careful secret management.

Consoler will focus on safe integration patterns, tamper/friction signals, development-only diagnostics, and server-side verification examples. It will not claim absolute protection or interfere with legitimate browser/devtools use.

## Stable release scope (v1.0.0)

- A written, versioned Electa language specification.
- A deterministic reference interpreter with a documented execution model.
- Lexer/tokenizer, parser, validated intermediate representation, evaluator/runtime, and canonical Electa value printer.
- .el file execution and an interactive REPL.
- A deliberately difficult but bounded core instruction set and encoding/transformation rules.
- Explicit resource limits: execution fuel, memory limits, input limits, and predictable failure modes.
- Helpful developer diagnostics without leaking host-language values into Electa program output.
- Unit, integration, property/fuzz, and regression tests.
- CLI, examples, tutorial, API documentation, security notes, and release workflow.
- Consoler defensive library, threat model, integration guide, and tests demonstrating its limits.

Out of scope for v1.0.0: native machine-code compilation, a JIT, a package registry, network execution, a hosted playground, cryptographic claims, anti-debugging malware-like behavior, and any promise of unbreakable security.

## Phases

- [x] **0 — Repository baseline & project contract**: inspect repository, establish project structure, conventions, threat model, and roadmap.
- [x] **1 — Language design**: specify Electa's values, source encoding, instruction set, state machine, I/O, errors, and canonical output grammar.
- [x] **2 — Toolchain foundation**: choose a maintainable implementation stack; create CLI skeleton, configuration, formatting/linting, and test runner.
- [x] **3 — Lexer and source model**: tokenize .el input, track spans, reject malformed encodings deterministically.
- [x] **4 — Parser and validation**: parse source into a validated representation; define precise syntax and error behavior.
- [x] **5 — Electa runtime**: implement the abstract machine, memory model, instruction semantics, execution fuel, and bounded execution. Runtime API documented; conformance tests cover arithmetic, tape wraparound, I/O, jumps, reserved opcodes, and fuel.
- [x] **6 — Canonical Electa I/O**: implement the Electa value grammar and ensure every language-level REPL result is rendered as Electa, never raw host values. Byte, sequence, and execution-result formatters are implemented and tested against the specification.
- [x] **7 — CLI and REPL**: run files, interactive input, deterministic output, exit codes, and diagnostics. File execution, byte-input files, bounded UTF-8 source loading, line-oriented REPL, and CLI documentation are implemented and tested.
- [x] **8A — Difficulty mechanics & challenge suite**: the stateful six-bit decoder, post-instruction key evolution, dual circular tapes, and conditional source-symbol jumps are specified and implemented; five executable challenge fixtures are covered by automated conformance tests.
- [ ] **8B — Empirical difficulty study**: compare Electa against matched esoteric-language tasks with independent participants. The benchmark protocol is published, but no participant study has been run; do not claim a measured difficulty ranking.
- [x] **9 — Consoler threat model & API**: document realistic attacker capabilities, protected assets, non-goals, signal handling, privacy requirements, and the safe opt-in API contract.
- [x] **10 — Consoler implementation**: add opt-in bounded signal reporting, validated event types/codes, development-only diagnostics, callback failure containment, and a tested server-side authorization example. No DevTools blocking or client-side security claims.
- [x] **11 — Quality & security hardening**: deterministic property/fuzz tests, adversarial Consoler inputs, source/input/program/fuel ceilings, bounded CLI file reads, dependency inventory, and residual-risk review are implemented and documented.
- [x] **12 — Documentation & examples**: beginner Electa tutorial, language/runtime/CLI references, Consoler integration and privacy guides, FAQ, architecture diagrams, runnable `.el` examples, and example conformance tests.
- [ ] **13 — Release engineering**: CI, cross-platform checks, versioning, changelog, license review, reproducible release checks, and v1.0.0 acceptance checklist.

## Completion policy

A phase is complete only when its deliverables exist in the repository, tests pass (where applicable), documentation is updated, and its checklist item is marked complete. Never claim a test was run unless it actually ran. Keep all changes on main; do not create feature branches or open pull requests unless the owner changes this instruction.

## Acceptance gates for v1.0.0

1. A clean checkout can install the documented development requirements and run the full test suite.
2. Every documented Electa program has a stable, reproducible result.
3. Invalid programs fail predictably and cannot exceed configured execution/resource limits.
4. REPL language-level outputs always use the canonical Electa representation.
5. .el file execution and interactive mode work on supported platforms.
6. Consoler documentation accurately states what it can and cannot protect; security-sensitive decisions remain server-side.
7. CI, changelog, license, examples, and release instructions are complete.
