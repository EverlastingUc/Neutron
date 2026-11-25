import test from "node:test";
import assert from "node:assert/strict";
import { createConsoler, createDiagnostics } from "../src/consoler.js";

test("Consoler emits only typed, frozen, minimal signals", () => {
  const received = [];
  const consoler = createConsoler({ onSignal: (signal) => received.push(signal) });
  assert.equal(consoler.reportSignal({ type: "state-mismatch", code: "PROFILE_INVALID" }), true);
  assert.equal(received.length, 1);
  assert.deepEqual(received[0], {
    version: 1,
    type: "state-mismatch",
    code: "PROFILE_INVALID"
  });
  assert.ok(Object.isFrozen(received[0]));
  assert.equal(consoler.reportSignal({ type: "unexpected-transition" }), true);
  assert.equal(received[1].code, undefined);
});

test("Consoler rejects unknown fields, unsafe codes, and invalid event types", () => {
  const consoler = createConsoler();
  assert.equal(consoler.reportSignal({ type: "state-mismatch", detail: "secret" }), false);
  assert.equal(consoler.reportSignal({ type: "state-mismatch", code: "token=secret" }), false);
  assert.equal(consoler.reportSignal({ type: "devtools-open" }), false);
  assert.equal(consoler.reportSignal({ type: "state-mismatch", code: 42 }), false);
  assert.equal(consoler.reportSignal(null), false);
});

test("Consoler rejects accessor properties without invoking them", () => {
  const consoler = createConsoler();
  let invoked = false;
  const signal = {
    get type() {
      invoked = true;
      return "state-mismatch";
    }
  };
  assert.equal(consoler.reportSignal(signal), false);
  assert.equal(invoked, false);
});

test("Consoler enforces its per-instance signal budget", () => {
  let count = 0;
  const consoler = createConsoler({ maxSignals: 2, onSignal: () => { count += 1; } });
  assert.equal(consoler.reportSignal({ type: "state-mismatch" }), true);
  assert.equal(consoler.reportSignal({ type: "integrity-mismatch" }), true);
  assert.equal(consoler.reportSignal({ type: "unexpected-transition" }), false);
  assert.equal(count, 2);
});

test("Consoler prevents re-entrant budget bypass", () => {
  let nested;
  let consoler;
  consoler = createConsoler({
    maxSignals: 1,
    onSignal: () => {
      nested = consoler.reportSignal({ type: "unexpected-transition" });
    }
  });
  assert.equal(consoler.reportSignal({ type: "state-mismatch" }), true);
  assert.equal(nested, false);
});

test("Consoler callback failures are contained and consume the bounded attempt", () => {
  const consoler = createConsoler({
    maxSignals: 1,
    onSignal: () => { throw new Error("callback failure"); }
  });
  assert.equal(consoler.reportSignal({ type: "state-mismatch" }), false);
  assert.equal(consoler.reportSignal({ type: "state-mismatch" }), false);
});

test("disposed Consoler instances reject future signals", () => {
  const consoler = createConsoler();
  consoler.dispose();
  consoler.dispose();
  assert.equal(consoler.reportSignal({ type: "state-mismatch" }), false);
});

test("Consoler validates configuration", () => {
  assert.throws(() => createConsoler(null), TypeError);
  assert.throws(() => createConsoler({ onSignal: true }), TypeError);
  assert.throws(() => createConsoler({ maxSignals: 0 }), RangeError);
  assert.throws(() => createConsoler({ maxSignals: 1001 }), RangeError);
});

test("diagnostics are silent by default and in production", () => {
  let count = 0;
  const defaultDiagnostics = createDiagnostics({ sink: () => { count += 1; } });
  const productionDiagnostics = createDiagnostics({
    mode: "production",
    sink: () => { count += 1; }
  });
  assert.equal(defaultDiagnostics.debug("APP_READY"), false);
  assert.equal(productionDiagnostics.debug("APP_READY"), false);
  assert.equal(count, 0);
});

test("development diagnostics emit only validated short codes", () => {
  const events = [];
  const diagnostics = createDiagnostics({
    mode: "development",
    sink: (event) => events.push(event)
  });
  assert.equal(diagnostics.debug("APP_READY"), true);
  assert.deepEqual(events, [{ level: "debug", code: "APP_READY" }]);
  assert.ok(Object.isFrozen(events[0]));
  assert.equal(diagnostics.debug("token-secret"), false);
});

test("diagnostics contain sink failures and validate configuration", () => {
  const broken = createDiagnostics({ mode: "development", sink: () => { throw Error("x"); } });
  assert.equal(broken.debug("APP_READY"), false);
  assert.throws(() => createDiagnostics({ mode: "test" }), TypeError);
  assert.throws(() => createDiagnostics({ sink: true }), TypeError);
});

test("Consoler contains proxy traps and asynchronous callback mistakes", () => {
  const consoler = createConsoler();
  const hostileProxy = new Proxy({}, {
    getPrototypeOf() {
      throw new Error("proxy trap");
    }
  });
  assert.equal(consoler.reportSignal(hostileProxy), false);

  const asyncCallback = createConsoler({
    onSignal: () => Promise.reject(new Error("async callback is unsupported"))
  });
  assert.equal(asyncCallback.reportSignal({ type: "state-mismatch" }), false);
});
