# Daily care UI refresh

Updated 1 November 2026. Scope: the existing Arogio mobile app, with quick daily tracking first. This extends the incumbent emerald/mint identity, Inter typography, original branding, existing imagery and routes. No image generation or new dependencies were introduced.

## Implemented behavior

- Home leads with the date, saved water plan and logging action. Labeled care shortcuts and an inline Emergency action follow; Emergency no longer floats over content. Upcoming care, activity, existing wellness artwork and articles remain available.
- Health places daily care before optional health connections. Explore uses task destination cards and retains access to Jeeva, health apps, articles and blood banks. Profile groups identity, measurements, preferences and account actions. Medicine cards distinguish name, reminder state, dose times and editing.
- Shared headers, 20-unit content gutters, tonal icon areas, rows, labels and button feedback provide a consistent hierarchy. Visible page back controls are removed; native system Back remains available.
- FeatureCard destinations use one column below 360 logical units or above 1.2 font scale. Enlarged tracking intros omit decorative artwork; compact WaterSummary also removes artwork where space is constrained. Progress transitions take 420 ms and respect reduced motion.
- After eligible account login/setup, Home stays mounted while optional native dialogs are attempted once per account: notifications, then supported phone motion. The account-scoped attempt is remembered before requesting access. Denial or errors preserve manual tracking. There is no automatic access setup page. City location and Health Connect remain contextual/manual; access settings remain available explicitly.

## Validation and evidence

Evidence lives in [the native review folder](../.impeccable/review/ui-refresh/). Captures are Android emulator output, using synthetic local account data.

| Coverage | Evidence |
| --- | --- |
| Revised phone hierarchy | `home-phone-final.png`, `health-phone-final.png`, `explore-phone-final.png`, `water-phone-final.png` |
| Inline Emergency and lower Home content | `home-actions-scrolled-final.png` |
| Expanded layout | `home-tablet-final.png`, `health-tablet-final.png` |
| Actual notification OS dialog over Home | `permission-phone-final.png` |
| Water logged through the real UI, 750 to 1000 ml | `home-before-log-final.png`, `home-logged-final.png` |
| Native Back from Water to Home | `home-system-back-final.png` |
| 320 logical units, 130% text, light theme | `home-small-light-final.png`, `water-small-light-final.png`, `water-small-light-scrolled-final.png` |
| Single-column destinations at 320 logical units / 130% text | `explore-small-light-final.png`, `health-small-light-final.png` |
| Intact Medicines labels after scrolling | `explore-small-light-scrolled-final.png`, `health-small-light-scrolled-final.png` |

`medicines-phone.png`, `profile-phone.png`, `settings-phone.png` and `cycle-phone.png` are earlier regression captures, not final acceptance evidence for every state.

The final `npm run check` passed lint, TypeScript and all 119 tests after the FeatureCard adaptation; see [ui-refresh-checks.log](../.impeccable/review/ui-refresh-checks.log). The final Android emulator release build succeeded and was installed; see [native-build.log](../.impeccable/review/ui-refresh/native-build.log). No source changes followed the final captures.

Final reviewer disposition: **SHIP within the reviewed Android emulator scope**. All four material findings are resolved: floating Emergency overlap, Health hierarchy, invalid permission capture and the enlarged-text FeatureCard label wrap. Final Explore and Health captures verify intact Medicines labels at 130% text; the scrolled Water capture verifies that Log 250 ml and Other amounts remain reachable.

## Boundaries and handoff

Status: implemented, checks passed and reviewed for the scoped Android emulator acceptance above. This is not production release approval. No APK was distributed and nothing was deployed to production. The original emulator app snapshot was saved as `arogio-before-ui-refresh` before replacement with the differently signed local test app. After verification, font scale was reset to 1.0 and that snapshot was successfully restored (`adb emu avd snapshot load` returned OK, exit 0), restoring the original emulator test app and data.

Native detector was skipped for native code. iOS, physical hardware, predictive-back gestures, screen-reader behavior and animation performance were not verified. Emulator system Back and notification-dialog evidence do not establish those broader capabilities.

`PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` are preserved. Pre-existing context metadata drift remains: those files describe older access setup, header/back, gutter and responsive rules that differ from current source. This scoped implementation note records the actual refresh without silently repairing or replacing the existing identity documents.
