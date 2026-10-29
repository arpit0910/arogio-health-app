# Local APK build 20

29 October 2026: packaged the current source, including Home/sidebar, launch motion, installed health-source selection, shared health charts and refresh, daily activity targets, and optional foreground phone step counting. Added Daily activity & targets to the sidebar so the newer screen is available alongside other care tools.

- Artifact: dist/apk-qa/arogio-build20-local.apk
- Downloads: C:/Users/arpit/Downloads/Arogio-build20.apk
- Package/version: com.arogio.health / 1.0.1 (20)
- Architectures: arm64-v8a, armeabi-v7a
- Size: 61,055,932 bytes
- SHA-256: 8317EBF7A29F7EDFA0E87EE5FE87F22DBE89C3C59B849012B920BC4132A45BF7
- Signature: verified APK Signature Scheme v2, existing local test identity

TypeScript, lint and all 82 tests pass. The sidebar regex detector reported no findings; this does not verify rendered contrast or layout. Gradle assembleRelease succeeded, including the local health-source module. The first offline attempt needed an uncached WorkManager dependency; the online local build downloaded dependencies without uploading source.

This is a combined installable build, not physical-device sign-off. Native layout, screen-reader focus, cold-launch motion, installed-app discovery, actual Health Connect sharing and background refresh require phone verification. Phone steps explicitly count only while Arogio is open. Account activity endpoints require the matching backend deployment; this task did not deploy hosted services.
