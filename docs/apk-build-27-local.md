# Local APK build 27

29 October 2026: reference-led emerald Home and shared app theme, illustrated fallback banner and water art, pastel shortcuts, live-source activity cards, date/city weather integration, central access setup and automatic refresh.

- Artifact: `dist/apk-qa/arogio-build27-local.apk`
- Downloads: `C:/Users/arpit/Downloads/Arogio-build27.apk`
- Package/version: `com.arogio.health` / `1.0.1` (27)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 64,195,592 bytes
- SHA-256: `C8D965F5ADE0ECFAC7A7B69927841563E4EF6C23826DFA33BFED21922520E924`
- APK v2 signature verified; certificate SHA-256 `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637`, matching prior local builds.

Final Gradle assembleRelease succeeded. Existing local test/debug signing identity and production API configuration are used; this is not an official store release.

Frontend lint, typecheck and 93 tests passed. Backend lint/build/migration checks passed, along with 56 unit/database tests and 30 HTTP journeys. Unit tests used `--testTimeout=30000` after a cold embedded PostgreSQL migration hook exceeded the default five seconds while concurrent compilation was running; the full suite then passed. Actual-JS portal regressions cover sign-out/refresh and delayed concurrent 401 responses. An isolated disposable local backend successfully seeded the admin, served /admin and returned role-protected analytics. No hosted database was used for that check.

Independent review resolved its reported source findings and accepted reviewed synthetic Home390/320 and portal desktop/narrow compositions. Native permission dialogs, physical sensor timing, connected-app timing, notification delivery and device rendering remain unverified. Connected data refreshes every 30 seconds while active and on resume; source apps control when readings become available. Phone counting is foreground-only. Optional background scheduling is subject to Android's minimum 15-minute interval.

The super-admin portal is backend-only at `/admin`. Deploy backend code and the normal migration chain through `0010_pretty_nekra.sql`, configure private seed credentials, then run the seeder explicitly. Configure `OPENWEATHER_API_KEY` for actual city temperature. No production deployment/migration/administrator creation or weather-key provisioning was performed. See `D:/arogio_health_backend/SUPER_ADMIN.md`.

Artwork was produced using the built-in image generation tool and saved under `assets/home/reference-v2`. Exact prompts are embedded and recorded in adjacent JSON sidecars; no screenshot is used as the app background.
