import type { SafeUser } from '../auth/types.ts';

// Deferring setup grants app access without inventing a completed health profile.
export function canEnterApp(user: Pick<SafeUser, 'profileCompletedAt' | 'profileSetup'> | null | undefined) {
  return Boolean(user && (user.profileCompletedAt || user.profileSetup?.setupDeferred === true));
}
