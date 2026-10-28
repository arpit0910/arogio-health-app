# APK build 14

- Version: 1.0.1, Android version code 14.
- EAS build ID: `cc459b66-4e4b-429f-896d-54bcdbd58038`.
- Build page: https://expo.dev/accounts/arpit0910/projects/arogio-health-app/builds/cc459b66-4e4b-429f-896d-54bcdbd58038
- Profile: `production-apk`, using the existing remote Android signing credentials and production API URL.
- Source upload completed. Build was in progress when this record was created; the download and signature verification are recorded below only after completion.

Includes the task-focused Home with compact action priority and tablet rail, restored Jeeva navigation/authentication artwork, splash wordmark spacing correction, simplified profile/setup, water reminder screens and cycle tracker. New tracking behavior uses local device notifications and authenticated backend storage.

Prebuild checks: app lint, TypeScript and all 49 tests pass. Earlier native Android Home verification covers standard/compact/tablet layouts, enlarged text, light appearance under system night, native log/Undo and pull refresh, and the three scored finish-review fixes. This does not establish whole-app release readiness or real Google authorization.

Release dependencies checked on 2026-10-28:

- Live `/api/v1/wellness` returns 404. Deploy the matching backend wellness module and migration `0005_majestic_skreet.sql` before expecting production water/cycle storage to work.
- Google native configuration failure remains tied to the Google Cloud Android OAuth package/signing registration investigation. This APK does not alter Google Cloud registrations.
- `.env*`, signing keys, generated native folders, local QA data/artifacts and review documentation are excluded from EAS upload. Local QA HTTP and debug signing hooks are not enabled on EAS.
