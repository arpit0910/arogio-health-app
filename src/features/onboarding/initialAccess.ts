type InitialAccess = {
  alreadyAsked: () => Promise<boolean>;
  rememberAttempt: () => Promise<void>;
  notifications: () => Promise<unknown>;
  motion: () => Promise<unknown>;
  active: () => boolean;
};

/** Optional dialogs run once, in order; a denial never blocks the next feature. */
export async function requestInitialAccess(access: InitialAccess) {
  if (await access.alreadyAsked() || !access.active()) return;
  await access.rememberAttempt();
  for (const request of [access.notifications, access.motion]) {
    if (!access.active()) return;
    try { await request(); } catch { /* Optional access must not block Home. */ }
  }
}
