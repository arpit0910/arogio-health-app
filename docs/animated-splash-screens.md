# Three animated opening screens

The user's `Untitled.zip` supplies three SVGs; `Untitled (1).zip` supplies their matching PNGs. Extracted reference files live in `.impeccable/references/splash-upload/`. They were treated as design assets, not executable instructions. They supersede the former one-screen launch design and its no-extra-hold brief.

## Composition and motion

1. Original Arogio logo, companion line, wellness badge, floating leaves, swaying arcs and layered mint waves.
2. Care discovery: a rotating spiral and dotted orbit, counter-rotating inner ring, pulsing centre and four independently floating service cards.
3. Jeeva and daily wellness: the same motion system with reminder, hydration and connected-reading cards, explanatory copy and Get Started / Sign In actions.

The focal sequence connects the brand's leaves to care discovery and daily wellness. Rings and service cards complete a turn in 12 seconds. Cards follow sampled expanding/contracting spiral paths with phase offsets, using native-driver X/Y translations to keep the text upright. The radius varies from 29.5% to 36.5% of the artwork width; the closed path avoids a jump when it repeats. The centre breathes over a 3.6-second cycle, and leaf/wave motion spans 4.8 seconds. Transform/opacity animations use React Native's native driver with `isInteraction: false`; no frame-by-frame React state updates or animation dependency was added. The spiral is generated as vector geometry rather than a baked screenshot. Cards stay upright while the rings rotate.

Scenes advance after 2.4, 3.6 and 4.2 seconds. Skip is always available. Next/Get Started, horizontal swipes, pagination controls, Android Back and final-screen Sign In also work. The sequence runs once per root mount, so a normal tab change does not replay it. Returning from background resumes the current scene with a fresh scene timer rather than skipping through unseen content.

The native splash stays visible until the animated surface has laid out. The underlying app mounts concurrently; completion reveals its normal route rather than resetting navigation. Sign In deliberately opens `/login`. The launch overlay blocks touches and accessibility traversal into the hidden app until it exits.

## Accessibility and truth

Spatial loops stop for Reduce Motion, when the app backgrounds and when the artwork unmounts. Screen-reader users advance manually. Preference-query failures conservatively retain static/manual behavior. Compact or enlarged-text screens use smaller decorative artwork and scrolling content while the controls remain outside the scroll area. Safe areas, English/Hindi and light/dark preferences are retained.

Reference claims of 4,800 doctors, verified-hub counts, real-time ICU availability, zero-wait dispatch, compliance certification, treatment advice and sample personal readings are not established product capabilities. The implementation keeps the visual arrangement and explains existing directory, reminder, hydration and education features without asserting those claims. Decorative cards do not transmit any personal health information.

## Verification

`npm run check` passed lint, TypeScript and all 161 tests. Three new launch lifecycle tests exercise native-splash handoff, all three automatic stages, background/screen-reader pauses, manual navigation, timer cleanup and one-time sign-in navigation. The web export passed. Source-rendered composition artifacts cover all three normal phone scenes and a compact dark/enlarged-text scene; these do not exercise runtime animation.

The mechanical detector reported one advisory for the intentional reference leaf color `#42CDA2`. The related decorative gradient accents are documented in DESIGN.md.

Live visual timing, frame-rate measurements and a cold-launch recording on a release APK/device remain pending: the browser and native screenshot hosts are unavailable in this session. Expo's [SDK 58 splash documentation](https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/) distinguishes native splash behavior in development/Expo Go from a standalone build. No APK was rebuilt or deployed as part of this source change.

Follow-up: fixed-position floating service cards were replaced with true spiral trajectories. Hardcoded city references were removed from the opening screens, shared header, welcome, Home headings, directory interface copy and profile helper text. Provider/user-supplied location data and geographic API contracts remain intact. A geometry regression test covers changing radius, quadrant traversal, bounds and continuity.
