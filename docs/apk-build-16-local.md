# Local APK build 16

Created on 28 October 2026 from the current app working tree, including form focus/visibility fixes, filled navigation selection, medicine CRUD and daily multi-dose reminders, and medicine illustration.

- Artifact: `dist/apk-qa/arogio-build16-local.apk`
- Package/version: `com.arogio.health`, 1.0.1 (16)
- Size: 58,900,237 bytes
- Architectures: arm64-v8a and armeabi-v7a; Android 7.0/API 24 minimum
- API configuration: production environment
- SHA-256: `26C625948F6BBA36F481D4D49E5EF6E6573DED4648CD78AC9E94166E2E3B4354`
- Signature: Android Debug certificate, verified with APK Signature Scheme v2
- Certificate SHA-1: `6BD702D6962B4AB06706CDED39DF9569CA2ED945`

Built locally with `node scripts/build-local-apk.cjs`. No source upload or cloud build occurred. Windows native compilation required a shorter workspace staging directory (`.c/`), configured through the local Expo plugin. Gradle assembleRelease completed successfully. Android SDK aapt and apksigner verified package metadata, architectures, and signature. No installation or device smoke test was performed.

This test signature differs from EAS build 15, so this artifact cannot update that installation. Do not remove an existing app without considering its locally stored data. Production medicine storage still requires deployment of the matching API and migration `0006_icy_skin.sql`.
