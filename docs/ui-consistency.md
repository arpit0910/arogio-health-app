# App UI consistency pass

2 November 2026. This pass modernizes the established emerald/mint interface through consistent typography, alignment, navigation and state behavior. It preserves the user's Home visual direction, Arogio identity, health features and real-data requirements.

## Shared changes

- Buttons use balanced icon slots so the label stays on the horizontal centerline. Loading keeps the label's layout space, preventing height changes. Labels retain font scaling, wrap naturally and use explicit native line heights.
- Detail screens have a real Back control and one compact app bar, rather than repeating the Home menu/brand row. Back respects history and uses Home/login fallbacks for direct links. Main screens retain the existing logo/menu/notification layout.
- Shared headings, body copy, row titles, details, buttons and inputs use named type roles in `src/theme/tokens.ts`. Android label and field font padding is explicit.
- Profile, setup, authentication and tracker fields use consistent minimum height, baseline spacing, icon geometry and text padding. Profile summary values align to a shared right edge.
- Care rows, settings selections, bottom-tab labels and chat typography use consistent spacing and wrapping. Selection borders no longer change control size.
- Home care shortcuts collapse at enlarged text sizes. Emergency uses short call labels with the shared button. AM/PM selection now uses the theme's on-primary foreground. Refresh indicators use the active palette.

## Evidence and limits

The fixture preview runner renders actual Home, Emergency, settings, profile, edit-profile, water, medicines, cycle, activity, login and signup components. Fixtures are synthetic and effects/network/native pickers are stubbed. Preview generation proves renderability, not pixel-perfect native layouts. Browser visual inspection was stopped by the Computer Use URL policy check; it is not counted as a completed visual review.

The existing Android emulator initially crashed using host graphics, then started with software graphics. Native captures and artifact validation are recorded with the build. Physical-device, tablet, screen-reader and full signed-in flow coverage remain separate verification work; this pass makes no universal release-readiness claim.

Reference for Android text alignment: https://reactnative.dev/docs/text-style-props#includefontpadding

Native result: inspected login at normal/1.3 font scale and signup at normal scale in a fresh API 34 emulator. The validation x86 APK shares its JavaScript bundle byte-for-byte with the ARM phone APK. Existing emulator data was preserved. Historical build reports have been removed.
