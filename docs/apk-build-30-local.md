# Local APK build 30

31 October 2026: includes the connected-health missing-permission fix, restored background readings, persistent Android phone-step service, walking-person activity icons and weather failure/forecast labels.

- Artifact: `dist/apk-qa/arogio-build30-local.apk`
- Package/version: `com.arogio.health` / `1.0.1` (30)
- Architectures: arm64-v8a, armeabi-v7a; Android 8.0+ (API 26)
- Size: 64,227,056 bytes
- SHA-256: `808aa03ac959abc8b3a1d2a38aabfd4cd2dfb717002500078f8a32dd439040f5`
- APK v2 signature verified; certificate SHA-256: `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637`, matching build 29.

Local Gradle assembleRelease succeeded with the existing local test/debug signing identity and production API configuration. The packaged bundle contains the production backend URL. APK inspection confirmed the native phone-step health foreground service, activity-recognition/health-service permissions and `stopWithTask=false`. Lint, typecheck and all 102 app tests passed.

This is an installable local test APK, not an EAS/store release. No backend deployment occurred. Live Stormglass weather still requires backend deployment and server-side configuration; its free plan is for non-commercial evaluation. Source-app sync and background steps require physical-phone testing; force-stop, reboot, permission changes and manufacturer battery restrictions can interrupt counting. No new device acceptance is claimed by this build.
