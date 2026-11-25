/**
 * Framework-neutral example showing where authorization belongs.
 * The application supplies its own trusted authentication, policy, validation,
 * and persistence functions. Client-side Consoler signals are not consulted.
 */
export function createUpdateProfileHandler({
  authenticate,
  authorize,
  validateProfile,
  saveProfile
}) {
  for (const [name, fn] of Object.entries({
    authenticate,
    authorize,
    validateProfile,
    saveProfile
  })) {
    if (typeof fn !== "function") {
      throw new TypeError(`${name} must be a function.`);
    }
  }

  return async function updateProfile(request) {
    const principal = await authenticate(request);
    if (!principal) return { status: 401 };

    const allowed = await authorize(principal, "profile:update");
    if (!allowed) return { status: 403 };

    let profile;
    try {
      profile = validateProfile(request.body);
    } catch {
      return { status: 400 };
    }

    await saveProfile(principal.id, profile);
    return { status: 204 };
  };
}
