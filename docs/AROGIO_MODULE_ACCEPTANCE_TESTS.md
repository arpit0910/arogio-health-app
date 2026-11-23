# Module acceptance ledger

| Scope | Actual evidence | Still required |
|---|---|---|
| Frontend | lint/typecheck and 152 tests passed after context-router migration | Broader device/account acceptance |
| Backend | 108 unit tests; 48 E2E; final 11 care/directory regressions passed | Staging database migration and production integration |
| Catalog safety | Draft invisibility, source review, stale update rejection, malformed phone and review invalidation regressions | Approved real records and domain owner review |
| Guest/private | Public-route guard, cancelled search and restoration emergency tests | Full expiry/delete/re-register/account-switch native matrix |
| Native build 45 | Guest tabs, emergency, Hindi/dark/1.3 welcome inspected | Superseded; build46 fixes validated in ten-check native suite |
| Sync/activity | Unit regression for partial failures, source loss, permissions, recorded-day semantics | Physical Health Connect/watch/step integration |
| Calm | Built-in catalog, sound lifecycle and bounded retry checks | Physical audible playback, video network behavior |
| Accessibility | Static targets and layout inspection | TalkBack, large-screen/API26 and reduced-motion end-to-end |
| Capacity | Small staging-only k6 script prepared; not run | Distributed load test against approved staging topology |

No completed test suite substitutes for the missing integration acceptance. Native screenshots: .impeccable/review/redesign-native; final-home.png from build 45 is the crash launcher and is explicitly invalid as app proof.

Final source checkpoint: mobile lint/typecheck and 152 tests passed. Font-scale changes preserve Home and visibly rescale text in native testing. Calm Zone hidden-route redirect fixed by retaining the route and omitting it only from the custom tab bar. Care results/errors now precede secondary navigation. Final rebuilt-package native sweep pending.

## Final Build 46 checkpoint

Mobile `npm.cmd run check`: lint, TypeScript and **152 tests passed**. Backend: **108 unit tests, 48 E2E tests and final 11 care/directory regressions passed**. Final phone APK signature/package/manifest/ZIP integrity verified; phone, generated and emulator JavaScript bundles match.

**Ten native checks passed** on a temporary read-only Pixel 3a API34 x86_64 emulator: guest entry after dark/font changes; dedicated hospital/doctor routes; public medicine deep link; guest emergency (no call placed); private-health guest guard; Discover to Calm Zone; practice background pause; public video route; Hindi welcome. Crash buffer clean. Source-reviewed fontScale handling preserves Home and visibly resizes text. Calm Zone href:null redirect removed. Secondary care navigation follows primary results/errors.

Evidence: `.impeccable/review/redesign-native/build46/results.json`, screenshots/XML, and `dist/apk-qa/build46-verification.json`. Running timers can prevent UIAutomator idle snapshots; bounded state polling and direct screenshots were used. This is not TalkBack, audible playback, physical Health Connect, full-device coverage or a latency benchmark. The ad-hoc `15-paused` capture was overwritten after the suite returned to Welcome; use `22-paused-final` for the final pause image.

Historical local APK artifacts and build reports have been removed. Build45 remains superseded. **Production release is not approved**: compatible backend/migrations and real reviewed data are not deployed, secure recovery is not operationally accepted, broader modules remain incomplete, real-device health/audio and full account/permission matrix remain open. No measured 3M simultaneous-user capacity or Play approval is claimed. See [capacity plan](AROGIO_CAPACITY_PLAN.md) and [scope](AROGIO_REDESIGN_SCOPE.md).
