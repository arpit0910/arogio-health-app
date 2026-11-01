# Jeeva: understandable health education and grounded app help

Mode: Operate. Existing emerald/mint Arogio identity, original Jeeva artwork, Inter text and safe-area navigation remain authoritative. This is an extension of the existing chat surface, not a new visual identity.

User brief: support general medical/health questions and Arogio help, prohibit drug prescribing and dosage recommendations, and make the chatbot interactive, clear and aligned. Confirmed safety choice: suppress the normal answer for threats to life and show a Safety notice. No visible page back control.

Conversation: task starter questions cover sleep, hydration logging, medical terminology and app reminders. User messages are distinct from readable paragraph-based replies. New replies open at their beginning; waiting/error/retry/edit/new-chat behavior remains accessible. Follow-up actions offer simpler explanations and clinician questions. A compact keyboard-aware composer retains a send action and a concise scope statement.

Privacy: saved-health context is optional and off by default. A compact disclosure explains provider sharing before enabling records; changing that choice resets the chat. General messages still go to the configured NVIDIA provider.

Safety: backend validation and high-confidence local routes precede model-based request triage. Generated answers are held until a structured safety review passes, with a separate numeric-dose filter. Blocked medication questions receive curated non-prescribing guidance. Urgent/harmful requests receive only curated safety-notice text, never an unsafe candidate. Clear app-help questions use maintained, authored screen instructions after triage to avoid invented controls. Provider/review failures fail closed with a retryable error. No chatbot safety system is a substitute for clinical validation or emergency services.

Verification: native Android captures, source checks, mocked boundary tests and synthetic live-provider checks are recorded in docs/jeeva-chat.md. No native detector is applicable. iOS, hardware and broad clinical safety validation are outside the captured evidence.

## FINISH - 1 November 2026

Independent final review: **SHIP within Android UI and engineering scope**, with no material remaining findings after review of nine real native Android captures and source. This is not clinical certification. Native detector skipped because this is native code. Existing PRODUCT.md, DESIGN.md and .impeccable/design.json remain unchanged; this is a local extension of the existing brand.

Evidence and operational handoff: `docs/jeeva-chat.md` and backend `JEEVA.md`. Frontend lint/typecheck/119 tests, backend lint/build/106 tests (15 suites, 32 focused chat tests), and Android emulator release build pass. Synthetic live checks cover education, authored app help, urgent/medication/harmful routing and safe continuation. One education call timed out at 35 seconds and failed closed before a successful later retry; availability is not flawless. Triage/generation/review share the same model and do not guarantee protection from all medical harms.

Captures: `.impeccable/review/jeeva-refresh/`. Latest compact 320-unit/130% text, tablet safe-area and light welcome/Safety notice captures establish the corrected layouts. Earlier dark answer, medication, notice and keyboard captures retain superseded footer/encoding details and are qualified individually in the handoff. Reviewer found no material remaining Android UI/engineering defects. iOS, physical hardware, screen-reader behavior, motion performance and comprehensive clinical validation are unverified.

No personal/saved health data went to the provider; only synthetic prompts and a disposable local account were used. Local in-memory QA database on port 3001; production database untouched. No production backend deployment. APK 35 was built and signature/archive verified for local installation; see docs/apk-build-35-local.md. Deploy backend first with the app update; no migration/new environment variable. The pre-refresh emulator snapshot was restored successfully.
