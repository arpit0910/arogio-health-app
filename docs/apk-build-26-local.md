# Local APK build 26

29 October 2026: final reviewed source built successfully with Expo blur and location native modules. Includes fixed shared menu placement, blurred sidebar backdrop, notification bell/inbox, Profile redesign, account deletion confirmation, connected-source Today Activity, Home chart cleanup and setup city lookup.

- Artifact: `dist/apk-qa/arogio-build26-local.apk`
- Downloads copy: `C:/Users/arpit/Downloads/Arogio-build26.apk`
- Package/version: `com.arogio.health` / `1.0.1` (26)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 61,365,780 bytes
- SHA-256: `AC1E102CD14A3D30CFAE0414D599064DDDF89F9E026509BDF36030C38B34ABE7`

Gradle assembleRelease succeeded from final source. APK v2 signature verified, matching the previous local test/debug signing certificate. Production API configuration is used. This is a locally signed installer, not an official store release.

Frontend lint, typecheck and 92 tests passed; backend lint, build, 51 unit/database tests and 29 HTTP journey tests passed. Independent source review resolved its reported findings. Light/dark Profile and narrow dark Home were reviewed as synthetic React Native Web compositions. Native blur/layering, permissions, actual health-app sync and notification delivery still need device verification.

Account deletion requires deploying the backend changes and migration `drizzle/0009_minor_green_goblin.sql`. No production backend deployment or migration was performed. Accounts are soft-deleted; basic identity details and records are retained indefinitely as confirmed by the user. Verified sign-in restores an account only during the first 30 days; old sessions remain revoked.
