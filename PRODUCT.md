# Arogio

Arogio is an Expo SDK 58 / React Native mobile health application. Current implementation work covers authentication, profile setup, Home, Profile, account editors, settings, navigation and daily care, with Android as the active native verification target. Health management and daily wellness have equal priority. Water logs and plans, cycle check-ins, medicines and dose reminders, and daily activity totals and targets have implemented flows. General health-record management remains outside that daily-care scope. Arogio tracking requires no external health app: supported phones can count foreground steps, and users can enter totals directly. Health Connect and connected-app readings are optional, separate sources. See `docs/standalone-tracking.md` for behavior and verification limits.

The user pinned the 29 October 2026 Home screenshot as the visual direction for Home and the whole app: deep emerald, mint actions, rounded tonal activity/care cards, pastel shortcuts and wellness imagery. The Arogio name and original logo remain. The light counterpart uses mint-white surfaces. Dark is the new-install default; saved theme preferences are preserved. Three required profile steps are followed by a separate once-per-account access setup. One explicit setup action runs notifications, supported motion, city location and an optional selected health source through their individual OS dialogs. Skipping or declining optional access does not block the journal. Tracker saves check permission without requesting it again; access management is centralized in Settings.

Connected health reads refresh every 30 seconds while active and on resume, and wellness records every 60 seconds; pull-to-refresh is available. Source apps and Android control when new readings become available. Supported phone step counting is foreground-only. Local weather uses the profile city through a server-side OpenWeather integration and needs a configured provider key; no sample temperature is displayed as real data. Admin-published banners can replace the built-in illustrated Home banner.

A separate backend-served super-admin browser portal at `/admin` manages server-stored people, profiles, tracking records, referrals/usage analytics, banners and audited actions. It is not part of the mobile app. The first dedicated administrator is created by an explicit environment-configured seeder; credentials are never hardcoded. Device-only connected readings and phone sensor history are not uploaded or exposed in that portal. See `D:/arogio_health_backend/SUPER_ADMIN.md`.

Account forms must remain usable with the native keyboard and enlarged system text. Loading, invalid inputs, authentication errors, password visibility, consent, and route switching need visible, accessible behavior. Native touch areas must remain at least 48dp after canvas scaling.

Local backend verification has exercised registration, login, profile, refresh, and logout against Argon2, JWT, and PostgreSQL. Google verification in that isolated flow was mocked; it is not evidence of working production Google OAuth. The configured live API currently returns a default Node welcome response. Shared-hosting startup and deployment instructions are prepared in `D:/arogio_health_backend/SHARED_HOSTING.md`, but deployment remains pending.

Release readiness requires a working deployed API, actual Google identity verification, an official EAS release artifact, final corrected native captures, and physical Samsung verification. Recovery delivery and legal policy approval also remain pending. No backend capacity or production readiness claim is established.

## Approved November 2026 brief

The November master brief supersedes the October Home visual direction: warm-light teal and emerald dark, Plus Jakarta Sans headings and DM Sans body, preserving the exact original logo. Appearance now defaults to system with saved preferences preserved. Home, Find Care, My Health, Discover and Jeeva AI are the five tabs; legacy meditation remains routed. Guest emergency/care/content reads coexist with private wellness and AI. Three-panel welcome offers English/Hindi without automated permission prompts. Layout adapts to bottom tabs or a left rail and preserves explicit native permissions, dialer and external directions.

Prepared source/API/admin work does not imply deployed services, approved catalog content, full native acceptance, clinical/legal approval or measured capacity. No new provider/medicine dataset was supplied. Readiness and unimplemented modules are tracked in docs/arogio-release-readiness.md. Earlier dark-default and pinned October-direction descriptions above are historical context.

## 14 November 2026 Stitch implementation

The supplied Stitch designs supersede the earlier Home composition and tab order. Current tabs are Home, Find Care, centre Jeeva AI, My Health and private Profile; Discover and Calm Zone remain routed. The shared palette uses emerald and soft mint in light mode and forest surfaces in dark mode. Personal medicine schedules now support server-confirmed dose logs, undo and 15-minute snooze for due doses with enabled reminders and existing notification access. Snoozes stay within the same IST day. Older backends without dose records keep reminder management available without advertising logging support.

This is implemented source, not completed deployment or native acceptance. See [the follow-up audit](docs/stitch-revamp-audit.md) for rollout order, verification and outstanding work.

## Homepage replication follow-up, 14 November 2026

The supplied Stitch homepage screenshot and companion HTML now govern the Home composition and shared header, typography and navigation treatment; see `docs/homepage-replication.md` and `.impeccable/references/homepage-stitch-2026-11-14.png`. The exact original logo is preserved. Current visible tabs are Home, Find Care, Jeeva AI, Health and Profile, with Jeeva in the centre and Profile private; earlier tab labels above are historical. Appearance defaults to system and preserves saved choices.

Home combines sourced care discovery with actual saved/synced daily values, hydration and medicine actions. Missing readings stay missing and provider media slots use category icons until authenticated media is supplied. Search submits to Find Care; voice input is not implemented. No placeholder stock, appointment, clinical triage or government affiliation claim is established. Android emulator screenshots are review evidence only; synthetic populated QA data is not production content, and neither physical-device acceptance nor iOS verification is established.

## Uploaded Homepage direction, 14 November 2026

The user explicitly replaced the former app UI/UX with the uploaded Homepage.png and Homepage.svg. These files now govern Home and the shared visual system across authentication, care, Health, Profile, settings, trackers and Jeeva. Existing functional behavior, language support, permissions and data semantics remain product requirements. The visual reference does not supply live provider availability, personal health values, government affiliation, appointments or clinical triage capabilities. See docs/homepage-upload-redesign.md for source changes and verification.

## Latest Login and appearance instruction

The new Login.svg / Login.png supersede the previous Login layout. The user requests fidelity to all uploaded page references and explicitly requires light mode only. Appearance no longer follows device night mode or saved dark/system preferences; the mode selector is removed. This supersedes historical theme descriptions above. The existing mobile/email field design does not add a mobile-password authentication endpoint; the current backend contract accepts email.
