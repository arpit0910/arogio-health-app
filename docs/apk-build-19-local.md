# Local APK build 19

Includes the mobile Home dashboard and slide-out sidebar alongside bottom tabs. See mobile-home-sidebar.md for behavior and scope. All earlier Explore, date-picker and Profile logout updates remain included.

- Artifact: dist/apk-qa/arogio-build19-local.apk
- Downloads: C:/Users/arpit/Downloads/Arogio-build19.apk
- Package/version: com.arogio.health / 1.0.1 (19)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 60,515,061 bytes
- SHA-256: B6076FBD6F2100A379DD9F0714A93848D14D048D43BC26C5E3D16BB819EE3890
- Signature: verified APK Signature Scheme v2, existing local test identity

Validation: lint, TypeScript and all 62 app tests pass; Impeccable mechanical checks report no findings; Gradle assembleRelease succeeds. Native and browser UI hosts were unavailable, so drawer interaction, screen-reader focus, enlarged-text layouts and rendered Home still need on-device verification. Historical Home screenshots were inspected as incumbent reference, not new evidence.
