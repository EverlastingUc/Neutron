# Consoler Integration Guide

Consoler is useful only when it is integrated into a real application's own invariants and server-side security controls. It does not monitor whether DevTools is open.

## 1. Create an opt-in signal reporter

```js
import { createConsoler } from "./src/consoler.js";

const signalQueue = [];
const consoler = createConsoler({
  maxSignals: 10,
  onSignal(signal) {
    // This callback is synchronous. Queue the minimal event for application-owned
    // delivery; do not add tokens, user content, URLs, or arbitrary metadata.
    signalQueue.push(signal);
  }
});

// Call this only when the application itself detects a documented invariant failure.
if (!isExpectedProfileState(profileState)) {
  consoler.reportSignal({
    type: "state-mismatch",
    code: "PROFILE_STATE_INVALID"
  });
}

// On teardown:
consoler.dispose();
```

A signal is a low-confidence hint. A user can forge, suppress, or bypass it. Do not automatically ban users or deny access based on a signal.

## 2. Keep diagnostics development-only

```js
import { createDiagnostics } from "./src/consoler.js";

const diagnostics = createDiagnostics({
  mode: buildIsDevelopment ? "development" : "production",
  sink(event) {
    developmentLogCollector(event);
  }
});

diagnostics.debug("PROFILE_PANEL_READY");
```

Production mode is the default and emits nothing. Only short codes are accepted; arbitrary objects and application data are not logged by this helper.

## 3. Enforce permissions on the server

The example at [examples/consoler/server-authorization.js](../examples/consoler/server-authorization.js) demonstrates the required order:

1. Authenticate the request.
2. Authorize the authenticated principal for the specific operation.
3. Validate the request body against a server-owned schema.
4. Persist only validated data.

A hidden button, client-side role flag, or Consoler signal is never an authorization check.

## 4. Backend telemetry

If the application forwards queued signals to a backend, that endpoint must independently:

- Authenticate the sender where applicable.
- Validate the exact event schema and reject oversized payloads.
- Apply rate limits and retention limits.
- Treat events as spoofable telemetry.
- Correlate them with trusted server-side evidence.
- Avoid automatic punitive action from a single client event.

Consoler itself does not make network requests, persist events, or select a telemetry provider.

## 5. Privacy checklist

- [ ] The application explicitly documents why it emits signals.
- [ ] Signal codes contain no user identifiers or personal information.
- [ ] No passwords, access tokens, cookies, keystrokes, DOM snapshots, or page content are collected.
- [ ] The application documents consent, retention, and deletion for backend telemetry.
- [ ] Users are not punished solely for opening developer tools or triggering a client-side signal.
