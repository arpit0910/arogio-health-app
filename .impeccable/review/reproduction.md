# Authentication reproduction evidence

## Pinned authority

- Local reference: `C:/Users/arpit/Downloads/Container_align.png` and `C:/Users/arpit/Downloads/Container_align.svg`.
- [Figma source](https://www.figma.com/design/HiE5MnlxledF8gAsJfy3kK): welcome `119:68667`, signup `119:68809`, login `119:68936`.
- Original source SVG assets are retained in `assets/auth/` and serialized in `src/features/auth/assets/authAssets.ts`. Font families are Inter, Plus Jakarta Sans, and DM Sans.
- The reproduction uses a 326 by 678 content canvas, excluding the source frame's mock 36-unit status bar. Native safe areas and Android system chrome remain native. Canvas width is capped at 420dp.

## Implementation and correction disposition

Source: `AuthCanvas.tsx`, `WelcomeScreen.tsx`, `AuthBrand.tsx`, `AuthScreen.tsx`, `AuthPrimitives.tsx`, `SignupForm.tsx`, `LoginForm.tsx`, and `AuthField.tsx` under `src/features/auth/components/`; shared `Button.tsx` and `TouchTarget.tsx` under `src/components/ui/`.

The previously omitted welcome screen and its original illustration are implemented. Welcome actions now stay grouped below the illustration and pagination on tablets. Shared controls compensate for canvas scaling with `max(44, 48 / scale)` canonical control height; auxiliary targets use `48 / scale`. Native text scaling stays enabled, enlarged headings can wrap, and forms and footers can grow and scroll.

These are source corrections. The captures below predate the last correction; they do not establish final visual acceptance. Reviewer disposition remains correction pending capture and release verification.

## Recorded native evidence

`.impeccable/review/native-before/` retains earlier evidence. `.impeccable/review/native-after/` contains:

- `welcome.png`, `signup.png`, `login.png`: baseline native screens.
- `login-keyboard.png`: keyboard state.
- `signup-validation.png`, `login-validation.png`: validation states.
- `welcome-tablet.png`, `signup-tablet.png`: 800dp tablet configuration.
- `welcome-large-text.png`, `signup-large-text.png`, `signup-large-text-scrolled.png`: font scale 1.3, including scrolled content.

The default emulator is an API 34 S23 approximation, approximately 1080 by 2316 pixels at density 420. It is not a physical Samsung device. These images are development evidence and require recapture after the latest welcome grouping and touch-target changes. No completed final comparison or release sign-off is claimed.

## Functional and release boundaries

The local Nest backend and database work. An isolated real-backend flow passed registration, login, profile, refresh, and logout with Argon2, JWT, and PostgreSQL. Its Google verifier was mocked. Production Google authentication remains unverified. The new public Web client ID is `987857172312-fil8ani3esi0j9gsg095c6tg1utcbm2j.apps.googleusercontent.com`; no client secret belongs in the mobile app.

The default live API currently returns a Node welcome response. The shared-hosting `app.js` startup and `D:/arogio_health_backend/SHARED_HOSTING.md` guide are prepared but not deployed. Official EAS release verification and physical Samsung verification remain pending.

No existing build-phase state file or gate schema was found in `.impeccable/` during this documentation pass. This record does not create or infer phase completion. Lint and typecheck status must be reported from the final implementation checks by the coordinating agent; this documentation pass does not claim those checks ran.

