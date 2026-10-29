# Launch screens

Updated 29 October 2026. Launch uses one branded surface with the original Arogio SVG logo, live wordmark, and Your Health Companion on cream white (`#FFFDFA`). The emblem sits in a soft green field with two open arcs and three small brand-colored accents. Quiet cropped curves frame the canvas. The previous timed second screen and forest message panel have been removed. There is no artificial minimum hold.

The native splash uses cream white in light and system-dark appearance, the existing transparent Android foreground logo, `contain`, and image width 192. The app remains a light-themed app. Root navigation, loading, and screen backgrounds use the shared cream-white token to avoid a white or beige transition.

`src/app/_layout.tsx` calls `preventAutoHideAsync()` at module scope. `AppProviders` starts session restoration while bundled fonts load. After fonts are ready, `LaunchSequence` mounts the router under its opaque launch overlay; the overlay's first layout releases the native splash. The overlay exits when session restoration finishes, using a 200ms fade that respects reduced motion. In LaunchArtwork, a 650ms decelerating logo turn/scale introduces the mark, then a 4.8-second breathing cycle gently expands the field and floats the accents while startup is loading. All animated properties use the native driver and are marked non-interactive. Loops stop on unmount, backgrounding or a reduced-motion change. Reduced motion defaults to on until the OS preference is known, shows the full static composition, and exits immediately. Small screens and enlarged fonts use a smaller emblem while keeping live text scalable. The native OS splash remains static; motion runs on the JavaScript loading surface. Content underneath cannot receive touches or accessibility focus while covered. Logo proportions are retained and live text supports system font scaling.

This sequence runs once per root mount. Navigation and background return do not replay it. Font loading failures retain the existing error behavior.

## Authentication artwork

Login and signup now use distinct flat-vector scenes: a returning profile with a sign-in arrow, and a new-profile form with an add badge. Welcome uses a separate daily-care checklist. Water and cycle tracking have measured hydration and private-calendar scenes. All are editable SVGs; see `content-illustrations.md`. These supersede the repeated welcome illustration in build 15. Artwork remains decorative and uses the existing responsive sizes and form scrolling.


## Verification and delivery

29 October update: Lint, TypeScript, 67 tests and Android bundle export (`dist/launch-motion-android`) pass. Static composition previews at 320x568, 390x844 and 768x1024 were inspected; see `.impeccable/review/launch-motion`. These are not native animation verification. No Android device/emulator was attached during the motion update; the existing native captures are historical evidence and do not verify the new animation. Cold launch, background interruption and reduced motion still require native verification. No dependency, native splash configuration, or startup hold was added.


App lint, TypeScript, all 52 tests, and Android bundle export pass. Bundle: `dist/cream-auth-android`. No new image dependency or raster asset was added.

Build 15 has since been verified on an Android emulator for cold launch, authentication artwork, standard/small/tablet layouts, and system-night appearance; see `apk-build-15.md`. A compact enlarged-text keyboard-focus issue remains open, and physical-device verification is pending. No whole-app release sign-off is claimed. Test a standalone release build, including cold launch, signed-in and signed-out users, slow font/session loading, enlarged text, small screens, reduced motion, and system-dark appearance. Native splash configuration requires a new app binary; an OTA update alone cannot deliver it. Nothing was published by this task.
