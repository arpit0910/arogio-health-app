# Release readiness - local QA milestone

## 11 November 2026 - live production verification

User deployed the backend. Live verification passed 6 initial smoke, 22 mobile-contract, 9 authenticated-flow and 10 APK46 guest checks. Both approved synthetic QA accounts were cleaned up and soft-deleted. Live content: 284 articles and 6 meditation items; four reviewed care catalogs remain empty. One published video started visually; audible/physical-health/provider acceptance remains open. A release-blocking hosting finding remains: /dist/main.js publicly serves compiled server code. Prepared hosting rules are not installed. See D:/arogio_health_backend/docs/PRODUCTION_VERIFICATION_2026-11-11.md for current evidence and next action. Earlier statements that the backend was not deployed are superseded by this checkpoint.


## Final Build 46 checkpoint

Mobile `npm.cmd run check`: lint, TypeScript and **152 tests passed**. Backend: **108 unit tests, 48 E2E tests and final 11 care/directory regressions passed**. Final phone APK signature/package/manifest/ZIP integrity verified; phone, generated and emulator JavaScript bundles match.

**Ten native checks passed** on a temporary read-only Pixel 3a API34 x86_64 emulator: guest entry after dark/font changes; dedicated hospital/doctor routes; public medicine deep link; guest emergency (no call placed); private-health guest guard; Discover to Calm Zone; practice background pause; public video route; Hindi welcome. Crash buffer clean. Source-reviewed fontScale handling preserves Home and visibly resizes text. Calm Zone href:null redirect removed. Secondary care navigation follows primary results/errors.

Evidence: `.impeccable/review/redesign-native/build46/results.json`, screenshots/XML, and `dist/apk-qa/build46-verification.json`. Running timers can prevent UIAutomator idle snapshots; bounded state polling and direct screenshots were used. This is not TalkBack, audible playback, physical Health Connect, full-device coverage or a latency benchmark. The ad-hoc `15-paused` capture was overwritten after the suite returned to Welcome; use `22-paused-final` for the final pause image.

Historical local APK artifacts and build reports have been removed. Build45 remains superseded. **Production release is not approved**: compatible backend/migrations and real reviewed data are not deployed, secure recovery is not operationally accepted, broader modules remain incomplete, real-device health/audio and full account/permission matrix remain open. No measured 3M simultaneous-user capacity or Play approval is claimed. See [capacity plan](AROGIO_CAPACITY_PLAN.md) and [scope](AROGIO_REDESIGN_SCOPE.md).

Blocking owners/prerequisites: engineering deploys reviewed migrations/API; data and clinical owners approve real bilingual sources; account/security owner enables secure recovery; infrastructure owner supplies staging topology, traffic mix, distributed rate controls, monitoring and load-test budget; release owner supplies production signing/Play policy review; device QA covers real health sources and full native matrix.

The local APK uses a local testing certificate and the configured production API URL. New endpoints require coordinated backend deployment. No production migration, load test, publication or Play submission has been performed. Rollout needs staging migration verification, backups, compatible API rollout before clients, feature gating and monitored staged release. Roll back publication flags or client rollout independently; do not drop schema on a live system as a rollback shortcut.

