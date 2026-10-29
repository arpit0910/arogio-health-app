# Local APK build 24

29 October 2026: Arogio-first tracking without mandatory Health Connect; independent foreground phone steps; daily journal on Home and Health; direct per-metric logging and recent-day controls; optional notification permission during onboarding; medicine records retained when notifications are denied.

- Artifact: `dist/apk-qa/arogio-build24-local.apk`
- Downloads copy: `C:/Users/arpit/Downloads/Arogio-build24.apk`
- Package/version: `com.arogio.health` / `1.0.1` (24)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 61,123,320 bytes
- SHA-256: `7D86C76EB1005D6ED52D5C3572ADCBCAF12D1647F2F3749BE148BB96CAC962CC`

Gradle assembleRelease succeeded. APK v2 signature and package/version verified; signing certificate matches build 23. App lint, typecheck and all 89 tests passed, including medicine form saves with allowed/denied notification access. Source review found no material regressions after finish fixes.

Phone steps require a supported sensor and motion permission, and count only while Arogio is open. Other activity totals are entered by the user or optionally imported from one health app. Manual records still use the account API; no offline sync queue was added. No connected Android device/native screenshots were available, so physical sensor behavior, permission dialogs and visual acceptance remain unverified.

Uses the existing local test signing identity and production API configuration. No EAS/store/backend/website deployment was performed.
