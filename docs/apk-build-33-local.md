# Local APK build 33

31 October 2026. Adds article browsing/reading, published articles on Home, the sidebar blood-bank directory, and the Home-only Emergency shortcut with foreground nearby search, straight-line distances, city/pincode fallback, listed-service filters, phone contacts and map directions.

- Artifact: `dist/apk-qa/arogio-build33-local.apk`
- Package/version: `com.arogio.health` / `1.0.1` (33)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 64,268,000 bytes
- SHA-256: `6673ab447129713eee974fc260552a623f147dd97926cdf2a046d6c4aed57142`
- APK signature verified. Signing certificate SHA-256: `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637`, matching prior local test builds.

Gradle assembleRelease passed. Uses the existing local debug/test signing identity and production API configuration. This is a local test APK, not a store release. The backend must be deployed with migration 0011 and the supplied CSVs imported through admin before these screens can show live directory content. No production deployment or data import was performed.

Mobile lint/typecheck and 110 existing tests pass. Backend build/lint, 78 unit tests, 38 end-to-end tests and migration consistency checks pass. Both supplied CSVs were imported twice into a disposable database without duplication: 234 articles and 37 banks. Nearby Jaipur search returned 20 banks ordered by distance, with 17 unlocated listings excluded.

Actual component previews with local CSV fixtures were inspected at 390px for nearby banks and dark article browsing, and 320px for article reading. Admin article and blood-bank tables/import controls were inspected using local fixtures. Physical-device verification of permission denial, GPS, dialing, maps and the Home Emergency handoff remains necessary.
