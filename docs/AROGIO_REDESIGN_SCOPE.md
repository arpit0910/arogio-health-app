# Redesign scope and implementation status

The attached briefs are requirements input. The actual backend is NestJS/Drizzle/PostgreSQL. No Laravel service is fabricated. Existing uncommitted work is preserved.

| Area | Current implementation | Remaining |
|---|---|---|
| Launch/welcome | Shared typography, aligned launch art, bilingual welcome, guest entry, explicit permissions | Native recreation regression, broader devices |
| Home/navigation | Care-first Home and five tabs; public emergency and care; private health guard | Production datasets and full account-state QA |
| Calm Zone | Equal everyday-reset/sleep mix, timed exercises, ambient sound, images, video catalog; background pause | Physical audio/video/network acceptance |
| Activity/sync/insights | Partial sync preservation, foreground step fallback, recorded-day analytics and honest missing data | Physical Health Connect and revoked-permission matrix |
| Hospitals | Dedicated feature folder and public list/detail routes; reviewed catalog/admin/API | Reviewed Jaipur records; provider filters and approved data |
| Doctors | Dedicated feature folder and list/detail routes; stable hospital affiliations | Specialty explorer, reviewed real records |
| Medicine library | Dedicated feature folder and list/detail routes, education and precautions gates | Clinically approved bilingual content |
| Blood banks | Source-gated public listing, nearby, report correction, explicit human review | Current verified data and device GPS; no live inventory integration |
| Articles | Public paginated educational library | Editorial review and native long-content QA |
| Account | Existing auth preserved, private data export; unavailable recovery CTA removed | Operational secure password recovery remains a release blocker |
| Records/family/bookings | Readiness gates remain false | Backend, private storage, consent and operations implementation |
| Schemes/remedies/quizzes | No invented eligibility or clinical content | Approved sources, versioned review workflow and dedicated modules |
| Labs/pharmacies | Catalog kinds available | Dedicated operational flows and reviewed data |

See [changelog](arogio-redesign-changelog.md) and [readiness](AROGIO_RELEASE_READINESS.md). Pending modules are not marked done by the presence of a flag or schema.
