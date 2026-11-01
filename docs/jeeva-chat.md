# Jeeva chat

Updated 1 November 2026. Jeeva provides general medical and health education and help using Arogio. It cannot diagnose, prescribe, select medication, recommend or validate doses/schedules, change treatment, operate trackers or provide emergency care. General medicine risks and side effects remain in scope. For a possible threat to life, the normal answer is hidden and only a curated **Safety notice** is displayed. These safeguards reduce risk; they are not clinical certification or a guarantee against medical harm.

The existing emerald/mint palette, Inter text, original logo and Jeeva artwork remain. Icon-led starters cover sleep, water logging, medical terminology and reminders. Replies use selectable paragraphs and simple bullets; optional follow-ups offer simpler explanations and questions for a clinician. A compact plane-icon composer supports the keyboard. Pending, disabled, retry, edit and New chat states remain explicit. New replies open at their beginning; New chat resets scroll. The compact layout applies below 360 logical units or above 120% font scale, and the tablet layout respects the bottom safe area. Safety notices use the rose alert surface; medication boundaries use a separate Medicine safety card. There is no visible page back control.

Saved health records are **off by default**. The expandable record row explains NVIDIA sharing and the profile, activity, water, medicine and cycle categories before opt-in. Changing access clears the conversation. Device-only readings are excluded. Records are selected fresh using the authenticated account; identifiers and free-text notes are excluded. Existing medicine data may be attached with consent, but replies must not repeat or validate doses. Chat stays in memory for the mounted account session; switching accounts or unmounting clears it and aborts pending client work. NVIDIA receives ordinary submitted conversations, except requests resolved by the local safety routes. This is not a statement about provider retention.

The backend validates bounded alternating history, then handles high-confidence urgent and medication requests locally even without a provider key. Other requests receive structured model triage. Clear app-help questions then use maintained authored instructions for actual screens. General answers are generated, checked by a numeric-dose guard and held for structured candidate review before release. Input triage receives no health summary; generation and candidate review may receive opted-in saved records. The same configured NVIDIA model performs triage, generation and review, so these are not independent clinical checks. Unknown decision values, invalid provider output and provider/review failures fail closed with a retryable error. No content streams before review. Backend provider work has one 35-second budget; the client allows 45 seconds and does not retry automatically.

Replies carry `kind: answer | medication | urgent | harmful | off_topic`. Urgent and harmful kinds render Safety notice; medication renders Medicine safety. The client rejects unknown kinds and malformed content, accepts a missing kind as a legacy answer, and removes local kind metadata from submitted history. API, record selection and deployment details are in [backend JEEVA.md](../../arogio_health_backend/JEEVA.md).

## Verification and evidence

The independent final reviewer returned **SHIP within Android UI and engineering scope**, with no material remaining findings after reading the nine native captures and source. This disposition is not clinical certification. No native detector was applicable to this native-code surface. iOS, physical hardware, screen-reader behavior, motion performance and comprehensive clinical validation remain unverified.

- `npm run check`: frontend lint/typecheck and 119 tests pass; `.impeccable/review/jeeva-refresh/checks.log`.
- Backend: 106 tests across 15 suites, including 32 focused chat tests, pass; `.tmp/jeeva-tests.log` in the backend. Backend lint/build pass.
- Android emulator release build passes; `.impeccable/review/jeeva-native-build.log`.
- Synthetic live-provider checks passed education, authored app help, medication/urgent/harmful routing and a new safe question after a blocked medicine request. One education request timed out at 35 seconds and failed closed; a later retry passed. Provider availability and latency remain limitations. Initial invented app controls and unsolicited app promotion led to authored FAQ answers and explicit unsupported-feature instructions.

Native evidence lives in `.impeccable/review/jeeva-refresh/`:

| Capture | Evidence and status |
| --- | --- |
| `welcome-phone-final.png` | Dark welcome. |
| `app-answer-phone-final.png` | Grounded answer opens at beginning; earlier footer. |
| `medication-phone-final.png` | Non-prescribing boundary; earlier footer. |
| `safety-notice-phone-final.png` | Dark Safety notice; earlier footer. |
| `keyboard-phone.png` | Keyboard layout; earlier encoding issue corrected afterward. |
| `small-chat-ready-final.png` | Latest compact 320 logical-unit / 130% text capture; first starter fully reachable. |
| `tablet-chat-final.png` | Latest tablet composer clears Android taskbar. |
| `welcome-light-phone-final.png` | Latest light welcome and shortened footer. |
| `safety-notice-light-final.png` | Latest light Safety notice and shortened footer. |

Historical captures are not all complete final-state acceptance evidence; the qualifications above identify superseded details. Synthetic Web fixtures (`scripts/preview-jeeva.cjs`) remain layout aids, not native acceptance.

Only synthetic prompts and a disposable local account were used in live checks; no personal or saved health records were sent. Local QA used an in-memory database on port 3001; the production database was untouched. No production backend deployment occurred. APK 35 is built separately for local installation using the production API. The `arogio-before-jeeva-refresh` emulator snapshot was saved before replacing the old signed app; restoration was confirmed successfully. Deploy the backend and app together, backend first. No migration or new environment variable is required; see backend configuration notes.
