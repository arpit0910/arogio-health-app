# Build 17 local verification

Created on 28 October 2026 from the current working tree. Includes Health Connect read-only analytics, the full-width Arogio splash wordmark, matched AM/PM control heights, the profile pencil action, and title-aligned update checkboxes.

- APK: `dist/apk-qa/arogio-build17-local.apk`
- Package/version: `com.arogio.health`, 1.0.1 (17)
- Architectures: arm64-v8a and armeabi-v7a
- Minimum SDK: 26; Health Connect availability is checked separately (Android 9+)
- SHA-256: `79E59DCB30AC78C277502FD5B8B077B2C4A95828D15C3331A630B481F3F8E265`
- Signature: verified using APK Signature Scheme v2; local debug signing identity, same as build 16

The final local Gradle assembleRelease completed successfully after a full native dependency build and an incremental build of final source/configuration. Android SDK aapt confirms exactly four health read permissions (steps, sleep, heart rate and weight) and no health write permissions. Source Android manifest confirms the permission-usage alias targets the dedicated data-use rationale activity and generic MainActivity does not handle the rationale intent. Native splash resources remain cream white and use the original icon.

Frontend typecheck and lint pass; all 59 tests pass, including five device-health analytics tests. The Impeccable mechanical detector reported no findings. Native and browser computer-use hosts were unavailable, so there are no fresh rendered captures, device data-sync evidence, or real Google-account login verification. This is a test-signed local artifact; it cannot replace the differently signed EAS installation.

Google-login backend diagnostics are a separate server change. This APK does not claim to correct unknown hosted audience configuration or external Google Cloud settings.
