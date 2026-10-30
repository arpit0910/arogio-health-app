# Local APK build 28

30 October 2026: compact Home cards/banner, shared content/header widths, themed bottom navigation, installed health app icons and broader recognized-app discovery, streamlined connection action, automatic background setup where supported, reminder sound diagnostics/tests and persistent profile setup deferral.

- Artifact: `dist/apk-qa/arogio-build28-local.apk`
- Package/version: `com.arogio.health` / `1.0.1` (28)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 64,202,912 bytes
- SHA-256: `81665D0CC67A39C56A796DDC3DDADE90A3745B045EC69DEE5CA905882A37A7CE`
- APK v2 signature verified. Certificate SHA-256: `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637`, matching build 27.

Local Gradle assembleRelease completed successfully. The build uses the existing local test/debug signing identity and production API configuration. This is an installable local test APK, not an official store release. No source upload or backend deployment occurred.

Native app discovery compiled successfully. The packaged manifest contains the wellness default notification channel and the water-drop sound is bundled. Frontend lint and TypeScript pass; the latest app test run passed 97 tests. The backend build, lint and 11 targeted user-service tests passed for profile deferral.

Install on the Samsung S23 Ultra and use Settings > Notifications to run the water and medicine/cycle sound tests. Existing silent channels remain controlled by Samsung settings. Physical notification sound, permission dialogs, health app data and device rendering have not been verified by this build. Non-Health-Connect provider adapters remain unavailable unless separately implemented and configured.

Deploy the matching backend to persist setupDeferred before testing Skip for now. Skipping leaves profileCompletedAt unset, preserves saved progress, and allows resuming from Profile. No database migration is required for that JSON field.
