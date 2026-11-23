# Arogio 2.0 baseline audit -> 10 November 2026

Source: supplied AROGIO 2.0 brief; requirements are product inputs, not evidence of existing features. Baseline is the current working tree including build 44, not a clean checkout. Preserve the uncommitted Calm Zone/tracking work.

## Confirmed architecture
Expo SDK 58.0.19 / React Native 0.88 / React 19.3, Expo Router, TanStack Query, Zod and themed StyleSheet primitives. NativeWind/Reusables are not installed; retain working primitives rather than replace state/navigation infrastructure for styling. NestJS 11, Drizzle/PostgreSQL, audited super-admin portal; no Laravel backend. No hospital/doctor/medicine-education models, routes, source workbooks or provider affiliations found. Existing import is an articles workbook only. No fake provider seed is authorized.

## Route inventory
- `(account)/_layout.tsx`
- `(account)/activity.tsx`
- `(account)/app-access.tsx`
- `(account)/articles/[id].tsx`
- `(account)/articles/index.tsx`
- `(account)/blood-banks.tsx`
- `(account)/connected-health-settings.tsx`
- `(account)/connected-health.tsx`
- `(account)/cycle.tsx`
- `(account)/delete-account.tsx`
- `(account)/edit-health-goals.tsx`
- `(account)/edit-profile.tsx`
- `(account)/emergency.tsx`
- `(account)/feature.tsx`
- `(account)/medicines.tsx`
- `(account)/meditation-video.tsx`
- `(account)/notification-settings.tsx`
- `(account)/notifications.tsx`
- `(account)/profile.tsx`
- `(account)/settings.tsx`
- `(account)/water.tsx`
- `(main)/_layout.tsx`
- `(main)/explore.tsx`
- `(main)/health.tsx`
- `(main)/home.tsx`
- `(main)/jeeva.tsx`
- `(main)/meditation.tsx`
- `_layout.tsx`
- `forgot-password.tsx`
- `index.tsx`
- `invite/[code].tsx`
- `login.tsx`
- `privacy.tsx`
- `setup-profile.tsx`
- `signup.tsx`
- `terms.tsx`

## Feature matrix
| Module | Baseline | Required work |
|---|---|---|
| Auth/session/profile | Implemented, refresh/persistence/Google/reset UI | Preserve tokens; inspect expiry/offline; delivery/provider configuration remains external |
| Home/navigation | Five tabs but no Find Care; guest blocked | Care-first Home, five revised tabs, public emergency/directory routes |
| Emergency | Dialer 112/108 and blood-bank links, account guarded | Public access, verified source link, no dispatch claim |
| Blood banks | API/import/admin, list/nearby/directions | Public guest reads, provenance/freshness, never imply live stock |
| Articles | Published API/import/detail/categories/pagination | Public guest reads; do not invent clinical-review state |
| Hospitals/doctors | Frontend and backend absent | Sourced publication pipeline, list/detail/search/affiliations/corrections |
| Medicine education | Frontend/backend absent; personal reminders exist | Separate source/review-gated catalog; no dosage generation |
| Activity/Health Connect | Implemented; recovery improvements in build 44 | Preserve source precedence, grants, timestamp/missing-data semantics |
| Water/medicines/cycle | Saved plans/logs/notifications | Preserve private guards, scheduling and account isolation |
| Calm Zone | Offline exercises/audio, published videos | Preserve media lifecycle and explicit network states |
| Jeeva | Authenticated AI, opt-in saved context, urgent/drug guards | Preserve safety and privacy; no unsourced medical provenance claims |
| Records/family/booking/labs/remedies/quizzes | Absent | Gate behind real backend/security/content readiness; not release-ready |

## Findings and prioritized tickets
P0: account guard currently blocks emergency/articles/blood banks. Public directory backend also requires JWT. Fix together; keep wellness private. P0: no new care data supplied; ship empty states and admin review pipeline, not dummy providers. P0: hospital/doctor ids and many-to-many affiliations need explicit stable schema. P0: existing bank is_verified lacks source/review timestamp; never transfer that flag into new verified-provider pipeline.
P1: typography uses Inter despite revised brief; bundled Jakarta/DM available. Preserve original logo bytes/proportions, change token roles. P1: onboarding currently requests notification/motion automatically after 700ms; remove unsolicited permission sequence and retain explicit settings/action requests. P1: release manifest allows backup, overlay and cleartext; fix through a production config plugin while preserving explicit local-development network opt-in. Predictive Back disabled: requires native Back regression acceptance before changing.
P1: HTTP client does not pre-abort an already cancelled signal. Public request cache must never carry private account data. Server has bounded DB pool and throttling; 3-million-user capacity is unmeasured.

## Evidence and known unknowns
Build 44 package/signature/ABI/bundle/audio integrity was verified historically; its build report has been removed. Prior actual source composition captures: .impeccable/review/launch-refresh/{phone,small,tablet}.png; .impeccable/review/ui-system/{calm-phone,calm-small-hi,welcome,welcome-small-hi}.png. Those are RN Web, not native acceptance. adb initially had no devices; existing Pixel_3a_API_34 read-only emulator startup attempted, outcome recorded below when known. No claim that every tap, native permission or screen-reader flow was exercised.

## Risk register
- No approved Jaipur hospital/doctor/medicine source dataset: publication blocker, not license to fabricate.
- Clinical/legal review, Play declarations, production deployment/signing and real Google OAuth acceptance remain external release gates.
- Native health sync requires real phone/wearable records; emulator cannot prove it.
- Protected health documents/family access require encrypted storage, consent/proxy authorization and security review; do not expose unfinished upload/sharing routes.
- Capacity target is confirmed as three million simultaneous users. Actual workload, infrastructure and achieved capacity remain unmeasured; isolate staging load from production.

Audit proceeds to implementation automatically. All claims in final readiness notes must distinguish source tests, synthetic previews and native/device evidence.

## Phase outcomes -> implementation checkpoint, 10 November

- Phase0: baseline route/module audit and build44 evidence recorded; read-only emulator booted, signature conflict prevents accepted native baseline comparison. Existing user Calm Zone/tracking work preserved.
- Phase1: shared warm-light teal/emerald dark, Jakarta/DM aliases and navigation tokens implemented. November master brief supersedes October direction; exact logo retained. Static review images at .impeccable/review/ui-system/redesign-*.png; reviewer accepted the two-fix scope after two fixes.
- Phase2: five revised tabs, guest entry and three-panel bilingual welcome; automatic permission prompt removed. Auth/private guards retained. Full native launch/deep-link/Back acceptance remains pending.
- Phase3: care schema/API/admin/list/detail/search, affiliations, corrections and public reads prepared. Migrations0014-0016 not applied. Source data absent, catalogs intentionally empty; 180-day source review and edit/import invalidation protect publication. Medicine content still awaits approved source/clinical review.
- Phase4: existing trackers/content/AI inherit shared tokens with source/private guards preserved; partial profile/wellness export explicitly excludes chat/device data and limits water to90days. Not every screen/device interaction has been accepted.
- Phase5: uploads/family/appointments/teleconsultation/remedies/quizzes remain gated false; no invented backend/content or service availability. See complete missing-module matrix in release-readiness.
- Phase6: frontend lint/typecheck150tests, backend108unit and earlier47E2E passed; targeted6care passed. Final care/directory regressions passed11tests/2suites; native acceptance remains pending. Build45 ARM APK/signature/manifest verified. Load plan prepared but not run; no Play, production or three-million-user capacity certification.

Handoff: docs/arogio-information-architecture.md, docs/design-system.md, docs/arogio-release-readiness.md and docs/arogio-redesign-changelog.md describe actual scope, exact new contracts, deployment order, remaining gates and evidence limits.

### Final source and native checkpoint

Review accepted the two-fix source scope. Backend care/directory regression passed 11 tests in two suites; frontend150 and backend108 unit tests passed, alongside earlier47 full E2E. x86 validation build45 installed and launched in a verified temporary read-only emulator; captures and full interaction acceptance remain pending. LaunchSequence now proceeds after branded layout without waiting for auth-network restoration, and EntryRoute exposes Emergency during saved-session loading. Earlier launch documentation saying it waits for auth is superseded. Lint/typecheck and a final build45 rebuild incorporating this late JavaScript change were pending at this checkpoint; the previously verified ARM artifact predates that tiny fix. The explicit bank-review admin route/script is prepared; edits/imports clear review.

## Current superseding checkpoint - Build 46 pending

The user confirmed **three million simultaneous users** as the capacity target. This is not a capacity result. [AROGIO_CAPACITY_PLAN.md](AROGIO_CAPACITY_PLAN.md) documents arithmetic scenarios, workload assumptions, infrastructure/security requirements and phased isolated-staging acceptance. The backend k6 script is an unrun 10-50 virtual-user smoke plan, not a million-session test. No production load is authorized.

Latest backend evidence: **108 unit tests, 48 full E2E tests and 11 final care/directory regression tests passed**. Mobile lint/typecheck and **152 tests passed**, including the wrong-kind detail regression. Earlier counts above are historical checkpoints.

**Build 45 is stop-ship:** Android theme/font recreation exposed an unbound shared imperative router crash. Components were migrated to contextual `useRouter`; source review found no stop-ship regression in that migration. A wrong-kind detail blank state found during review was also fixed. These source fixes do not establish native recovery acceptance. **Build 46 is compiling; final native build/install/launch and theme/font recreation acceptance remain pending.** Earlier Build 45 signature, manifest and initial emulator launch evidence cannot override this crash or certify the latest source artifact.

Dedicated public `/hospitals` and `/hospitals/:id`, `/doctors` and `/doctors/:id`, `/medicine-library` and `/medicine-library/:id` routes now coexist with legacy `/care/:id`. The public guard also allows `/meditation-video`; private wellness/AI/account data remain guarded. Medicine-library education remains separate from personal `/medicines` reminders. Wrong-kind detail access has an explicit handled state. Removed blood-group stock-like filters and unavailable password-reset CTA; neither live stock nor functioning recovery delivery is implied.

Approved source data and clinical review, deployed compatible backend/migrations, measured simultaneous-user capacity, security/recovery acceptance, physical-device health/notification/navigation testing and Play/legal/privacy declarations remain release gates. Do not treat review approval or local automated tests as evidence these gates passed.

## Final Build 46 checkpoint

Mobile `npm.cmd run check`: lint, TypeScript and **152 tests passed**. Backend: **108 unit tests, 48 E2E tests and final 11 care/directory regressions passed**. Final phone APK signature/package/manifest/ZIP integrity verified; phone, generated and emulator JavaScript bundles match.

**Ten native checks passed** on a temporary read-only Pixel 3a API34 x86_64 emulator: guest entry after dark/font changes; dedicated hospital/doctor routes; public medicine deep link; guest emergency (no call placed); private-health guest guard; Discover to Calm Zone; practice background pause; public video route; Hindi welcome. Crash buffer clean. Source-reviewed fontScale handling preserves Home and visibly resizes text. Calm Zone href:null redirect removed. Secondary care navigation follows primary results/errors.

Evidence: `.impeccable/review/redesign-native/build46/results.json`, screenshots/XML, and `dist/apk-qa/build46-verification.json`. Running timers can prevent UIAutomator idle snapshots; bounded state polling and direct screenshots were used. This is not TalkBack, audible playback, physical Health Connect, full-device coverage or a latency benchmark. The ad-hoc `15-paused` capture was overwritten after the suite returned to Welcome; use `22-paused-final` for the final pause image.

Historical local APK artifacts and build reports have been removed. Build45 remains superseded. **Production release is not approved**: compatible backend/migrations and real reviewed data are not deployed, secure recovery is not operationally accepted, broader modules remain incomplete, real-device health/audio and full account/permission matrix remain open. No measured 3M simultaneous-user capacity or Play approval is claimed. See [capacity plan](AROGIO_CAPACITY_PLAN.md) and [scope](AROGIO_REDESIGN_SCOPE.md).
