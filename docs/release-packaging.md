# Production APK packaging

Build with `npx eas-cli@latest build --platform android --profile production-apk`.
This profile inherits the production environment, disables the development client,
pins `https://backend.arogio.com/api/v1` and the shared Google Web client, and
produces a signed standalone release APK. The store `production` profile remains
an Android App Bundle build.

The display name is **Arogio Health**. The package `com.arogio.health`, URL scheme
and EAS project are unchanged, preserving upgrade and OAuth identity. Launcher
artwork reuses the existing authentication brand SVG, with a white background,
transparent adaptive foreground and monochrome variant. The visible foreground
fits Android's central safe zone. Regenerate it with
`node scripts/generate-app-icons.cjs <path-to-sharp-module>`; the renderer is a
temporary local tool, not an application dependency.

`.easignore` excludes private environment files, signing keys, old APKs, generated
native projects, build output, dependencies, docs, tests, screenshots/reports,
local instructions and development tooling from upload. Archive inspection for
build 8 found 101 files totaling 4,605,716 bytes, compressed to 3.7 MB for upload,
with no private env, signing keys, tests, docs, dependencies or old APK files.
Ignored directories can appear empty in EAS's inspected archive.

The APK includes compiled application code, referenced assets, runtime metadata
and Android libraries. Four native architectures support both devices and
emulators; those libraries are expected runtime contents. Expo's development
launcher/menu use their disabled implementations in a normal release build.
Keep the development dependency available for local development.

Google account authorization still needs the release signing SHA-1 registered
for this package in the same Google Cloud project as the configured Web client.
Local debug certificate registration alone does not cover a release APK.
