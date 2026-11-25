# Neutron

## Projects

- **Electa** — an intentionally difficult esoteric programming language. Source files use the `.el` extension.
- **Consoler** — a defensive toolkit for application console/debug-surface security. It reduces risk and can provide tamper signals; it cannot make hacking impossible or replace server-side security.

## Getting started

The stable-release plan and phase gates are tracked in [ROADMAP.md](ROADMAP.md). The reusable delegation brief for another AI working on Consoler is [docs/CONSOLER-AI-PROMPT.md](docs/CONSOLER-AI-PROMPT.md).

All project work is currently tracked directly on `main`.

## Development

Requirements: Node.js 20 or newer. Electa now includes a lexer, parser, reference runtime, canonical output formatter, file runner, and line-oriented REPL.

```sh
npm test
npm start -- --help
npm start -- --version
npm start -- --repl
```

Run a source file with `npm start -- path/to/program.el`. See the [language specification](docs/ELECTA-LANGUAGE-SPEC.md), [runtime API](docs/ELECTA-RUNTIME.md), and [CLI/REPL guide](docs/ELECTA-CLI.md) for details. The [starter challenge suite](challenges/README.md) is exercised by `npm test`; the [difficulty benchmark protocol](docs/ELECTA-DIFFICULTY-BENCHMARK.md) defines how comparative claims will be evaluated. The project uses Node.js built-ins and has no runtime dependencies.
