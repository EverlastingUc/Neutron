# Contributing to Neutron

## Source of truth

The canonical repository branch is `main`. Project-owner implementation work is committed directly to `main` as requested. Do not force-push or rewrite shared history.

## Before changing Electa

- Read `docs/ELECTA-LANGUAGE-SPEC.md`.
- Treat the specification as the semantic contract.
- Update conformance fixtures and examples whenever semantics change.
- Preserve canonical Electa output formatting.
- Add a regression test for every bug fix.

## Before changing Consoler

- Read the threat model and API contract.
- Never add DevTools blocking, keyboard traps, page freezes, stealth, keylogging, or sensitive-data collection.
- Keep signals opt-in, typed, bounded, and explicitly untrusted.
- Never make client-side signals an authorization decision.

## Verification

Run before committing:

```sh
npm test
npm pack --dry-run
```

CI additionally checks Node.js 22, 24, and 26 LTS on Linux, Windows, and macOS.

## Commit hygiene

- Use a short imperative commit message.
- Keep changes focused and update documentation with implementation changes.
- Never commit secrets, local environment files, generated archives, or personal data.
- Do not mark a roadmap phase complete until implementation, tests, and documentation are all present.
