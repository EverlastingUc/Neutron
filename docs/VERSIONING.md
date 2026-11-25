# Versioning and Release Policy

Neutron uses Semantic Versioning for repository releases. The supported Node.js runtime lines are 22, 24, and 26 LTS; the package engine range is `^22 || ^24 || ^26`.

- **MAJOR**: incompatible public API changes or incompatible Electa language semantics after v1.0.0.
- **MINOR**: backward-compatible functionality additions.
- **PATCH**: backward-compatible fixes and documentation corrections.

Before v1.0.0, the project is pre-stable. Minor releases may still change public APIs and Electa semantics. Any semantic change must update the language specification, challenge fixtures, examples, and changelog in the same release.

Electa language semantics are versioned independently in the specification header. A release must not silently reinterpret existing `.el` programs.

## Release identifiers

- Repository package version: `package.json`.
- Git tag: `vX.Y.Z`.
- Changelog heading: `[X.Y.Z] - YYYY-MM-DD`.

Do not publish an npm package while `package.json` has `private: true`. Removing that safeguard requires an explicit release decision, package-name availability review, and a clean package-content review.
