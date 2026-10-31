# Local APK build 32

31 October 2026: calm, premium launch refresh. Original Arogio logo and companion line; tonal Move/Hydrate/Rest elements; “Your health, at your pace.” headline; gentle loading motion; matching native light/dark splash backgrounds. Existing readiness-driven handoff and reduced-motion behavior are preserved, without an added minimum hold.

- Artifact: `dist/apk-qa/arogio-build32-local.apk`
- Package/version: `com.arogio.health` / `1.0.1` (32)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 64,245,088 bytes
- SHA-256: `697c5270f90ff6d01b8ac3409244b90284de97c87ea6b1d2d32cf219d38e1cfb`
- APK v2 signature verified; certificate SHA-256: `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637`, matching prior local builds.

Gradle assembleRelease passed. Packaged resource inspection confirms `#F3F8F0` light and `#00291E` dark native splash colours; the bundled JavaScript contains the final “at your pace.” copy. Uses the existing local test/debug signing identity and production API configuration. This is a local test APK, not an EAS/store release; no backend deployment occurred.

Lint/typecheck and 110 tests pass. The scoped design detector has no findings. The final actual component composition was inspected through synthetic React Native Web previews at 390x844 dark, 320x568 light and 768x1024 dark. See `.impeccable/review/launch-refresh/calm-dark-390.png`, `calm-light-320.png` and `calm-tablet-768.png`. Native startup timing, theme handoff, screen-reader behavior and system-font scaling still require phone checks. The richer screen is the JavaScript loading surface; the OS-native first splash remains the original static logo.
