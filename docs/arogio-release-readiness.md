# Release readiness - 10 November 2026

## 11 November 2026 - live production verification

User deployed the backend. Live verification passed 6 initial smoke, 22 mobile-contract, 9 authenticated-flow and 10 APK46 guest checks. Both approved synthetic QA accounts were cleaned up and soft-deleted. Live content: 284 articles and 6 meditation items; four reviewed care catalogs remain empty. One published video started visually; audible/physical-health/provider acceptance remains open. A release-blocking hosting finding remains: /dist/main.js publicly serves compiled server code. Prepared hosting rules are not installed. See D:/arogio_health_backend/docs/PRODUCTION_VERIFICATION_2026-11-11.md for current evidence and next action. Earlier statements that the backend was not deployed are superseded by this checkpoint.


## Final Build 46 checkpoint

Mobile `npm.cmd run check`: lint, TypeScript and **152 tests passed**. Backend: **108 unit tests, 48 E2E tests and final 11 care/directory regressions passed**. Final phone APK signature/package/manifest/ZIP integrity verified; phone, generated and emulator JavaScript bundles match.

**Ten native checks passed** on a temporary read-only Pixel 3a API34 x86_64 emulator: guest entry after dark/font changes; dedicated hospital/doctor routes; public medicine deep link; guest emergency (no call placed); private-health guest guard; Discover to Calm Zone; practice background pause; public video route; Hindi welcome. Crash buffer clean. Source-reviewed fontScale handling preserves Home and visibly resizes text. Calm Zone href:null redirect removed. Secondary care navigation follows primary results/errors.

Evidence: `.impeccable/review/redesign-native/build46/results.json`, screenshots/XML, and `dist/apk-qa/build46-verification.json`. Running timers can prevent UIAutomator idle snapshots; bounded state polling and direct screenshots were used. This is not TalkBack, audible playback, physical Health Connect, full-device coverage or a latency benchmark. The ad-hoc `15-paused` capture was overwritten after the suite returned to Welcome; use `22-paused-final` for the final pause image.

Historical local APK artifacts and build reports have been removed. Build45 remains superseded. **Production release is not approved**: compatible backend/migrations and real reviewed data are not deployed, secure recovery is not operationally accepted, broader modules remain incomplete, real-device health/audio and full account/permission matrix remain open. No measured 3M simultaneous-user capacity or Play approval is claimed. See [capacity plan](AROGIO_CAPACITY_PLAN.md) and [scope](AROGIO_REDESIGN_SCOPE.md).

## Scope and missing-module matrix

| Brief area | Implemented/prepared | Remaining release gate |
|---|---|---|
| Hospitals/doctors | UI/API/schema/admin/source review and stable many-to-many affiliations | Approved real Jaipur dataset, migration/deployment, published reviewed records |
| Universal search | Providers/articles/banks, bounded exact-string search and pagination | Typo tolerance, medicine-wide approved data, recent searches and native acceptance |
| Blood banks | Public read, provenance/review, correction queue, call/directions | Audited current sources, staged import/re-review and actual device nearby checks; no live stock |
| Emergency | Public 112 and sourced Rajasthan 108 explicit dialer actions | Qualified first-aid approval, saved emergency-contact/cached offline acceptance |
| Medicine education | Separate catalog kind and review-gated UI/API | Approved medicine source/review content; no fabricated seeds or prescribing |
| Records/family | Readiness flags false | Encrypted uploads, quotas/scanning, fine-grained proxy authorization, retention/audits and security approval |
| Symptoms/first aid | Existing AI safeguards retained | Versioned clinically approved question-led guide and content |
| Labs/pharmacies | Care kinds/schema available | Real reviewed catalog, operational integration; no stock/slots claims |
| Wellness/dashboard | Existing tools preserved; shared theme/source semantics | Physical-device sync, notification/timezone/revocation and full regression matrix |
| Remedies/quizzes | Flags false | Approved bilingual content and clinical/editor review |
| Bookings/teleconsultation | Flags false | Genuine provider integration, availability, payment/cancellation and backend state machine |
| Native map | Flag false; external directions work path | Keys/provider integration and device acceptance if added |

`src/config/readiness.ts`: only careDirectoryUi=true; healthRecordUploads, familyProfiles, appointments, teleconsultation, traditionalRemedies, clinicalQuizzes and nativeMap=false. A true UI flag does not mean approved content exists. Drafts remain hidden until explicit audited review, and edits/imports require re-review. Source reviews expire at 180 days; qualifications entered in review are not independent clinical credential validation.

## API contract and compatibility

Paths below are relative to the configured API base (no new global prefix). All public results omit review evidence/actor identity; source-reviewed means source review, not guaranteed clinical endorsement.

| Method/path | Contract |
|---|---|
| GET `/care` | strict query: search trimmed/NFC max150 default empty; kind hospital/doctor/medicine/lab/pharmacy optional; city default Jaipur; specialty default empty max300; page integer1..10000 default1; limit1..50 default20. Returns `{items,page,hasNext,coverage}`; unsupported city returns empty with unsupported-city |
| GET `/care/:id` | UUID; reviewed public entry plus `affiliations`; hidden/stale records unavailable |
| GET `/care-search?search=` | strict search max150; returns `{providers,articles,bloodBanks}`; limits 10/5/5 respectively |
| POST `/care/:id/corrections`, `/care/blood-banks/:id/corrections` | `{message}` trimmed10..1000; `{received:true}`; 5/min throttle |
| GET `/public/articles`, `/public/article-categories`, `/public/articles/:id` | Existing directory publication/pagination schema on guest-safe paths |
| GET `/public/blood-banks`; POST `/public/blood-banks/nearby` | Reviewed guest listings; nearby is private,no-store and returns same truthful contact semantics |
| GET `/profile/export` | JWT; private,no-store;3/min; `{exportedAt,scope,profile,wellness}`; 90-day water history, excludes device readings/chat |
| GET/POST `/admin/care`; GET/PUT `/admin/care/:id` | JWT+super-admin; strict draft schema and optimistic expectedUpdatedAt on edit |
| POST `/admin/care/:id/review` | expectedUpdatedAt ISO timestamp, evidence20..4000, reviewerName/Qualification min3 max300, publish boolean, confirmedSource=true |
| PUT `/admin/care/:id/affiliations` | `{hospitalIds:UUID[<=30],expectedUpdatedAt}`; stable doctor/hospital IDs; returns `{saved:true,reviewRequired:true}` |
| POST `/admin/care/blood-banks/:id/review` | Same review fields plus credential-free HTTPS sourceUrl |
| GET `/admin/care/corrections`; PATCH `/admin/care/corrections/:id` | Queue; resolve with `{resolution}`10..2000, audited |

Public care entry fields: UUID id, kind, name/nameHi, city, address/addressHi, nullable phone, HTTPS sourceUrl, reviewedAt/updatedAt, verification=`source-reviewed`, details `{specialties[],qualifications,registration,languages[],providerType,summary,precautions,latitude,longitude}`. Detail adds affiliated public entries. Draft input also requires stable sourceKey; paired nullable coordinates must be valid latitude/longitude. No fabricated fallback fields. Older authenticated directory endpoints remain backward compatible; do not remove them during deployment.

## Deployment and migration order

1. Back up staging database and record deployed API/mobile versions, migration journal and restoration procedure. Confirm environment/secrets, HTTPS, auth/admin credentials, storage and observability without logging PHI/query strings.
2. Review/apply `0014_care_directory.sql`, then `0015_blood_bank_provenance.sql`, then `0016_bank_corrections.sql` through the existing Drizzle migration workflow on staging. These are PREPARED, NOT APPLIED by this work. Rehearse restore before production approval.
3. Deploy compatible backend before mobile; smoke-test public/private guards, freshness, edits/import invalidation, corrections, export limits, rate limits, old authenticated paths and admin optimistic conflicts. Existing bank verification alone must not publish a new reviewed listing.
4. Import only approved source material as drafts, then qualified human review with evidence and explicit publication. No source dataset was supplied; empty catalogs are intentional. Verify call/address/location from actual data.
5. Run isolated staging load and security acceptance, then sign/build official release and complete device/Play/legal/clinical gates. Promote migrations only through authorized operations with backups.
6. Internal -> closed -> small percentage -> expanded rollout based on crash/ANR, auth, private-data isolation, care freshness, API errors/latency and notification evidence. Pause rollout for safety/privacy defects. Withdraw unsafe content through admin review; rollback mobile/backend to compatible versions. Prefer forward fixes or restore rehearsed snapshots; do not blindly drop migrated tables or erase audit history.

## Required gates and capacity report

The user confirmed a target of three million simultaneous users. This is not supported capacity. Traffic mix, request frequency, geography, dataset volume, arrival/reconnect bursts and AI budget still require measurement. See [capacity plan](AROGIO_CAPACITY_PLAN.md). At one request per 30 seconds, three million sessions imply 100,000 mean RPS; at 60 seconds, 50,000 RPS. These are arithmetic scenarios, not observed demand. Establish workload/SLO/cost assumptions and approved isolated staging infrastructure before load testing. Record p50/p95/error rate/throughput, DB pool and CPU/memory, search correctness, throttling and failure recovery at each ramp. Proposed <500ms p95 reads and >=99.9% crash-free sessions are targets, not measurements. Include public search/articles/banks, private writes/auth, AI throttling and cache invalidation; record unsupported operations rather than simulate them as live services.

Required before release: real-device Android API26 and supported13-16 coverage; cold launch/upgrade/light-dark/English-Hindi/offline/slow network; all navigation/deep links/hardware Back/keyboard/font scaling/screen reader; permission denial/revocation; actual Health Connect source precedence; reminder timezone/restart; export/delete/account isolation; production signing/API/OAuth/recovery delivery; privacy and terms review, processor and retention disclosures; Google Play health declaration, Data safety and permission declarations; qualified Indian legal/privacy and clinical review. Official emergency sources checked November10: [India112](https://www.mha.gov.in/emergency-response-support-system-erss), [Rajasthan108](https://rajswasthya.rajasthan.gov.in/nhmpro.php?id=30).

Set up non-PHI crash/ANR/error monitoring, latency/uptime alerts, freshness/correction queues and a named on-call/rollback owner. Deployment, dashboards, backup restoration and legal/Play approvals are not certified by local unit tests.

