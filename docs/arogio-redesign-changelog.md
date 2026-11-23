# Redesign change log -> 10 November 2026

## Implemented in source

- Replaced shared visual aliases with approved warm-light teal / emerald dark, Jakarta headings and DM Sans body; exact original logo retained.
- Added Find Care to five tabs: Home, Find Care, My Health, Discover, Jeeva AI; preserved legacy meditation route. Three welcome panels and English/Hindi; removed automatic welcome permission request.
- Enabled guest Home, emergency, articles, banks, care and Calm Zone read paths while retaining private wellness/AI guards.
- Added care list/detail, exact-string provider/article/bank search, explicit call/external directions, sharing/corrections, source-reviewed publication model, stable doctor/hospital affiliations and admin review forms/API.
- Added blood-bank provenance and correction workflow; drafts hidden until explicit review; edits/imports invalidate review; 180-day freshness enforcement.
- Added private retained-wellness/profile export with honest 90-day water scope, excluding device readings/chat.
- Hardened release config: backup/cleartext disabled, overlay/record-audio removed; explicit local QA network opt-in. Kept predictiveBack=false pending acceptance. Stripped query strings from request logs and prevented pre-cancelled requests from being sent.
- Added readiness flags and staging-only load plan. Prepared backend migrations0014-0016; did not apply or deploy them. Existing authenticated directory paths remain compatible.

## Verification and limits

Frontend lint/typecheck/150 tests and backend108 unit tests passed. Full47 E2E passed before later bank/export regressions; targeted6 care tests passed. Final care/directory regression: 11 tests across two suites passed. An outdated Jeeva mock was aligned with the existing safety classification/review API; product safety guards were retained.

Build45 local ARM APK succeeded with signature and aapt version/ABI/manifest checks; x86 validation installed and launched. Read-only emulator booted, but baseline44 signature conflict prevented accepted baseline comparison. Static review images show composition; two correctness fixes were applied with reviewer accepted the two-fix scope. No full native acceptance, Play readiness, deployment or capacity result is claimed.

## Missing and blocking release

Approved hospital/doctor/medicine datasets, qualified content/clinical review and actual backend deployment remain absent; catalogs intentionally empty. Record uploads, family profiles, bookings, teleconsultation, remedies and clinical quizzes remain false readiness flags. Symptom/first-aid reviewed content, lab/pharmacy datasets, typo tolerance, full offline/emergency contact coverage and genuine live integrations remain incomplete. Existing wellness/AI/native behavior needs the device acceptance matrix. Legal/privacy/Play approvals, production signing/OAuth/recovery, staging load/observability/restore/rollout acceptance remain external gates. See [release readiness](arogio-release-readiness.md) for the complete matrix and deployment order. This source implementation does not satisfy full Arogio2.0 completion.

### Final source and native checkpoint

Review accepted the two-fix source scope. Backend care/directory regression passed 11 tests in two suites; frontend150 and backend108 unit tests passed, alongside earlier47 full E2E. x86 validation build45 installed and launched in a verified temporary read-only emulator; captures and full interaction acceptance remain pending. LaunchSequence now proceeds after branded layout without waiting for auth-network restoration, and EntryRoute exposes Emergency during saved-session loading. Earlier launch documentation saying it waits for auth is superseded. Lint/typecheck and a final build45 rebuild incorporating this late JavaScript change were pending at this checkpoint; the previously verified ARM artifact predates that tiny fix. The explicit bank-review admin route/script is prepared; edits/imports clear review.

## Current superseding checkpoint - Build 46 pending

The user confirmed **three million simultaneous users** as the capacity target. This is not a capacity result. [AROGIO_CAPACITY_PLAN.md](AROGIO_CAPACITY_PLAN.md) documents arithmetic scenarios, workload assumptions, infrastructure/security requirements and phased isolated-staging acceptance. The backend k6 script is an unrun 10-50 virtual-user smoke plan, not a million-session test. No production load is authorized.

Latest backend evidence: **108 unit tests, 48 full E2E tests and 11 final care/directory regression tests passed**. Mobile lint/typecheck and **152 tests passed**, including the wrong-kind detail regression. Earlier counts above are historical checkpoints.

**Build 45 is stop-ship:** Android theme/font recreation exposed an unbound shared imperative router crash. Components were migrated to contextual `useRouter`; source review found no stop-ship regression in that migration. A wrong-kind detail blank state found during review was also fixed. These source fixes do not establish native recovery acceptance. **Build 46 is compiling; final native build/install/launch and theme/font recreation acceptance remain pending.** Earlier Build 45 signature, manifest and initial emulator launch evidence cannot override this crash or certify the latest source artifact.

Dedicated public `/hospitals` and `/hospitals/:id`, `/doctors` and `/doctors/:id`, `/medicine-library` and `/medicine-library/:id` routes now coexist with legacy `/care/:id`. The public guard also allows `/meditation-video`; private wellness/AI/account data remain guarded. Medicine-library education remains separate from personal `/medicines` reminders. Wrong-kind detail access has an explicit handled state. Removed blood-group stock-like filters and unavailable password-reset CTA; neither live stock nor functioning recovery delivery is implied.

Approved source data and clinical review, deployed compatible backend/migrations, measured simultaneous-user capacity, security/recovery acceptance, physical-device health/notification/navigation testing and Play/legal/privacy declarations remain release gates. Do not treat review approval or local automated tests as evidence these gates passed.

Final source checkpoint: mobile lint/typecheck and 152 tests passed. Font-scale changes preserve Home and visibly rescale text in native testing. Calm Zone hidden-route redirect fixed by retaining the route and omitting it only from the custom tab bar. Care results/errors now precede secondary navigation. Final rebuilt-package native sweep pending.

## Final Build 46 checkpoint

Mobile `npm.cmd run check`: lint, TypeScript and **152 tests passed**. Backend: **108 unit tests, 48 E2E tests and final 11 care/directory regressions passed**. Final phone APK signature/package/manifest/ZIP integrity verified; phone, generated and emulator JavaScript bundles match.

**Ten native checks passed** on a temporary read-only Pixel 3a API34 x86_64 emulator: guest entry after dark/font changes; dedicated hospital/doctor routes; public medicine deep link; guest emergency (no call placed); private-health guest guard; Discover to Calm Zone; practice background pause; public video route; Hindi welcome. Crash buffer clean. Source-reviewed fontScale handling preserves Home and visibly resizes text. Calm Zone href:null redirect removed. Secondary care navigation follows primary results/errors.

Evidence: `.impeccable/review/redesign-native/build46/results.json`, screenshots/XML, and `dist/apk-qa/build46-verification.json`. Running timers can prevent UIAutomator idle snapshots; bounded state polling and direct screenshots were used. This is not TalkBack, audible playback, physical Health Connect, full-device coverage or a latency benchmark. The ad-hoc `15-paused` capture was overwritten after the suite returned to Welcome; use `22-paused-final` for the final pause image.

Historical local APK artifacts and build reports have been removed. Build45 remains superseded. **Production release is not approved**: compatible backend/migrations and real reviewed data are not deployed, secure recovery is not operationally accepted, broader modules remain incomplete, real-device health/audio and full account/permission matrix remain open. No measured 3M simultaneous-user capacity or Play approval is claimed. See [capacity plan](AROGIO_CAPACITY_PLAN.md) and [scope](AROGIO_REDESIGN_SCOPE.md).
