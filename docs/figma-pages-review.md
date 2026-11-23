# Figma mobile implementation review

Source: https://www.figma.com/design/XMSozRvRMi90qhyELFA89J/Untitled

The implementation uses light mode, the downloaded Figma artwork, and existing account, directory, wellness, and health-sync providers. Signup is a minimal matching form with name, email and password, as requested. The old welcome screen no longer appears between the splash sequence and Login. Fonts and launch artwork finish loading before the introductory text is mounted. Android raw SVG resources are copied to the app cache before their unchanged XML is read.

| Screen | Figma node | App route |
| --- | --- | --- |
| Homepage | `1:2` | `/home` |
| Medicine Page | `1:570` | `/health` |
| Jeeva AI | `1:1073` | `/jeeva` |
| Profile | `1:1349` | `/profile` |
| Find Care | `1:1710` | `/find-care` |
| Activity | `1:2089` | `/activity` |
| Add/Edit Medicine Reminder | `1:2943` | `/medicine-reminder` |
| Login | `3:2` | `/login` |
| Profile Setup | `3:97` | `/setup-profile` |
| Health Connect | `3:294` | `/connected-health` |
| Splash 1 | `3:462` | `Launch step 1` |
| Splash 2 | `3:542` | `Launch step 2` |
| Splash 3 | `3:842` | `Launch step 3` |

## Splash overlap correction

The two orbit screens use three upright cards spaced 120 degrees apart. At a 390 dp viewport, the artwork is 374 dp wide and the cards are 86 by 46 dp. The orbit radius expands and contracts between approximately 123 and 140 dp over a 16-second loop. The centre is reserved before the radius is calculated. Smaller phones use the same geometry calculation. Collision tests sample the interpolated native animation paths at 1,920 positions per size, for four sizes, and check centre clearance, card separation and canvas bounds. System reduced-motion preferences remain supported.

## Review artifacts

Open `.impeccable/review/figma-pages/index.html` for the local composition gallery. Its records are explicitly synthetic. Long screens scroll within the phone viewport. Browser previews do not exercise native Health Connect, notifications, Google authentication, or live animation.

## Service boundaries

- The two-step profile flow uses backend `flowVersion: 2`, with name, birth date and gender, and optional blood group and contact number. The backend changes in this workspace need deployment before this new flow works against production. Legacy setup validation remains available to older builds.
- Personal readings and doses use recorded account/device data, rather than the illustrative numbers in Figma. Missing readings remain empty.
- ABHA verification, prescription scanning, medicine inventory, weekly/cycle dosing, custom alarm types and caretaker escalation are not connected to a service. Their controls explain that limitation when tapped. Daily medicine times and dose logging use the existing service.
- Apple HealthKit is unavailable in the current build. Android source selection uses installed Health Connect compatible apps and real read permissions.
- Hardcoded Jaipur headings and prompts are removed. Actual provider names and addresses remain source data.
- Production deployment and external account actions were not performed.

## Validation

App typecheck and lint pass. All 166 app tests pass, including the orbit collision test. The backend profile suite passes 13 tests. The signed phone APK is `dist/apk-qa/arogio-build53-local.apk` (version code 53; 69,930,780 bytes). Signature, production API, fresh bundled source, native light-mode setting, and the exact splash SVGs were verified in `dist/apk-qa/build53-verification.json`. An x86_64 build is used separately for emulator checks; the phone APK contains ARM64 and ARMv7 libraries.

## Native launch verification

An emulator-specific x86_64 APK was installed and launched. The final native captures show the complete first-splash wordmark, tagline and wellness badge, visible exported SVG artwork, moving cards with separation from the centre and each other, and all three final wellness badges above the controls. The sequence reaches Login. No native fatal exception was recorded in the final run. The 20-second recording is `.impeccable/review/figma-pages/native/splash-motion.mp4`; frame details are in `native/verification.json`.
