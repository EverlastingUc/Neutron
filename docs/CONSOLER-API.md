# Consoler API Design

Status: v0.1 proposed contract for the first implementation. See [the threat model](CONSOLER-THREAT-MODEL.md) before integrating it.

## Design rule

Consoler does not detect or block DevTools. It provides a small opt-in channel for application code to report its own typed anomaly signals. It performs no network requests and makes no access-control decisions.

## Proposed API

```js
import { createConsoler } from "./src/consoler.js";

const consoler = createConsoler({
  maxSignals: 20,
  onSignal(signal) {
    // The application may forward this low-trust event to its own backend.
    // The backend must validate it and must not treat it as proof of abuse.
  }
});

consoler.reportSignal({
  type: "state-mismatch",
  code: "PROFILE_STATE_INVALID"
});

consoler.dispose();
```

## Contract

### `createConsoler(options)`

- `onSignal`: optional synchronous callback. If absent, signals are accepted locally but not transmitted or persisted.
- `maxSignals`: optional integer from 1 to 1000; defaults to 20 per instance.
- Returns a frozen object containing `reportSignal` and `dispose`.

### `reportSignal(signal)`

Accepts only:

- `type`: one of `state-mismatch`, `integrity-mismatch`, or `unexpected-transition`.
- `code`: optional application-defined identifier matching `^[A-Z0-9_-]{1,32}$`.

Returns `true` if the signal passed local validation and the instance budget; otherwise returns `false`. The callback receives a fresh, frozen object with only `version: 1`, `type`, and optional `code`.

No arbitrary metadata, exception objects, URLs, DOM snapshots, or user content are accepted.

### `dispose()`

Disables further reporting for the instance. Calls after disposal return `false`.

## Callback behavior

The callback is invoked synchronously. If it throws, Consoler catches the exception and returns `false`; it does not rethrow application callback errors or attempt a network retry. The integrating application owns delivery, server-side validation, retention, and privacy disclosures.

## Non-guarantees

- A signal can be forged, suppressed, duplicated, or bypassed by the browser user.
- A missing signal does not imply the client is safe.
- A signal does not establish intent or prove an attack.
- This API does not replace server-side authentication, authorization, validation, or rate limiting.
