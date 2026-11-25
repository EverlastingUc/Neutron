import test from "node:test";
import assert from "node:assert/strict";
import { createUpdateProfileHandler } from "../examples/consoler/server-authorization.js";

function makeHandler(overrides = {}) {
  const calls = [];
  const handler = createUpdateProfileHandler({
    authenticate: async () => ({ id: "user-1" }),
    authorize: async (_principal, permission) => permission === "profile:update",
    validateProfile: (body) => {
      if (!body || typeof body.displayName !== "string") throw new Error("invalid");
      return { displayName: body.displayName };
    },
    saveProfile: async (id, profile) => calls.push({ id, profile }),
    ...overrides
  });
  return { handler, calls };
}

test("server example rejects unauthenticated requests", async () => {
  const { handler, calls } = makeHandler({ authenticate: async () => null });
  assert.deepEqual(await handler({ body: { displayName: "A" } }), { status: 401 });
  assert.deepEqual(calls, []);
});

test("server example enforces authorization before saving", async () => {
  const { handler, calls } = makeHandler({ authorize: async () => false });
  assert.deepEqual(await handler({ body: { displayName: "A" } }), { status: 403 });
  assert.deepEqual(calls, []);
});

test("server example validates request data before saving", async () => {
  const { handler, calls } = makeHandler();
  assert.deepEqual(await handler({ body: { displayName: 7 } }), { status: 400 });
  assert.deepEqual(calls, []);
});

test("server example saves only validated data for an authorized principal", async () => {
  const { handler, calls } = makeHandler();
  assert.deepEqual(await handler({ body: { displayName: "Ever" } }), { status: 204 });
  assert.deepEqual(calls, [{ id: "user-1", profile: { displayName: "Ever" } }]);
});
