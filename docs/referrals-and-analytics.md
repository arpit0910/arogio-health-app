# Referrals and health analytics

This extension follows the existing Growing Well design in `DESIGN.md`: shared cream surfaces, forest actions, restrained plum selection accents, Inter type, quiet dividers and flat tonal groups. It introduces no design tokens. `DESIGN.md` and `.impeccable/design.json` remain unchanged; this feature note records the new usage patterns without regenerating the design system.

## Refer a friend

Open Profile and use **Refer a friend**. The panel shows a selectable personal code and invite URL. **Share invite** opens the native share sheet; on web it uses browser sharing when available, then clipboard copying when supported. The selectable URL remains available when sharing fails. Missing codes have a **Refresh referral code** action, and status feedback is announced politely.

Each account receives a unique, immutable, server-generated code containing 12 uppercase hexadecimal characters (`A–F`, `0–9`). Users cannot choose or edit their own code. Codes are normalized to uppercase on input. The migration backfills existing accounts, uses a unique index and retries backfill collisions, then makes the code required with a database-generated default.

The shared URL is `https://arogio.com/invite/CODE`, with `CODE` replaced by the actual code. The invite page displays the code and carries it into signup or unfinished account setup. An incomplete or malformed URL explains how to request another invite or enter a code manually. A syntactically valid code still needs backend validation.

Referral entry is optional for both email signup and Google signup. New accounts can also add a friend's code before completing account setup. Attribution records the referring account and timestamp; it cannot be replaced by another referrer. Self-referrals are rejected, and completed accounts cannot add an attribution. Opening a link alone does not apply attribution.

On the web invite page, **Open in the Arogio app** explicitly opens `arogiohealth://invite/CODE`. If installation happens later, the user should retain the code and enter it during signup or setup. There are no domain association files establishing Universal Links or Android App Links; this feature does not claim automatic HTTPS-to-app opening or deferred attribution after installation.

## Explore health readings

In the Health overview, choose one of the granted metrics and select a day using the accessible day controls. Metric and day selectors expose radio semantics and checked states. The summary panel announces its changing value, and the chart supplies a textual accessibility summary. **Daily readings & details** provides the values in a disclosure, while **Your daily targets** opens the user's target settings.

The seven-day chart uses bars for daily totals and points/lines for heart rate, resting heart rate and weight daily averages. Missing readings remain gaps and are never treated as zero; line segments do not bridge missing days. A recorded zero remains a recorded value. Dates and the displayed week use IST. Today is marked as still in progress.

The initial weight summary can show the latest individual weight with its recording time; selecting a day shows that day's average instead. Daily average calculations include only completed days with finite recorded values. Data coverage includes today when recorded. Comparisons use the two latest completed recorded days, which may not be consecutive calendar days; they exclude today and describe a higher, lower or matching value without a medical interpretation. Fewer than two completed recorded days produces an explanatory message.

The active overview uses the existing primary and accent colors for chart marks, a subtle selected-day background, and bordered day controls. No new palette or typography roles are required. The `WeeklyShare` helper exists in `HealthCharts.tsx` but is not rendered by `HealthOverview`; it should not be described as an available overview feature.

## Release prerequisites

1. Apply backend migration `drizzle/0008_fine_wild_pack.sql` and deploy the compatible backend before releasing clients that use referral fields and attribution. The migration adds `referral_code`, `referred_by_user_id`, `referred_at`, uniqueness, the referrer foreign key, its index and a self-referral check.
2. Deploy the Expo web export to website hosting for `arogio.com`, with an SPA fallback that serves the application for `/invite/CODE`. A successful local export does not establish DNS, hosting, routing or public link availability.
3. Release a compatible native app with the `arogiohealth` custom scheme and invite route. Public invite links and the app-opening button require the corresponding website/backend/native deployments; local implementation alone does not make them work publicly.

## Verification record

The implementation handoff reports 87 frontend tests passing, frontend lint and typecheck passing, 49 backend unit tests and 28 backend end-to-end tests passing, backend build and lint passing, and a successful Expo web export.

Visual verification remains blocked because the browser host was unavailable. Synthetic server-rendered HTML is structural evidence, not a screenshot or rendered visual QA. This documentation makes no visual approval or production deployment claim.

Source inspection covered `ReferralPanel.tsx`, `src/app/invite/[code].tsx`, `HealthOverview.tsx`, `HealthCharts.tsx`, `insights.ts`, referral input/model code and migration `0008_fine_wild_pack.sql`. The existing design sidecar was inspected and preserved because this extension adds no tokens; earlier design drift is outside this change.
