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
  section: "32px"
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

Primary forest green marks actions and focused/selected controls; its pressed companion supplies feedback. Warm background and off-white surface separate canvas from controls. Ink is for headings; muted and placeholder tones support secondary information. Border and subtle provide quiet divisions and grouped surfaces. Plum and its pale surface identify supporting status such as Coming soon; error remains reserved for invalid input.

**The Action Rule.** Use forest green for available primary actions and retain explicit text for unavailable services.

## Typography

The frontmatter records the reusable Inter roles currently used by CareUI and navigation. Headline tracking is -0.7 logical units. The compact brand wordmark uses Inter semibold at 24 with the same tracking; launch uses 44/56 with -1.2 tracking. Plus Jakarta Sans semibold remains the authentication heading font; DM Sans regular remains its subtitle font. Do not silently replace those existing font bindings.

React Native measurements are logical units; portable frontmatter uses px notation. Keep default system font scaling enabled.

## Layout

App content is centered with a 440-unit maximum width and 24-unit horizontal padding. AppScreen supplies safe areas, keyboard avoidance and a growing ScrollView. Setup uses the same bounded width, a four-segment progress indicator for three required profile steps followed by optional reminders, and a separate footer action. Rows use 18-unit vertical padding, a flexible text column and a trailing icon. Shared CareUI sections and tracking groups start 32 units apart. Home section headings use 32 units above and 16 below; nested water headings omit that outer spacing.

Bottom navigation is bounded to the same width, retains native bottom insets and exposes Home, Health, Jeeva AI, Explore and Profile. Jeeva AI retains its original raised centre artwork and label. The navigation container is transparent, without a top border or selected-tab pill. Selected standard tabs use primary-colored filled icons and labels; Jeeva AI retains its selected artwork outline. At widths of 768 units and above, navigation becomes a 96-unit side rail. Authentication retains its reference-scaled AuthCanvas; original decorative backgrounds appear only in light mode, while monochrome icons follow the palette and action arrows use onPrimary; welcome, login and signup each have a distinct content-specific flat-vector illustration. Water and cycle tracking use their own matching vector scenes. Sources live in assets/illustrations/vector; render through CareIllustration. Artwork scales without shrinking form controls or adding pagination dots.

**The One Task Rule.** Group related information behind clear rows or disclosures; retain one personal Edit profile action and a separate Goals & preferences destination.

## Elevation & Depth

The new app world is flat: appTheme.shadow is empty. Dividers, tonal differences and the forest profile panel establish hierarchy without a card-shadow stack. Do not introduce decorative elevation to every group.

## Shapes

Fields and shared buttons use the field radius; the profile panel uses the panel radius. Borders are thin and quiet. Native controls retain at least 48dp touch targets through TouchTarget and the canvas-aware controls.

## Components

- **Button:** full width, 14 vertical/20 horizontal padding, primary and outlined secondary variants. Pressed colors come from source tokens. Busy and disabled states block activation and use opacity 0.55; busy replaces content with an indicator. The source base height is 52, with the actual minimum supplied by the touch-target context.
- **Field:** off-white fill, rounded outline, primary focus and error outline. Preserve labeled input, keyboard behavior and password visibility affordances.
- **CareRow:** medium title, optional smaller supporting copy and trailing chevron; whole row activates one destination.
- **CareDisclosure:** thin top divider, expanded accessibility state and initially collapsed content; no nested decorative card frame.
- **Profile panel:** forest fill, white title and supporting light text; a separated action row leads to profile.
- **Navigation:** five labeled tabs with an explicit accessible selected state, transparent canvas and no selected pill. Jeeva AI uses its original prominent centre artwork; the other tabs use 24-unit icons. Shared AppHeader uses one fixed top row on completed-profile signed-in destinations: a 48-unit menu target at left, the centered brand and a 48-unit notification bell target at right. Detail pages place back navigation and title in a separate second row; the menu never swaps sides. Home uses this same header. The header profile shortcut is removed because Profile remains in the sidebar and bottom navigation. Root navigation, native SystemUI canvas and screen content follow the active background; Android navigation and status icons follow the scheme, with navigation-bar contrast enforcement disabled.
- **Setup:** three required steps for goals, essential basics and activity, then an optional reminders stage. Permission requires an explicit Allow notifications action; skipping or denying access leaves completion available. Validation and save feedback remain inline. Optional account details and updates belong in settings.
- **Activity journal:** flat metric rows show value, units, source and a focused Log action. Recent-week dates use accessible radio controls, a selected underline and primary value color; an older-date calendar sits behind a disclosure. Home and Health show connected-app readings in Today's activity when a health source is connected, with its source name and a route to Activity trends. Otherwise they show Arogio entered totals and supported foreground phone steps. Missing connected readings say Not shared; missing manual entries say Not logged. Imported and entered readings remain separate. The duplicate seven-day steps chart is removed from Home; trend charts remain on dedicated activity and connected-health pages. Explicit source navigation is respected. Reuse existing tokens and shared controls; see `docs/standalone-tracking.md`.
- **Profile:** centered 88-unit avatar, live name/email/city, one Edit profile action, and a wrapping measurement strip for weight, height and BMI. Flat groups lead to goals, personal details, settings and connected health. The personal referral code and native share action remain visible. Log out and Delete account are separated at the end of the page; deletion opens an explanatory confirmation screen with an unchecked acknowledgement and disabled destructive action until confirmed.
- **Sidebar:** a same-window overlay blurs the main content through Expo BlurTargetView at intensity 45, with a dark dim layer and an opaque palette-backed panel. The background cannot receive touches or accessibility focus while open. Android back, the close control and the backdrop dismiss it; animation uses 200ms open/160ms close and zero duration with reduced motion. Blur communicates a temporary navigation layer, not decorative glass.
- **Notification inbox:** the header bell shows an unread badge and opens an account-scoped on-device reminder history. Rows show real reminder title, body, time and read state, with a route back to water, medicines or cycle tracking. Scheduled reminders appear when due; this does not assert delivery or completion. Retain up to 120 recent past entries within 90 days and up to 60 pending reminders separately; marking read is monotonic. Settings remains a separate destination.
- **Setup city:** the basics step requests foreground location permission to fill the city from reverse geocoding. Only the city is saved in profile data; coordinates are not sent to Arogio. Manual entry and continuing without location remain available after denial, timeout or lookup failure. A separate Use my location action retries; this is not ongoing location tracking.
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
