# Content-specific vector illustrations

This set replaces the shared welcome artwork and the earlier painterly image sheet. All five primary scenes are original editable SVGs, rendered through the existing `react-native-svg` dependency. No generated raster, photo, grain, shaded figure, or image crop is used.

| Screen | Illustration | Meaning |
| --- | --- | --- |
| Welcome | Daily-care checklist, heart, and water drop | Small everyday care actions |
| Login | Returning profile on a phone with a sign-in arrow | Access an existing account |
| Signup | Profile form with a plus badge | Create a new account |
| Water | Measured bottle, drinking glass, and add badge | Record a drink |
| Cycle | Calendar, selected day, and lock | Private date-based tracking |

The scenes share flat forest green, sage, cream white, rounded strokes, and a 294:215 canvas. Cycle uses the existing plum accent. Each composition is distinct. Artwork remains decorative to assistive technology; the actual screen headings and controls carry meaning and interaction.

Editable sources: `assets/illustrations/vector/`. Run `node scripts/generate-care-illustrations.cjs` after editing them to update `src/components/app/careIllustrations.ts`. `CareIllustration` is the shared renderer; authentication and tracker layouts retain their existing responsive sizing.

Lint, TypeScript, all 52 tests, SVG XML validation, and Android bundle export pass. The exported asset list no longer includes the painterly image sheet. Build 15 predates this set; these changes require a later APK before device review. The previously found small-screen keyboard-focus issue remains outside this artwork change.
