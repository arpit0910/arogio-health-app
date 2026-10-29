# Local APK build 23

29 October 2026: restores persistent sidebar access through the shared header, fixes dark get-started backgrounds and icons, adjusts section spacing, and removes app/system navigation-bar backgrounds.

- Artifact: `dist/apk-qa/arogio-build23-local.apk`
- Downloads copy: `C:/Users/arpit/Downloads/Arogio-build23.apk`
- Package/version: `com.arogio.health` / `1.0.1` (23)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 61,114,188 bytes
- SHA-256: `913CEF165B1DE4B742C8F62FABD01D2F9710DAC10F4023FC91B4107FCA8E412A`

Gradle assembleRelease succeeded; APK v2 signature and version metadata verified. Signing certificate matches builds 21/22. Generated Android resources set `android:enforceNavigationBarContrast` to false. App lint, typecheck and 87 tests passed. Independent source review found no material regression in the requested scope.

Uses the existing local test signing identity and production API configuration. No Android test device was connected, so gesture/three-button navigation, light/dark visual appearance and enlarged text need device acceptance. This is a locally signed test artifact; no EAS/store/backend/website deployment was performed.
