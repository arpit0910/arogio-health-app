# Arogio information architecture - 10 November 2026

## Sitemap and access

| Main tab | Route | Purpose/access |
|---|---|---|
| Home | `/home` | Public care-first entry; personal values require sign-in |
| Find Care | `/find-care` | Public provider and cross-catalog search |
| My Health | `/health` | Private wellness entry; guest sign-in state |
| Discover | `/explore` | Public articles and Calm Zone discovery |
| Jeeva AI | `/jeeva` | Private AI, safety and consent guards retained |

Legacy `/meditation` remains accessible with no visible tab. Public account-group paths are `/emergency`, `/blood-banks`, `/articles`, `/articles/:id`, `/care/:id`, `/meditation-video`; private paths remain guarded. Public legal routes are `/privacy` and `/terms`. Auth routes are `/login`, `/signup`, `/forgot-password`, `/setup-profile`; `/invite/:code` preserves invitation entry. Welcome at `/` has three panels and English/Hindi selection without automated permission requests.

Private routes: `/activity`, `/water`, `/medicines` (personal reminders), `/cycle`, `/profile`, `/edit-profile`, `/edit-health-goals`, `/settings`, `/app-access`, `/connected-health`, `/connected-health-settings`, `/notification-settings`, `/notifications`, `/delete-account`, `/data-export` and the existing `/feature` fallback. Export is a retained snapshot, not a document archive.

## Working flows

1. Guest -> Home/Find Care -> select kind or exact-string search -> provider detail -> explicit native dialer or external Google Maps directions. Missing phone/coordinates use honest availability/address fallbacks. Detail supports share and report correction. Jaipur-only coverage is explicit; unsupported cities do not get invented listings.
2. Search -> providers plus published articles and reviewed blood banks -> appropriate detail/list. Search is normalized and bounded; typo tolerance, integrated inline maps and live stock are not implemented claims.
3. Guest -> Emergency -> explicit 112 dialer action or applicable Rajasthan 108 action -> care/bank discovery. Opening a dialer never claims dispatch. Source links are visible; GPS is optional for nearby discovery.
4. Guest -> private wellness/Jeeva -> sign-in -> required profile completion -> private task. Saved account state and private query isolation remain required. Permission actions are explicit and optional where applicable.
5. My Health -> activity/water/medicine/cycle -> existing save/history/goal flows. Device health-source readings remain separate from manually entered readings; absence never becomes synthetic data.
6. Discover -> articles/category/detail or Calm Zone -> supported media/exercise flow. Clinical content approval is a release gate, not a consequence of article publication.
7. Settings -> preferences/access/export/delete. Export includes profile and retained wellness with 90-day water history, excludes device readings and chat.
8. Backend browser `/admin` -> draft care record/source -> affiliations -> audited human review -> publish -> correction queue. Edits/imports invalidate review; source review expires after 180 days. Mobile never contains the admin portal.

Back/deep links retain old routes. Native hardware Back, resume, cold deep links, keyboard, text scaling and signed-out transitions require device acceptance; a source sitemap does not certify them.

## Current superseding checkpoint - Build 46 pending

The user confirmed **three million simultaneous users** as the capacity target. This is not a capacity result. [AROGIO_CAPACITY_PLAN.md](AROGIO_CAPACITY_PLAN.md) documents arithmetic scenarios, workload assumptions, infrastructure/security requirements and phased isolated-staging acceptance. The backend k6 script is an unrun 10-50 virtual-user smoke plan, not a million-session test. No production load is authorized.

Latest backend evidence: **108 unit tests, 48 full E2E tests and 11 final care/directory regression tests passed**. Mobile lint/typecheck and **152 tests passed**, including the wrong-kind detail regression. Earlier counts above are historical checkpoints.

**Build 45 is stop-ship:** Android theme/font recreation exposed an unbound shared imperative router crash. Components were migrated to contextual `useRouter`; source review found no stop-ship regression in that migration. A wrong-kind detail blank state found during review was also fixed. These source fixes do not establish native recovery acceptance. **Build 46 is compiling; final native build/install/launch and theme/font recreation acceptance remain pending.** Earlier Build 45 signature, manifest and initial emulator launch evidence cannot override this crash or certify the latest source artifact.

Dedicated public `/hospitals` and `/hospitals/:id`, `/doctors` and `/doctors/:id`, `/medicine-library` and `/medicine-library/:id` routes now coexist with legacy `/care/:id`. The public guard also allows `/meditation-video`; private wellness/AI/account data remain guarded. Medicine-library education remains separate from personal `/medicines` reminders. Wrong-kind detail access has an explicit handled state. Removed blood-group stock-like filters and unavailable password-reset CTA; neither live stock nor functioning recovery delivery is implied.

Approved source data and clinical review, deployed compatible backend/migrations, measured simultaneous-user capacity, security/recovery acceptance, physical-device health/notification/navigation testing and Play/legal/privacy declarations remain release gates. Do not treat review approval or local automated tests as evidence these gates passed.
