# Arogio

Arogio is an Expo SDK 58 / React Native mobile health application. The current implementation work covers the welcome and account flows, with Android as the active native verification target. Broader health tracking and dashboard behavior is outside this reproduction review.

The approved visual direction is the supplied Figma composition and original SVG artwork, not a new identity. The authentication journey starts at welcome, offers account creation and sign-in, and includes Google sign-in entry points, recovery, and legal destinations. Preserve Inter, Plus Jakarta Sans, and DM Sans, a white canvas, deep teal actions, dark text, and the reference illustration.

Account forms must remain usable with the native keyboard and enlarged system text. Loading, invalid inputs, authentication errors, password visibility, consent, and route switching need visible, accessible behavior. Native touch areas must remain at least 48dp after canvas scaling.

Local backend verification has exercised registration, login, profile, refresh, and logout against Argon2, JWT, and PostgreSQL. Google verification in that isolated flow was mocked; it is not evidence of working production Google OAuth. The configured live API currently returns a default Node welcome response. Shared-hosting startup and deployment instructions are prepared in `D:/arogio_health_backend/SHARED_HOSTING.md`, but deployment remains pending.

Release readiness requires a working deployed API, actual Google identity verification, an official EAS release artifact, final corrected native captures, and physical Samsung verification. Recovery delivery and legal policy approval also remain pending. No backend capacity or production readiness claim is established.
