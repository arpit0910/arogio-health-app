# Launch composition review - 29 October 2026

The three PNGs show the shipping LaunchArtwork component rendered through react-native-web at 320x568, 390x844 and 768x1024. The composition was inspected for framing, wordmark fit, tagline wrapping and decorative clipping. These are static composition previews, not native-device screenshots or animation verification.

Reproduce the HTML with `node scripts/preview-launch.cjs <width> <height>`. The default is 390x844. The original logo, live wordmark and existing palette are preserved. Android bundle export passed at `dist/launch-motion-android`; lint, typecheck and 67 existing tests passed. No Android device/emulator was attached.

On a native device, verify cold launch with fast and slow session restore, enlarged system text, reduced motion before and during launch, background/foreground interruption, and removal of the overlay with working touch/accessibility focus. The native OS splash remains static; the JavaScript loading surface animates. No minimum startup hold was added.
