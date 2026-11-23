# API and admin contracts

Implemented in the actual NestJS backend at D:/arogio_health_backend.

| Contract | Access and invariants |
|---|---|
| GET /care, /care/:id, /care-search | Public; only published, recently reviewed Jaipur entries, stable IDs, bounded pagination |
| POST /care/:id/corrections | Public, throttled; human review queue, no automatic edits |
| POST /care/blood-banks/:id/corrections | Public, throttled; no health-record collection |
| /admin/care CRUD/review/affiliations | Existing admin auth, audit history, optimistic concurrency; edits withdraw publication |
| POST /admin/care/blood-banks/:id/review | Explicit provenance attestation; every content save/import clears verification |
| /public/articles, /public/article-categories, /public/articles/:id | Public education, paginated |
| /public/blood-banks, /public/blood-banks/nearby | Source/review-gated public contact data; no live stock |
| /public/meditation/content | Public content; built-in exercises survive catalog failure |
| /profile/export | Authenticated own snapshot, no-store and rate limit |

Prepared migrations 0014-0016 have NOT been applied to production. Approved public datasets have NOT been invented or seeded. Publishing needs a named reviewer, source URL, review date and evidence. No client controls publication.

Missing: clinical approved catalog content, schemes/eligibility sources, secure records/family backend, bookings/teleconsultation operations, secure account recovery, distributed quotas/cache/queue infrastructure and production observability. Readiness flags prevent unsupported promises. Native list/detail routes do not imply backend deployment.
