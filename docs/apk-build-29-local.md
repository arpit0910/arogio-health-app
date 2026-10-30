# Local APK build 29

30 October 2026: simplified core flows and shared UI; installed capable health sources only; one connection screen; source restoration and goal-save confirmation; analytics without empty cards; compact care screens and corrected cycle theme; working Explore tools; active navigation icon background removed.

- Artifact: `dist/apk-qa/arogio-build29-local.apk`
- Package/version: `com.arogio.health` / `1.0.1` (29)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 64,220,680 bytes
- SHA-256: `94C7061D533A263BA54227AB0944D04DC6A7BF6972B40EB87768CF7C2DC86493`
- APK v2 signature verified. Certificate SHA-256: `da57724f3a0c612c29f82b4f0e0f0c256cd3d8eacfddaf18aff7755df9eeb637`, matching builds 27 and 28.

Gradle assembleRelease succeeded from the updated source. Uses the existing local test/debug signing identity and production API configuration. No source upload, store release or backend deployment occurred.

Frontend typecheck/lint and 102 tests passed. Five isolated backend wellness HTTP/database journeys passed. Public hosted API health returned JSON status ok. Source saves on a real production account were not performed. Mechanical UI scan returned no findings for the checked key screens. Synthetic compositions covered phone, narrow and light/dark layouts; these are not native acceptance tests.

The separate Samsung Health Data SDK goal integration is not implemented. Shipping it requires Samsung partner approval. Health Connect readings do not imply imported Samsung targets. The updated interface explains the distinction. Missing exercise readings stay hidden; activity and target data are not fabricated. Physical Samsung sync, notification sound and UI acceptance remain device checks.

See `docs/app-usability-refinement.md` for the behavioral changes and validation scope.
