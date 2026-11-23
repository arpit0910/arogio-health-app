---
name: Arogio
description: Stitch emerald and soft-mint care discovery, daily health and Jeeva.
colors:
  background: "#F7FAF7"
  surface: "#FFFFFF"
  ink: "#0A1F1B"
  muted: "#5C716A"
  placeholder: "#64776F"
  primary: "#087D65"
  primary-pressed: "#054F40"
  on-primary: "#FFFFFF"
  border: "#DCE7E2"
  subtle: "#EEF5F2"
  accent: "#7B3D45"
  accent-surface: "#EEE1E1"
  error: "#C93C3C"
  error-surface: "#FCE4E2"
  on-error: "#FFFFFF"
  secondary: "#006973"
  secondary-surface: "#D0F7FB"
  mint-surface: "#DCF3EC"
  rose-surface: "#FFDAD6"
  brand-surface: "#087D65"
  on-brand: "#FFFFFF"
  brand-soft: "#BDF3E2"
typography:
  headline:
    fontFamily: "PlusJakartaSans_700Bold"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "-0.4px"
  title:
    fontFamily: "PlusJakartaSans_600SemiBold"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "26px"
  body:
    fontFamily: "DMSans_400Regular"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "21px"
  row-title:
    fontFamily: "DMSans_500Medium"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
  detail:
    fontFamily: "DMSans_400Regular"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
  label:
    fontFamily: "PlusJakartaSans_600SemiBold"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "18px"
  button:
    fontFamily: "PlusJakartaSans_600SemiBold"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
  input:
    fontFamily: "DMSans_400Regular"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  navigation:
    fontFamily: "DMSans_500Medium"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "18px"
rounded:
  field: "16px"
  row: "20px"
  panel: "20px"
  banner: "18px"
  navigation: "10px"
spacing:
  compact: "8px"
  field-gap: "12px"
  row-gap: "14px"
  group-gap: "16px"
  page: "16px"
  setup-page: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    padding: "14px 20px"
  button-primary-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
    typography: "{typography.button}"
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
  care-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "18px 14px"
---
# Design System: Arogio

## Overview

The user-supplied Homepage.png and Homepage.svg (14 November 2026) are the governing visual reference for the entire app. They supersede the old UI/UX, earlier Stitch compositions and historical surface briefs. Soft-mint light surfaces support readable, welcoming care navigation. Dark mode is removed by the latest user instruction. Preserve the exact original Arogio logo, proportions and name. This is a scan of implemented tokens, not a declaration that all requested modules are complete.

## Colors

Frontmatter records `src/theme/tokens.ts` and `src/theme/AppearanceProvider.tsx`. The app is light-only: off-white canvas, white surfaces and emerald actions. Saved dark/system preferences are ignored. The appearance chooser and runtime dark palette are removed. Use active semantic palette values, including on-primary text and dedicated error pairs. Cyan secondary pairs support sleep and hydration, mint supports activity/care, and rose supports heart-rate and emergency contexts. The brand surface/on-brand/brand-soft trio keeps the emerald Jeeva banner consistent across themes. Never use a colored badge as evidence of medical verification.

## Typography

Plus Jakarta Sans semibold/bold supplies headings; DM Sans regular/medium supplies body and rows. Native tokens: heading 22/30 bold with -0.4 tracking, title 18/26 semibold, row 16/24 medium, body 14/21 regular, detail 12/18 regular, label 12/18 semibold, button/input 16/24. Buttons use the separate 16/24 role. Preserve system text scaling and Hindi readability. Native units are logical units; portable tokens use px notation.

## Layout

Shared content uses 16-unit page gutters and a 440-unit form/content constraint where applied; setup uses 24. Navigation moves to a left rail at 768. Small screens and enlarged text require wrapping rather than clipped labels. Minimum native touch areas are 48dp. First-run welcome has three panels and English/Hindi selection; permissions follow explicit actions rather than an automated welcome prompt.

## Elevation & Depth

Tonal layers and thin borders establish hierarchy. `appTheme.shadow` is empty. Sidebar blur belongs to the temporary overlay, not every card. Android emulator review images establish local composition evidence only; physical-device acceptance and iOS verification remain unestablished.

## Shapes

Shared fields/buttons use 16-unit corners; care rows and panels use 20, service tiles use 18 and banners use 18. Shared geometry lives in `ui` in `src/theme/tokens.ts`. Keep clipping within the surface and preserve legible borders in both themes.

## Components

The shared brand header uses the original logo, an 18/24 wordmark, city pill, notifications and profile photo or fallback icon on a surface background with a hairline divider. Its 68-unit row is capped at 880 units; the city pill is hidden below 360 units or at font scale 1.25 and above. Back routes use a title and back control.

Bottom navigation uses a surface background, 12/18 DM Sans labels, emerald selected icons and a raised 64-unit circular sparkle control for Jeeva AI. At 768 units it becomes a 96-unit left rail with a 56-unit Jeeva control.

Home uses 56-unit service tiles, 16-unit vital-card corners and 18-unit routine/provider/banner corners. Vital cards retain missing-reading footprints and stack at enlarged font scale; shortcut columns reduce from four to two. Home composition follows the newly supplied Homepage PNG/SVG: greeting, search, suggestions, emergency, eight services, vitals, water, medicines, Jeeva, hospitals, specialists, guides and trust. Supporting routes inherit the same visual system rather than copying every Home section. Authentication uses a clean white form panel on the shared canvas; the former decorative backgrounds and auth illustrations are retired.

Buttons use active-palette fill and on-primary content, a 52-unit base minimum and 14/20 padding. Busy and disabled controls block repeat actions. Fields retain visible labels and readable errors. Care rows support flexible copy and one clear destination. Main navigation labels are Home, Find Care, Jeeva AI, Health and Profile, with Jeeva in the centre. Profile remains private through its route guard; Discover and meditation remain reachable without tabs. Public care cards expose source and review information, call and external directions; their details retain share and correction actions when data supports them. Shared search uses a tinted field and explicit submit on Home. Personal medicine schedules expose confirmed dose logs, undo and due-dose snoozing, with notification access checked without a new prompt. No catalog entry, review badge, availability or health value may be fabricated. Existing trackers inherit shared tokens while retaining their source/permission semantics.

## Do's and Don'ts

- Do preserve the exact logo and use current semantic tokens across all screens.
- Do show real readings, explicit source attribution and honest empty/error states.
- Do keep clinical review, external service availability and native acceptance distinct from visual polish.
- Don't reintroduce Inter as the shared heading/body alias or the obsolete dark-default rule.
- Don't request permissions automatically during welcome or infer stock, booking slots or diagnosis.

## Supplied reference assets

The later three-screen splash upload supersedes the old LaunchArtwork composition. Opening scenes use the original logo, mint leaves/waves, independent rotating spiral/orbit layers and floating service cards, with skippable progression. Decorative leaf/wave accents include `#42CDA2`, `#B8F5D3`, `#149C92`, `#27BDB1` and `#A0ECB4`; these are illustration colors, not new control text colors. See `docs/animated-splash-screens.md` for motion timing and reduced-motion behavior.

The later `Profile Page.png` / `Profile Page.svg` upload governs Profile specifically. Use its compact identity card, three summary slots, grouped rows with circular icons and thin internal dividers, inline language selector, scheme information, paired helpline controls and red logout row. Preserve the shared header/navigation. Unsupported integrations show explicit unavailable states. Existing account tools remain in a collapsed group; see `docs/profile-page-redesign.md`.

`assets/homepage/reference-1.jpg` and `reference-2.jpg` are hospital artwork embedded in the supplied SVG, used only when an existing hospital entry matches SMS or EHCC by name. They do not create listings or establish verification. Reference guide images 5 and 6 are category covers, never clinical evidence. Fictional sample names, health readings, bed counts, star ratings and bookings in the mockup are not runtime defaults.

## Latest Login reference and light-only requirement

The uploaded Login.svg and Login.png now govern Login: extracted original leaf mark, verified-network pill, centred welcome copy, labelled tonal fields, password-recovery link, emerald Sign In, white Google action, paired information badges and legal/account footer. Login has no outer white card or Remember Me row. All uploaded page layouts remain visual targets; user-requested spiral card trajectories and city-neutral interface copy take precedence over static/reference city text. Runtime values continue to come from accounts and providers. Exact visual acceptance requires rendered comparison; source implementation and bundles alone do not establish a 100% pixel match.
