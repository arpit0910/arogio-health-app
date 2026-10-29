# Local APK build 22

29 October 2026: includes settings, saved System/Light/Dark appearance, centralized notification controls, profile referrals and the refreshed connected-health analytics.

- Artifact: `dist/apk-qa/arogio-build22-local.apk`
- Downloads copy: `C:/Users/arpit/Downloads/Arogio-build22.apk`
- Package/version: `com.arogio.health` / `1.0.1` (22)
- Architectures: arm64-v8a, armeabi-v7a
- Minimum Android API: 26; target API: 36
- Size: 61,105,788 bytes
- SHA-256: `0F8EFC38ECE18DA4A157325F0C656A8AA34C936F59B87A0672F0339E50DBC6FF`

Local Gradle assembleRelease succeeded. APK signature v2 and package/version metadata verified. Uses the existing local test signing identity and production API configuration. The build script now resolves the Gradle wrapper by absolute path on Windows.

This is a locally signed test APK, not an EAS production release. Physical-device testing remains pending. Referral availability requires the compatible backend migration/deployment and invite website hosting described in `docs/referrals-and-analytics.md`; no hosted deployment was performed while producing this APK.
