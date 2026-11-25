# Neutron

## Projects

- **Electa** — an intentionally difficult esoteric programming language. Source files use the `.el` extension.
- **Consoler** — a defensive toolkit for opt-in application anomaly signals and development-only diagnostics. It cannot block DevTools or make hacking impossible; sensitive decisions remain server-side.

## Getting started

The stable-release plan and phase gates are tracked in [ROADMAP.md](ROADMAP.md). The reusable delegation brief for another AI working on Consoler is [docs/CONSOLER-AI-PROMPT.md](docs/CONSOLER-AI-PROMPT.md).

All project work is currently tracked directly on `main`. Consoler's [threat model](docs/CONSOLER-THREAT-MODEL.md), [API contract](docs/CONSOLER-API.md), [integration guide](docs/CONSOLER-INTEGRATION.md), [server authorization example](examples/consoler/server-authorization.js), and [AI delegation prompt](docs/CONSOLER-AI-PROMPT.md) define its security boundaries and integration pattern.

## Development

Requirements: Node.js 20 or newer. Electa now includes a lexer, parser, reference runtime, canonical output formatter, file runner, and line-oriented REPL.

```sh
npm test
npm start -- --help
npm start -- --version
npm start -- --repl
```

Run a source file with `npm start -- path/to/program.el`. Start with the [beginner tutorial](docs/ELECTA-TUTORIAL.md), then consult the [language specification](docs/ELECTA-LANGUAGE-SPEC.md), [runtime API](docs/ELECTA-RUNTIME.md), and [CLI/REPL guide](docs/ELECTA-CLI.md). Browse the [runnable examples](examples/README.md), [FAQ](docs/FAQ.md), and [architecture overview](docs/ARCHITECTURE.md). The [starter challenge suite](challenges/README.md) is exercised by `npm test`; the [difficulty benchmark protocol](docs/ELECTA-DIFFICULTY-BENCHMARK.md) defines how comparative claims will be evaluated. The project uses Node.js built-ins and has no runtime dependencies. See the [security review](docs/SECURITY-REVIEW.md) for resource ceilings, test coverage, and residual risks. Release engineering is documented in the [versioning policy](docs/VERSIONING.md), [changelog](CHANGELOG.md), and [v1.0.0 acceptance checklist](docs/RELEASE-CHECKLIST.md). Contribution rules are in [CONTRIBUTING.md](CONTRIBUTING.md).
