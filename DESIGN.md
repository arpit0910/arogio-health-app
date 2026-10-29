---
name: Arogio
description: Reference-led emerald health and everyday care.
colors:
  background: "#F3F8F0"
  surface: "#FFFFFF"
  ink: "#203E32"
  muted: "#586357"
  placeholder: "#687064"
  primary: "#126349"
  primary-pressed: "#173D2D"
  on-primary: "#FFFFFF"
  border: "#D0DFD3"
  subtle: "#E3F0E4"
  accent: "#7B3D45"
  accent-surface: "#EEE1E1"
  error: "#A42A36"
  error-surface: "#F8E9E8"
  dark-background: "#00291E"
  dark-surface: "#0C3B30"
  dark-ink: "#F4FAF5"
  dark-muted: "#B8D0C4"
  dark-placeholder: "#A4C0B1"
  dark-primary: "#79E6BB"
  dark-primary-pressed: "#5BCBA0"
  dark-on-primary: "#003728"
  dark-border: "#2A5546"
  dark-subtle: "#164C3B"
  dark-accent: "#BDB3F7"
  dark-accent-surface: "#303D59"
  dark-error: "#FFAFBB"
  dark-error-surface: "#502C35"
  shortcut-water: "#BEE2F7"
  shortcut-medicines: "#F4C4D1"
  shortcut-cycle: "#FAE2B8"
  shortcut-activity: "#C8C8FB"
typography:
  headline:
    fontFamily: "Inter_600SemiBold"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: "38px"
    letterSpacing: "-0.7px"
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
  row: "14px"
  panel: "16px"
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
    typography: "{typography.label}"
    rounded: "{rounded.field}"
    padding: "14px 20px"
  button-primary-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
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
  care-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "18px 14px"
---
# Design System: Arogio

## Overview

**Creative North Star: "Growing Well - the supplied emerald Home reference"**

The user's 29 October 2026 Home screenshot is the visual authority for the app refresh. Deep emerald grounds, mint actions, rounded tonal cards, pastel care shortcuts and illustrated wellness artwork replace the earlier warm, flat-only interpretation. The Arogio name and original logo remain unchanged. Health records and daily care have equal product priority.

**Key Characteristics:**

- Emerald dark canvas with mint actions; mint-white light counterpart.
- Rounded, readable task cards with clear spacing and crisp Inter typography.
- Pastel water, medicine, cycle and activity shortcuts.
- Real raster banner and water artwork, with live text and real recorded values.

This user-pinned direction supersedes earlier no-raster and no-tile guardrails. Source authority is `src/theme/tokens.ts`, `AppearanceProvider.tsx`, `CareUI`, `Button`, `AppScreen`, Home and TodayActivity. The reference is `WhatsApp Image 2026-10-29 at 9.53.18 PM.jpeg`; operational details and evidence are in `docs/reference-home-admin.md`.

## Colors

The frontmatter records the light palette and the actual dark variants from AppearanceProvider. Emerald is the ground and action family; mint is the dark-mode action color. Text, borders and secondary copy always use the active palette. New installations default to dark; a stored light, dark or system preference is preserved.

Home shortcuts use the four recorded pastel fills, dark labels and category icons in both schemes. Errors retain the dedicated error pair. Imported activity source colors are supporting data cues, not replacements for readable labels.

**The Data Rule.** Values, progress rings and weekly bars come from saved goals and readings. Missing data remains visibly missing; sample temperatures and health totals do not ship as fallback data.

## Typography

CareUI uses Inter regular, medium and semibold with the recorded roles. The banner uses Inter bold for live copy. The brand uses Inter semibold at 24 with -0.7 tracking; Home greeting is 26/34. Plus Jakarta Sans and DM Sans remain existing authentication bindings. Native measurements are logical units; portable tokens use px notation. Preserve system font scaling.

## Layout

Shared app content is centered at a 440-unit maximum width with 16-unit horizontal padding. Setup/access screens retain 24-unit padding. Sections generally separate by 32 units; tight controls use 8-14 units. CareRow has a 14-unit radius, 14 horizontal/18 vertical padding and an 8-unit top gap.

Home orders greeting/date and city weather, banner, care shortcuts, Today's activity, daily water care, upcoming care and recent records. Shortcuts are four across at normal widths and two columns below 360 units or with enlarged text. Activity cards adapt their type/flow at narrow widths. At 768 units, Home can expand into columns and bottom navigation becomes a 96-unit rail.

Three profile steps cover goals, basics and activity. A separate once-per-account access setup follows profile completion. One explicit action runs the OS requests sequentially; optional access can be skipped. Settings contains the central access destination. Native touch targets remain at least 48dp through shared controls.

## Elevation & Depth

Tonal layering, rounded surfaces and artwork provide depth; `appTheme.shadow` remains empty. Blur is reserved for the temporary sidebar overlay. Do not add a decorative shadow stack to every card.

## Shapes

Shared fields/buttons use 12-unit corners, care rows 14, Home cards 16 and the banner 18. Cards clip artwork to their own silhouette. Borders are thin and palette-backed. Progress geometry represents actual goals; missing weekly readings remain gaps.

## Components

- **Button:** full width, 52-unit base minimum, 14/20 padding, active-palette primary and secondary variants. Busy/disabled actions block activation. Use onPrimary for content on a filled action.
- **Field and CareRow:** labeled theme-backed fields; flexible row copy and trailing chevron. Whole row activates one task. Disclosure retains its expanded state and divider.
- **Header/navigation:** one fixed signed-in top row has menu left, centered original Arogio brand and notification bell right. Back/title sit in a second row. Five labeled tabs retain the raised original Jeeva artwork; bottom navigation remains transparent.
- **Sidebar:** same-window BlurTargetView overlay at intensity 45, dark dim layer and opaque themed panel. Background touch/accessibility traversal are suppressed. Back, close and backdrop dismiss; reduced motion removes animation.
- **Home banner:** generated landscape background with live bold text is the built-in fallback. Published server banners can replace it; only allowlisted app routes are actionable. Multiple banners have accessible selection controls. Failed/unavailable content keeps the built-in artwork.
- **Weather:** city and current Celsius temperature come from the backend weather provider. Missing city/data shows an unavailable value, never a sample temperature. Date uses the app's IST calendar. City is editable in Profile.
- **Today's activity:** three tonal cards show steps, movement and sleep, real targets and last-seven-day readings. Connected app data is authoritative when connected; otherwise entered totals and supported foreground phone steps are used. Sources are not summed. Missing imported values say Not shared; manual gaps say Not logged.
- **Daily water care:** saved amount/target, actual plan status and one working log action sit on a tonal card with transparent glass artwork. Progress is not an intake recommendation.
- **Profile:** centered 88-unit avatar, live identity/city, one Edit profile action and wrapping measurements. Grouped controls lead to preferences, connections and referrals. Account deletion has a separate unchecked acknowledgement; soft-deleted records stay retained and verified sign-in recovery lasts 30 days.
- **Access setup:** notification, motion, city location and an optional selected Health Connect source are explained together, then requested through the platform dialogs. Declining optional access leaves tracking usable. Tracker saves check existing permission without prompting again. Only city is saved; no ongoing location tracking is implied.
- **Automatic updates:** active connected health reads run every 30 seconds and on resume; wellness refreshes every 60 seconds. Pull-to-refresh remains available. Optional Android background scheduling has a minimum 15-minute interval and may be delayed. Phone steps count only while Arogio is open.
- **Backend administration:** the super-admin browser portal is served by the backend at `/admin`, never as mobile screens. It has a distinct restrained desktop layout using the Arogio green family. Its account, content and audit behavior is documented in the backend's `SUPER_ADMIN.md`.

Existing native splash/auth illustration details remain in `docs/launch-screens.md`. Documentation snippets and synthetic Web captures translate native composition; they do not establish device acceptance or production release readiness.

## Do's and Don'ts

- Do preserve the original Arogio name/logo and the user-pinned emerald reference.
- Do carry active theme tokens, rounded task surfaces and readable spacing across app pages.
- Do preserve real source labels, missing-data states and permission-denial paths.
- Do keep administrative UI exclusively in the backend browser portal.
- Don't invent weather, health values, completion or live delivery claims.
- Don't repeat permission and refresh prompts throughout trackers.
- Don't treat synthetic Web previews as native permission, sync or rendering verification.
