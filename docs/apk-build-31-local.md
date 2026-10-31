# Local APK build 31

31 October 2026: Home health/activity cards remain visible with explicit loading/missing-data states; current IST clock and dated sync/check times; grouped Health Connect reads; partial-failure retention; permission filtering and foreground cache; Pebble Halo/Samsung discovery and source-specific sharing guidance. Includes the Jeeva chat interface from the current source.

- Artifact: `dist/apk-qa/arogio-build31-local.apk`
- Package/version: `com.arogio.health` / `1.0.1` (31)
- Architectures: arm64-v8a, armeabi-v7a; Android 8.0+
- Size: 64,243,200 bytes
- SHA-256: `8d4e38369b711b5c3d665a459613dbd4d6f9a20cd58ce4a4507f7603d60195fc`
- APK v2 signature verified. Certificate SHA-256: `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637`, matching builds 29 and 30.

Local Gradle assembleRelease passed using the existing local test/debug signing identity and production backend URL. Inspection confirmed the Pebble Halo/Samsung package queries and phone-step service in the packaged manifest. The bundled app contains the production API URL and no NVIDIA key prefix. Lint/typecheck and 110 tests passed; synthetic normal/narrow Home empty/cached layouts were inspected. This is a local test APK, not an EAS/store release.

Install as an update to the prior local APK. Open Home to check the cards/date/time, then Manage health apps. Review access if permissions are missing. Sync the wearable inside Pebble Halo or Samsung Health and enable that app's Health Connect writing; return to Arogio and tap Refresh readings. Compare the relevant exported records in Health Connect, not only the companion app's screen totals, since export timing and available data types can differ. Sources are never silently combined. A cached reading shows its earlier check time if a newer read fails.

Physical Pebble/Samsung delivery and background sensor behavior still require on-device verification. Backend deployment was not performed; Jeeva and server weather features still depend on their backend deployment/configuration. See `docs/home-health-sync-fix.md` for the implementation and verification boundaries.
