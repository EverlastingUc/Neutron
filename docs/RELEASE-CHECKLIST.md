# v1.0.0 Release Acceptance Checklist

This checklist is a release gate, not a promise that the project is already stable. Keep unchecked items open until verified.

## Repository and build

- [ ] All work is committed to `main`; working tree is clean.
- [ ] `npm test` passes on Node.js 22, 24, and 26 LTS on Linux, Windows, and macOS.
- [ ] GitHub Actions matrix is green for the release commit.
- [ ] `npm pack --dry-run` contents have been reviewed.
- [ ] No unreviewed dependencies, secrets, generated artifacts, or local files are included.
- [ ] Package metadata, license, changelog, and version are consistent.
- [ ] `private: true` remains enabled unless npm publication is explicitly approved.

## Electa

- [ ] Language specification is versioned and frozen for the release.
- [ ] Lexer, parser, runtime, canonical formatter, CLI, and REPL pass conformance tests.
- [ ] Golden fixtures cover every opcode, jumps, pointer wraparound, EOF, HALT, reserved opcodes, and fuel exhaustion.
- [ ] Source, input, memory, and execution limits are documented and tested.
- [ ] Beginner tutorial and every runnable example match actual CLI output.
- [ ] Comparative difficulty claims are supported by a published independent study or omitted.

## Consoler

- [ ] Threat model, API, integration guide, and privacy notes are current.
- [ ] No feature blocks DevTools, freezes pages, collects sensitive user data, or makes absolute security claims.
- [ ] Signals are explicitly untrusted and cannot drive authorization by themselves.
- [ ] Server-side authorization and validation examples are tested.
- [ ] External security review has been considered for the intended deployment context.

## Final release procedure

1. Freeze the language specification and API contracts.
2. Update `CHANGELOG.md` and `package.json` version.
3. Run the complete CI matrix and package dry-run.
4. Review the release diff and security notes.
5. Create the `v1.0.0` tag only after every mandatory gate is checked.
6. Publish release notes with known limitations and migration notes.

Do not mark this checklist complete based only on a local test run.
