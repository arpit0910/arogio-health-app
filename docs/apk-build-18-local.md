# Local APK build 18

Includes the filled Explore compass face with a contrasting needle; explicit Save date/Cancel labels and colors for profile and cycle Android date dialogs; a generated AppCompat light date-picker dialog theme with matching day/night palette; keyboard dismissal before date selection; a proper browser date input; and the direct Profile logout action.

- Artifact: dist/apk-qa/arogio-build18-local.apk
- Downloads copy: C:/Users/arpit/Downloads/Arogio-build18.apk
- Package/version: com.arogio.health / 1.0.1 (18)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 60,505,945 bytes
- SHA-256: 5FFC117C61DBDFE272F5613F46F1FBDE99960CAACB2F62BF27818746FD5EB63B
- Signature: verified APK Signature Scheme v2, existing local test identity

TypeScript and lint pass. Impeccable mechanical checks report no findings. Gradle assembleRelease passed. Generated Android styles reference DatePickerDialogTheme and both values/colors.xml and values-night/colors.xml contain the intended contrasting text and background palette. The existing date-picker Expo config plugin generates these resources; no generated native resources were edited by hand.

Native and browser UI hosts were disconnected, so no live rendered or physical-device verification is claimed. Install build 18 to test the native picker theme; an older installed APK cannot acquire these theme resources through a JavaScript-only change.
