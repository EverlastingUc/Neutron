# Consoler API

Status: implemented in `src/consoler.js`. Read the [threat model](CONSOLER-THREAT-MODEL.md) before integrating it.

## Security boundary

Consoler does not detect or block DevTools. It provides an opt-in channel for application code to report its own typed anomaly signals. It performs no network requests and makes no access-control decisions.

## Signal reporting

```js
import { createConsoler } from "./src/consoler.js";

const pendingSignals = [];
const consoler = createConsoler({
  maxSignals: 20,
  onSignal(signal) {
    // Keep this synchronous. The application owns any later delivery.
    pendingSignals.push(signal);
  }
});

consoler.reportSignal({
  type: "state-mismatch",
  code: "PROFILE_STATE_INVALID"
});

// Call when the owning application component is torn down.
consoler.dispose();
```

### `createConsoler(options)`

- `onSignal`: optional synchronous callback. If absent, signals are accepted locally but not transmitted or persisted.
- `maxSignals`: optional integer from 1 to 1000; defaults to 20 per instance.
- Returns a frozen object containing `reportSignal` and `dispose`.

### `reportSignal(signal)`

Accepts only:

- `type`: `state-mismatch`, `integrity-mismatch`, or `unexpected-transition`.
- `code`: optional application-defined identifier matching `^[A-Z0-9_-]{1,32}$`.

Returns `true` if the signal passed local validation and the instance budget; otherwise returns `false`. The callback receives a fresh, frozen object containing only `version: 1`, `type`, and optional `code`.

Unknown fields, symbols, accessors, unsafe codes, and invalid event types are rejected. The per-instance budget is incremented before callback invocation to prevent re-entrant bypass. Callback exceptions are contained; a callback that returns a Promise is treated as unsupported and returns `false`.

### `dispose()`

Disables further reporting for the instance. Calls after disposal return `false`.

## Development-only diagnostics

```js
import { createDiagnostics } from "./src/consoler.js";

const diagnostics = createDiagnostics({
  mode: import.meta.env?.DEV ? "development" : "production",
  sink(event) {
    // Send to a development-only logger or test collector.
  }
});

diagnostics.debug("PROFILE_PANEL_READY");
```

`createDiagnostics(options)` defaults to `production`, where `debug()` is a no-op. In development mode, it forwards only short codes matching `^[A-Z0-9_-]{1,32}$` to the supplied sink. It does not use the global console automatically and does not accept arbitrary log payloads.

## Server-side authorization example

See [examples/consoler/server-authorization.js](../examples/consoler/server-authorization.js). It demonstrates authentication, authorization, request validation, and persistence as separate server-side steps. The route does not consult client-side Consoler signals.

## Callback and privacy behavior

Callbacks and diagnostic sinks run synchronously. Consoler catches callback failures; callbacks that return Promises are unsupported and reported as failures. Consoler does not retry, persist, or transmit events. The integrating application owns delivery, server-side validation, retention, and privacy disclosures.

No arbitrary metadata, exception objects, URLs, DOM snapshots, or user content are accepted. Consoler does not collect passwords, tokens, keystrokes, or browsing data.

## Non-guarantees

- A signal can be forged, suppressed, duplicated, or bypassed by the browser user.
- A missing signal does not imply the client is safe.
- A signal does not establish intent or prove an attack.
- This API does not replace server-side authentication, authorization, validation, or rate limiting.
