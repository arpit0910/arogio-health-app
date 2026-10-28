# Arogio

Arogio is an Expo SDK 58 / React Native mobile health application. Current implementation work covers authentication, three-step profile setup, Home, Profile, account editors, settings and navigation, with Android as the active native verification target. Health management and daily wellness have equal priority. Medicine reminders, health records and daily tracking are presented as coming soon, not working capabilities.

The user approved a full redesign under the Growing Well direction while retaining the Arogio name and original logo. Warm neutral surfaces, forest-green actions, restrained plum accents and crisp sans typography support clear tasks, grouped information and progressive disclosure. Setup asks for goals, essential basics and activity; optional data and consent preferences live in settings. Profile offers one personal Edit profile action and a separate Goals & preferences destination. New users start with updates opt-in false; stored consent for existing users is preserved.

Account forms must remain usable with the native keyboard and enlarged system text. Loading, invalid inputs, authentication errors, password visibility, consent, and route switching need visible, accessible behavior. Native touch areas must remain at least 48dp after canvas scaling.

Local backend verification has exercised registration, login, profile, refresh, and logout against Argon2, JWT, and PostgreSQL. Google verification in that isolated flow was mocked; it is not evidence of working production Google OAuth. The configured live API currently returns a default Node welcome response. Shared-hosting startup and deployment instructions are prepared in `D:/arogio_health_backend/SHARED_HOSTING.md`, but deployment remains pending.

Release readiness requires a working deployed API, actual Google identity verification, an official EAS release artifact, final corrected native captures, and physical Samsung verification. Recovery delivery and legal policy approval also remain pending. No backend capacity or production readiness claim is established.
