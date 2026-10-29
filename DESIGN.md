---
name: Arogio
description: Growing Well ? a personal companion for health and wellbeing.
colors:
  background: "#FFFDFA"
  surface: "#FFFDFA"
  ink: "#203E32"
  muted: "#586357"
  placeholder: "#687064"
  primary: "#214F3D"
  primary-pressed: "#173D2D"
  border: "#D8DCCF"
  subtle: "#E7EDDF"
  accent: "#7B3D45"
  accent-surface: "#EEE1E1"
  error: "#A42A36"
  error-surface: "#F8E9E8"
typography:
  headline:
    fontFamily: "Inter_600SemiBold"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: "38px"
  title:
    fontFamily: "Inter_600SemiBold"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
  body:
    fontFamily: "Inter_400Regular"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "23px"
  row-title:
    fontFamily: "Inter_500Medium"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "23px"
  detail:
    fontFamily: "Inter_400Regular"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Inter_600SemiBold"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "23px"
  navigation:
    fontFamily: "Inter_500Medium"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "18px"
rounded:
  field: "12px"
  panel: "16px"
  navigation: "10px"
spacing:
  compact: "8px"
  field-gap: "12px"
  row-gap: "14px"
  group-gap: "16px"
  panel: "22px"
  page: "24px"
  section: "28px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.field}"
    padding: "14px 20px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "14px 20px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
  profile-panel:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.panel}"
    padding: "22px"
---
# Design System: Arogio

## Overview

**Creative North Star: "Growing Well"**

Cream white, forest-green actions and a restrained plum accent make everyday care feel approachable. Health management and daily wellness carry equal weight. Quiet grouped rows and progressive disclosure support one clear task at a time.

**Key Characteristics:**

- Cream-white canvas and flat tonal surfaces.
- Forest-green actions, dark green ink and restrained plum status accents.
- Crisp sans typography, grouped lists and modestly rounded controls.
- Original Arogio logo; code-led composition without new shipping raster artwork.

This refresh supersedes the former authentication-only reference as the visual world. Source authority is `src/theme/tokens.ts`, `src/theme/appTheme.ts`, `CareUI`, `Button`, `AppScreen`, Home, Profile, setup and launch components. The selected first-surface contract remains in `.impeccable/surfaces/src-features-home-homescreen-tsx.md`.

## Colors

Primary forest green marks actions and focused/selected controls; its pressed companion supplies feedback. Warm background and off-white surface separate canvas from controls. Ink is for headings; muted and placeholder tones support secondary information. Border and subtle provide quiet divisions and selected navigation. Plum and its pale surface identify supporting status such as Coming soon; error remains reserved for invalid input.

**The Action Rule.** Use forest green for available primary actions and retain explicit text for unavailable services.

## Typography

The frontmatter records the reusable Inter roles currently used by CareUI and navigation. Headline tracking is -0.7 logical units. The compact brand wordmark uses Inter semibold at 24 with the same tracking; launch uses 44/56 with -1.2 tracking. Plus Jakarta Sans semibold remains the authentication heading font; DM Sans regular remains its subtitle font. Do not silently replace those existing font bindings.

React Native measurements are logical units; portable frontmatter uses px notation. Keep default system font scaling enabled.

## Layout

App content is centered with a 440-unit maximum width and 24-unit horizontal padding. AppScreen supplies safe areas, keyboard avoidance and a growing ScrollView. Setup uses the same bounded width, a three-segment progress indicator and a separate footer action. Rows use 18-unit vertical padding, a flexible text column and a trailing icon.

Bottom navigation is bounded to the same width, retains native bottom insets and exposes Home, Health, Jeeva AI, Explore and Profile. Jeeva AI retains its original raised centre artwork and label. The other selected tabs use a subtle rounded background. Authentication retains its reference-scaled AuthCanvas and original decorative backgrounds; welcome, login and signup each have a distinct content-specific flat-vector illustration. Water and cycle tracking use their own matching vector scenes. Sources live in assets/illustrations/vector; render through CareIllustration. Artwork scales without shrinking form controls or adding pagination dots.

**The One Task Rule.** Group related information behind clear rows or disclosures; retain one personal Edit profile action and a separate Goals & preferences destination.

## Elevation & Depth

The new app world is flat: appTheme.shadow is empty. Dividers, tonal differences and the forest profile panel establish hierarchy without a card-shadow stack. Do not introduce decorative elevation to every group.

## Shapes

Fields and shared buttons use the field radius; the profile panel uses the panel radius. Navigation selection uses the navigation radius. Borders are thin and quiet. Native controls retain at least 48dp touch targets through TouchTarget and the canvas-aware controls.

## Components

- **Button:** full width, 14 vertical/20 horizontal padding, primary and outlined secondary variants. Pressed colors come from source tokens. Busy and disabled states block activation and use opacity 0.55; busy replaces content with an indicator. The source base height is 52, with the actual minimum supplied by the touch-target context.
- **Field:** off-white fill, rounded outline, primary focus and error outline. Preserve labeled input, keyboard behavior and password visibility affordances.
- **CareRow:** medium title, optional smaller supporting copy and trailing chevron; whole row activates one destination.
- **CareDisclosure:** thin top divider, expanded accessibility state and initially collapsed content; no nested decorative card frame.
- **Profile panel:** forest fill, white title and supporting light text; a separated action row leads to profile.
- **Navigation:** five labeled tabs with an explicit selected state. Jeeva AI uses its original prominent centre artwork; the other tabs use 24-unit icons.
- **Setup:** goals, essential basics and activity; validation and save feedback remain inline. Optional account details and updates belong in settings.
- **Launch:** the native splash uses the warm background and existing Android foreground icon (configured image width 192), before a single JavaScript surface with the original SVG logo and live text on cream white. The native screen is held until fonts and the first layout are ready; the overlay exits when the session is restored. Motion honors reduced-motion preferences; see `docs/launch-screens.md`.

The sidecar's isolated HTML/CSS snippets translate native visual patterns for documentation. They are not production web components. Native captures and finish review are separate evidence; this document makes no rendered QA or release verdict claim.

## Do's and Don'ts

- Do preserve the Arogio name and original logo proportions.
- Do reuse shared tokens, keyboard scrolling, font scaling and accessible control targets.
- Do distinguish available actions from services labeled Coming soon.
- Don't return to decorative tile walls or repeated edit controls.
- Don't treat documentation previews as native rendered verification.
- Don't imply reminders, records or daily tracking are available before implementation.

Daily tracking uses the existing palette and grouped layout. Save feedback pairs an icon with text; destructive actions use the error color and error surface. Shared buttons wrap long labels and retain at least 52 logical units. Water progress represents saved logs against the user-selected target, not a recommended intake.
