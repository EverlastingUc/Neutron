# Changelog

All notable changes to Neutron, Electa, and Consoler are documented here.

This project follows Semantic Versioning. Until v1.0.0, public APIs and language semantics may change between minor releases; any Electa semantic change must update the language specification and conformance fixtures.

## [Unreleased]

### Added
- Release acceptance checklist and cross-platform CI coverage.

## [0.1.0] - 2026-11-25

### Added
- Electa v0.1 language specification, lexer, immutable parser representation, and deterministic byte-machine runtime.
- Canonical Electa byte, sequence, and execution-result formatting.
- `.el` file execution, byte input files, bounded fuel, and interactive REPL.
- Starter challenge fixtures, runnable examples, tutorial, FAQ, and architecture documentation.
- Consoler opt-in bounded anomaly signals and development-only diagnostics.
- Consoler threat model, privacy contract, integration guide, and server-side authorization example.
- Node.js built-in test suite and GitHub Actions CI.

### Security
- Explicit source, input, program-size, and instruction-fuel ceilings.
- No runtime dependencies and no automatic Consoler network activity.
- Documented limitations: Consoler cannot block DevTools or replace server-side security.
