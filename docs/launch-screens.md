# Launch screens

The app shows the brand splash, crossfades to the health splash, then fades into the existing route. The sequence runs once per root layout mount (cold launch or web refresh), not when navigating or returning from the background. The operating system's initial native launch screen remains separate.

`src/features/launch/LaunchSequence.tsx` mounts the router underneath an opaque overlay, so session restoration runs concurrently and incoming links retain their destination. The first screen holds for 1.1 seconds, the crossfade takes 400ms, and the second holds for 1.5 seconds. The final 250ms fade waits for session restoration. Timers and animations stop on unmount. System reduced-motion settings remove fades. The covered app cannot receive touches or accessibility focus.

The first artwork also displays during font loading. Both bundled images load before the sequence starts; image errors release the loading gate. Images fit within the safe area without cropping the lettering or drawing a mock status bar. Wide displays use a centered composition capped at 600dp.

Assets: `assets/splash/brand.png` and `assets/splash/health.png`. Created with the built-in image generation tool from the supplied two-phone reference, then inspected. These are reconstructed artwork rather than original exported design files. Text is embedded in the images, with equivalent accessible labels in the component.

Prompt set: reconstruct each phone's screen content as a flat portrait splash, preserving Arogio, Your Health Companion, mint botanical waves and the reference composition; remove phone hardware, notch and mock status bars. The second image additionally preserves the hand supporting an ECG heart, surrounding health icons, and “Healthy Choices / Brighter Tomorrows.”

Validation: lint, TypeScript and the existing unit tests. Artwork was visually inspected; device animation, safe-area and reduced-motion verification still require a device or emulator.
