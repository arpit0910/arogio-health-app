# Launch screens

The Growing Well launch uses two short branded screens built from the original `authAssets.brand` SVG and live text. The first shows Arogio and Your Health Companion; the second adds Healthy choices. Brighter tomorrows. and a forest-green message panel. No new shipping raster artwork is used by this sequence. Previously generated splash PNGs are not referenced by this component.

`app.json` separately configures the operating system native splash through `expo-splash-screen`: warm background `#F5F1E7`, existing `assets/android-icon-foreground.png`, and image width 160. This reuses an incumbent raster asset; it does not add generated artwork. The SDK-compatible splash dependency also resolves the development client startup failure caused by a missing `SplashScreenManager`. The native splash precedes the JavaScript artwork and timed sequence below.

`AppProviders` starts authentication restoration while fonts load. A static LaunchArtwork is shown until fonts are ready, then `LaunchSequence` mounts its router children underneath an opaque overlay. Incoming route destinations remain mounted; covered content cannot receive touches or accessibility focus. Font load failure remains an error, rather than silently releasing the gate.

The first hold is 650ms, crossfade 250ms, second hold 850ms and exit fade 150ms: about 1.9 seconds after the sequence mounts, plus any additional authentication wait. Font loading may extend the initial static artwork before that sequence starts. The exit waits for session restoration. Reduced motion removes animated durations, and timers/animations are stopped on unmount. The sequence runs per root mount, not ordinary navigation or background return; the operating system's initial native launch screen is separate.

SafeAreaView keeps the composition inside native safe areas. The artwork is centered with padding and live text; no mock status bar or phone hardware is drawn. The accessible label changes for the second message.

This is source-based documentation. Startup investigation used a development build; it does not establish full standalone launch behavior. Native motion, safe-area, font-loading and reduced-motion verification require rendered evidence; this document claims no completed capture review or release verdict.
