# Navigation, dark mode and section spacing

Shared AppHeader preserves sidebar access throughout completed-profile signed-in destinations, including detail pages alongside their back action. App navigation uses a transparent container without a top border or selected pill; selected icons and labels retain their theme color, and Jeeva AI retains its original artwork and selected outline.

Authentication decorative backdrops render only in light mode. Monochrome SVG icons use palette colors, while action arrows and selected ticks use onPrimary. Root ThemeProvider, screen content and native SystemUI use the active canvas. Android navigation/status icons follow the scheme; the expo-navigation-bar plugin disables contrast enforcement.

Shared CareUI sections and tracking groups use 32 logical units above. Home section headings use 32 above and 16 below, with nested water headings exempt. Shortcut and chart spacing follows the revised content rhythm.

Verification: 87 tests, lint and TypeScript checks passed. Source review passed. No attached adb device was available, and no native screenshots or visual approval were produced. Documentation previews are not native visual evidence.

Build 23 completed: package 1.0.1 (23), arm64-v8a and armeabi-v7a, 61,114,188 bytes. APK signature v2 verified and the signing certificate matches build 22. Artifact: `dist/apk-qa/arogio-build23-local.apk`; delivery copy: `C:/Users/arpit/Downloads/Arogio-build23.apk`. SHA-256: `913CEF165B1DE4B742C8F62FABD01D2F9710DAC10F4023FC91B4107FCA8E412A`. Build verification does not establish native visual signoff.
