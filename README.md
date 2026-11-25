# Neutron

## Projects

- **Electa** — an intentionally difficult esoteric programming language. Source files use the `.el` extension.
- **Consoler** — a defensive toolkit for application console/debug-surface security. It reduces risk and can provide tamper signals; it cannot make hacking impossible or replace server-side security.

## Getting started

The stable-release plan and phase gates are tracked in [ROADMAP.md](ROADMAP.md). The reusable delegation brief for another AI working on Consoler is [docs/CONSOLER-AI-PROMPT.md](docs/CONSOLER-AI-PROMPT.md).

All project work is currently tracked directly on `main`.

## Development

Requirements: Node.js 20 or newer. The Electa lexer, parser, and reference runtime are implemented; CLI file execution and the REPL are still pending.

```sh
npm test
npm start -- --help
npm start -- --version
```

The project uses Node.js built-in test runner and currently has no runtime dependencies. Read the [language specification](docs/ELECTA-LANGUAGE-SPEC.md) and [runtime API guide](docs/ELECTA-RUNTIME.md) for implementation details.
