# Profile setup implementation

Visual source: user-supplied `Body.svg` and `Body.png`, 2026-10-26. The source SVG paths for both illustrations, backgrounds and icons are preserved in `src/features/profile/assets/profileAssets.ts`. No generated artwork or new visual direction was introduced.

`src/app/setup-profile.tsx` is the authenticated setup route. The home route sends signed-in users without `profileCompletedAt` to setup, including users returning through login or Google sign-in. Completed users continue to the existing dashboard. Signed-out setup links return to signup.

The eight screens are intro, personal details, lifestyle, goals, additional details, preferences, review and completion. Data starts empty rather than pre-filling the example person's details. Continue saves progress through `PATCH /users/me/setup`. Review edits return directly to review. Final confirmation persists completion before showing the final screen. Failed saves keep the current screen and inputs with a retryable error. Back actions preserve the current in-memory draft; reopening resumes the last saved step.

Completion displays the success illustration and message without an action button, then replaces the setup route with `/home` after 1.5 seconds. Leaving the screen clears the redirect timer. The welcome screen uses a single illustration without pagination dots.

Shared primitives: `AuthCanvas`, `Button`, `TouchTarget`, `FormError`, existing theme fonts/colors; profile fields, progress, choice rows, unit selectors and selection dialogs live outside route files. Existing authentication styling and the incumbent design-system documents are preserved. Unit changes convert the entered value. Default system font scaling stays enabled, with canvas-aware control hit targets.

Location and referral choices were not supplied as a catalog; their selectors accept free text. Notification controls persist preferences only; notification delivery is separate.

Backend migration and API details: `D:/arogio_health_backend/PROFILE_SETUP.md`. Apply the migration and deploy the matching backend before using this app build against the hosted API.

Verification: app lint/typecheck and 30 tests pass; backend build/lint, 34 unit/integration tests and 9 HTTP tests pass; migration consistency check passes. Original extracted SVGs were XML-validated. Mechanical design detection reported advisory palette differences for reference-specific mint and progress tones. No native or browser render capture was obtained: app-control approval timed out. The visual review disposition is `recapture`; matching all eight rendered screens to Body.png remains open. This is not a pixel-fidelity or device-verification claim.
