# Launch screens

Updated 31 October 2026. The refreshed launch composition retains the original Arogio logo and ?Your Health Companion? line, adding the headline ?Your health, at your pace.? and supporting everyday-care copy. A pale mint logo field, open orbit geometry and tonal Hydrate / Move / Rest badges use the existing emerald palette. The footer shows an honest ?Opening Arogio? state, without percentages or a false sync-completion claim.

The screen follows the saved app theme. The native OS splash remains the original static logo at width 192, with mint-white (`#F3F8F0`) for light appearance and emerald (`#00291E`) for system-dark appearance. Native appearance follows the OS; after JavaScript restores the saved app theme the richer loading composition follows that preference. No claim is made that the native OS can read saved app preferences before JavaScript starts. Native background changes require a new binary.

The existing startup lifecycle is preserved: fonts load and authentication restoration runs concurrently, the first branded layout hides the native splash, and the launch overlay exits as soon as session restoration is ready. No artificial minimum hold or new startup network request was added. The router under the overlay remains inaccessible until handoff. The launch surface runs once per root mount rather than replaying on navigation or background return.

Motion uses a 600ms eased logo arrival and a slow 6.4-second breathing cycle for the logo field, three care accents and loading dots. All animated properties use the native driver and are non-interactive. Existing cleanup stops the loop on backgrounding, unmount and reduced-motion changes. Motion is disabled until the OS preference is known; reduced motion shows the complete static composition and uses the existing immediate exit.

Short screens and larger text use a smaller graphic and icon-only badges while preserving scalable live copy. The content can scroll rather than clip when system text requires more room. No new dependencies, generated image assets, health-value samples or promotional outcome claims are introduced.

Validation: lint/typecheck and 110 tests pass; the scoped design scan has no findings. The actual React Native composition was rendered through React Native Web and inspected at 390x844 dark, 320x568 light and 768x1024 dark. Previews are in `.impeccable/review/launch-refresh`; regenerate with `node scripts/preview-launch.cjs <width> <height> <dark|light> [fontScale]`. Font-scale input exercises responsive branches; it does not establish native system-font scaling. Native cold-launch animation, theme handoff, interruption and enlarged-text acceptance still require device checks. Older captures and build notes below are historical evidence.

## Authentication artwork

Login and signup now use distinct flat-vector scenes: a returning profile with a sign-in arrow, and a new-profile form with an add badge. Welcome uses a separate daily-care checklist. Water and cycle tracking have measured hydration and private-calendar scenes. All are editable SVGs; see `content-illustrations.md`. These supersede the repeated welcome illustration in build 15. Artwork remains decorative and uses the existing responsive sizes and form scrolling.


## Verification and delivery

29 October update: Lint, TypeScript, 67 tests and Android bundle export (`dist/launch-motion-android`) pass. Static composition previews at 320x568, 390x844 and 768x1024 were inspected; see `.impeccable/review/launch-motion`. These are not native animation verification. No Android device/emulator was attached during the motion update; the existing native captures are historical evidence and do not verify the new animation. Cold launch, background interruption and reduced motion still require native verification. No dependency, native splash configuration, or startup hold was added.


App lint, TypeScript, all 52 tests, and Android bundle export pass. Bundle: `dist/cream-auth-android`. No new image dependency or raster asset was added.

Build 15 has since been verified on an Android emulator for cold launch, authentication artwork, standard/small/tablet layouts, and system-night appearance; see `apk-build-15.md`. A compact enlarged-text keyboard-focus issue remains open, and physical-device verification is pending. No whole-app release sign-off is claimed. Test a standalone release build, including cold launch, signed-in and signed-out users, slow font/session loading, enlarged text, small screens, reduced motion, and system-dark appearance. Native splash configuration requires a new app binary; an OTA update alone cannot deliver it. Nothing was published by this task.
