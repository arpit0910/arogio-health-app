# Frontend project structure

- `src/app/`: Expo routes; filenames define URLs.
- `src/features/`: [named feature implementations](../src/features/README.md).
- `src/components/`: application components and UI controls.
- `src/configuration/`: runtime environment configuration.
- `src/services/api/`: HTTP transport, query client and shared resource API.
- `src/services/auth/`: persisted session tokens.
- `src/shared/`: shared date/time helpers.
- `src/navigation/`: tabs, sidebar and route guards.
- `src/providers/`: application-level provider composition.
- `src/localization/`: English/Hindi translation infrastructure and dictionaries.
- `src/theme/`: light-mode tokens and appearance provider.
- `modules/health-source-apps/`: native health-source integration.
- `assets/`: runtime artwork and fonts.
- `plugins/`: Expo configuration plugins.
- `scripts/`: development and reproducible previews.
- `test/`: behavior tests.

Feature names now expand authentication, care directory, health connections, home dashboard, app launch, account onboarding, personal wellness and Jeeva assistant. Articles, blood banks and emergency each have a distinct feature folder. API routes, UI behavior and native identifiers retain their identities. The backend owns database names; see its `database/TABLES.md` catalog.
