# APK build 15

Build requested on 28 October 2026 for testing the cream-white background, welcome-style authentication illustration, simplified splash, logging visuals, and 12-hour IST handling.

- App version: 1.0.1; Android version code: 15.
- EAS build: `8154e397-9ba8-4fd2-a4d0-1209d98bf641`.
- Build page: https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/8154e397-9ba8-4fd2-a4d0-1209d98bf641
- Profile: `production-apk`, internal APK distribution, existing remote signing credentials, production API URL. The user explicitly approved the source upload and signing for this test APK. No store submission was requested or performed.
- Source upload includes the current working-tree changes, not just the displayed git commit. Private environment files, local QA tooling, native build outputs, and signing files are excluded by `.easignore`.

## Pre-build checks

App lint, TypeScript, and all 52 tests pass. A local emulator-only release APK also built successfully and its Android Debug signature verified. It could not replace the existing emulator installation because that installation uses a different signing certificate; its data was preserved. That local artifact is not the signed EAS APK for phone testing.

The generated local native resources contain `#FFFDFA` for splash, activity background, and system-dark splash appearance. Rendered launch/authentication tests and final cloud artifact verification are recorded after completion below.

## Status

Cloud build finished successfully. APK downloaded, signature verified, and installed over the existing emulator application with data preserved.

- Download: https://expo.dev/artifacts/eas/xmcu3py-WVFwzzCLYWa2eBPAEUFsb-xwJiiQOCNsCzQ.apk
- Local copy: `dist/apk-qa/arogio-build15.apk` (102,061,635 bytes).
- SHA-256: `AC6AF91167EC6A40BA693C4380D32FBE630E115F5908933BB1907B3C8BBA1F49`.
- Package/version confirmed by aapt: `com.arogio.health`, 1.0.1 (15).
- Certificate SHA-1: `CD:D6:E8:F9:74:AB:F3:E8:1E:65:32:D0:4C:AD:3E:96:6D:BF:EB:B6`, matching the existing release certificate.
- Architectures: arm64-v8a, armeabi-v7a, x86, x86_64.

## Native smoke test results

Tested this exact signed APK on the Pixel 3a API 34 emulator. Captures are under `.impeccable/review/build15/`.

- Cold launch succeeded (Android reported 1,875 ms to displayed activity); the captured native splash shows the original logo on cream white, and the app reaches the welcome screen. This single capture does not measure every animation frame or all startup conditions.
- Welcome, login, and signup show the health SVG illustration. Standard phone: 1080 x 2220 pixels at density 440. Signup scrolls to its account-switch link and Google action.
- Small phone: 880 x 1760 pixels at density 440 (320 logical units wide), system font scale 1.3. Headings wrap, and both forms' bottom actions remain reachable through scrolling.
- System-night login retains the light cream-white palette.
- Tablet: 1600 x 2560 pixels at density 320 (800 logical units wide). Login/signup remain centered in the bounded form column with all controls visible.

### Finding: compact enlarged-text keyboard focus

Opening the email keyboard on the 320-unit-wide login with font scale 1.3 can leave the focused field partly behind the keyboard. Evidence: `login-small-keyboard.png`. The form scrolls and bottom actions are reachable after keyboard dismissal, but automatic focus positioning needs a follow-up fix and retest. Build 15 is a test artifact, not a whole-app UI sign-off.

No production account was created or authenticated during these checks. Live login/signup submission, Google authorization, health logging, notification delivery, iOS, and physical-device behavior were not verified by this smoke test. Emulator display size, density, font scale, and night appearance were restored to their original values; the emulator and temporary local API were stopped.
