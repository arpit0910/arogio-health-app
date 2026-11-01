# Local APK build 35

1 November 2026. Includes the app UI refresh and redesigned Jeeva chat: health education, authored app help, starter/follow-up questions, readable replies, medicine safety boundaries and life-threatening-answer replacement with a Safety notice. Saved-health context remains off by default.

- Artifact: `dist/apk-qa/arogio-build35-local.apk`
- Package/version: `com.arogio.health` / `1.0.1` (35)
- Architectures: arm64-v8a, armeabi-v7a; Android 8+ (API 26)
- Size: 64,378,236 bytes
- SHA-256: `5b7c6246bb66e050b0b81cbd967196f89f52931724860cf0b37f01570346dc3d`
- Verified signing certificate SHA-256: `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637`, matching previous local test builds.

Standalone local test APK, signed with the existing local debug/test identity; not a store release. It uses `https://backend.arogio.com/api/v1`. Final archive validation confirms the production URL, absence of the emulator URL, Jeeva Safety notice strings and valid archive integrity. Android apksigner and aapt verification pass. Gradle release assembly passes; log: `dist/apk-qa/build35.log`.

The build script now forces JavaScript regeneration before assembly because Gradle reused the emulator bundle when only public environment values changed. The final artifact above was verified after regeneration. No app dependency or API behavior changed for this build fix; lint passes again.

Frontend lint/typecheck and 119 tests, backend lint/build and 106 tests pass. Native phone, compact large-text and tablet checks are documented in [Jeeva chat](jeeva-chat.md). These checks used the emulator build; this ARM distribution artifact received package/archive/signature checks, not a physical-device runtime test. The original emulator snapshot was restored after QA.

Deploy the updated backend before testing the new chat safety behavior against production. No production backend deployment was performed. Safeguards are not clinical certification; broader clinical validation remains necessary. Backend deployment details: `D:/arogio_health_backend/JEEVA.md`.
