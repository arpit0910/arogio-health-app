---
name: Arogio Authentication
description: Figma-derived mobile authentication components for Arogio.
colors:
  background: "#FFFFFF"
  ink: "#0D1F33"
  muted: "#5E6D7E"
  placeholder: "#6C7A89"
  primary: "#096E64"
  primary-pressed: "#07574F"
  border: "#E5E9F0"
  subtle: "#EFF9F6"
  error: "#A42A36"
typography:
  headline:
    fontFamily: "PlusJakartaSans_600SemiBold"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "36px"
  subtitle:
    fontFamily: "DMSans_400Regular"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  body:
    fontFamily: "Inter_400Regular"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "23px"
  label:
    fontFamily: "Inter_600SemiBold"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "21px"
rounded:
  checkbox: "4px"
  field: "12px"
  pill: "999px"
spacing:
  icon-gap: "8px"
  form-gap: "12px"
  divider: "16px"
  heading: "20px"
  page: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  field:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
  legal-notice:
    backgroundColor: "{colors.subtle}"
    textColor: "{colors.primary}"
    rounded: "{rounded.field}"
    padding: "14px"
---

# Design System: Arogio Authentication

## Overview

The implemented authentication system follows the pinned Figma welcome, login, and signup screens: white surfaces, deep teal actions, centered identity, and restrained health-themed SVG artwork. The interface supports focused account tasks with reusable fields, actions, headings, and consent controls.

Scope is authentication, recovery, and supporting legal pages. The existing dashboard has not been fully migrated to this system. The intended large user base motivates reusable components; this document makes no backend capacity claim.

**Key Characteristics:**

- White canvas with teal actions and dark ink text.
- Rounded fields and pill-shaped buttons.
- Original Figma SVG artwork preserved as assets.
- Mobile-first scrolling forms with accessible control targets.

Source of visual authority: [Figma file](https://www.figma.com/design/HiE5MnlxledF8gAsJfy3kK?node-id=119-68936), welcome `119:68667`, signup `119:68809`, and login `119:68936`. The pinned local references are `C:/Users/arpit/Downloads/Container_align.png` and `Container_align.svg`; preserve their composition and original artwork. Implementation authority: `src/theme/tokens.ts`, `src/components/ui/Button.tsx`, `src/features/auth/components/`, and `src/features/legal/`. Original SVGs live in `assets/auth/`; their serialized counterparts are in `authAssets.ts`.

## Colors

The frontmatter records the actual source palette. Primary teal identifies actions, links, focused fields, and selected checkboxes; its darker companion is the pressed state. Subtle mint supports pressed secondary actions and legal draft notices.

Neutral white forms the canvas. Ink supports headings and input text; muted slate supports secondary copy, and placeholder slate distinguishes empty fields. Pale borders separate controls and social sections. Error red identifies invalid fields and form feedback. Do not introduce additional accent families when extending authentication without a design requirement.

## Typography

Plus Jakarta Sans semibold is the heading face. DM Sans regular supplies the authentication subtitle. Inter supplies controls, body copy, branding, links, and supporting labels; do not treat the token named `fonts.body` as the universal body face, because it currently names the subtitle font.

The frontmatter records headline, subtitle, legal body, and primary button label roles. Fields use Inter regular (13px); secondary buttons use Inter semibold (13px). Small links and consent copy use Inter (11.5px), with underline on inline links. Form errors use Inter regular (12px, 18px line height). The wordmark uses Inter bold (28px, 42px line height, -0.7px letter spacing). Legal section headings use Inter semibold (17px, 25px line height).

Keep default system font scaling enabled. These measurements describe React Native logical units; frontmatter uses px notation for portable tooling.

## Layout

Authentication uses a canonical 326 by 678 content canvas, derived from the 326 by 714 Figma frame with its 36-unit mock status bar removed. Native safe areas and native system chrome sit outside that canvas; do not draw an iPhone status bar on Android. Canvas scale follows available width with a 420dp cap and a height constraint. Larger windows retain a centered, bounded phone composition.

AuthCanvas combines safe-area handling, keyboard avoidance, and a growing ScrollView. Its decorative SVG background is clipped separately into upper and lower regions. Content and artwork share the reference scale; touch targets compensate for it. Forms retain a 12-unit gap and 24-unit horizontal padding. Welcome actions follow the illustration and pagination as a group rather than stretching into tablet space.

Keep native font scaling enabled. Headings may wrap at enlarged system font settings, footers wrap, and content can grow and scroll under large text or the keyboard. These canonical dimensions are reference coordinates rather than fixed physical text or touch sizes.

Legal pages share the type and color system, with a maximum content width of 600, padding of 24, and bottom padding of 48. Recovery reuses the authentication shell. Navigation uses Expo Router and app routes for login, signup, recovery, Terms, and Privacy.

## Elevation & Depth

The canvas and fields remain flat. Buttons provide the small amount of depth: primary uses `0px 6px 12px rgba(9,110,100,0.22)`; secondary uses `0px 2px 4px rgba(15,31,46,0.05)`. Avoid promoting these action shadows to every surface. SVG artwork supplies the remaining visual atmosphere.

## Shapes

Fields and notice panels share gently rounded corners through the field radius. Buttons use the pill radius. Checkboxes have compact rounded square geometry (18 by 18), with their touch area extended beyond the visible mark. Fields have a single-unit outline; focus changes it to primary and invalid state changes it to error.

## Components

- **Button:** shared primary and secondary variants, full width, canonical minimum height `max(44, 48 / canvasScale)`, optional leading/trailing content. Pressed backgrounds follow the palette. Loading replaces content with an activity indicator; loading and disabled states block activation and use opacity 0.55. Accessibility exposes button, busy, and disabled states.
- **AuthField:** icon-led, canonical minimum height `max(44, 48 / canvasScale)`, left padding 14, and input padding 10. It accepts native input props and forwards focus/blur. Password visibility uses a labeled control with minimum dimensions `48 / canvasScale` plus hitSlop. Focus and invalid outlines remain visible; invalid styling takes precedence.
- **AuthHeading:** centered title and subtitle, with subtitle spacing of 6. Titles expose heading semantics.
- **Checkbox:** visible square with teal outline, teal checked fill, and white check. The control is 48 canonical units wide with a scale-aware `48 / canvasScale` minimum height; the visible mark stays compact. Expose checked and disabled state. Signup consent links remain independently navigable.
- **SocialDivider:** two fine neutral rules around a small centered label. Social sign-in uses the secondary button language and original Google artwork.
- **FormError:** error-colored text with alert semantics and a polite live region. Preserve error information through validation and submission.
- **AuthShell:** owns identity, back action, decorative backgrounds, safe area, keyboard behavior, and centered scrolling content. Back actions use 48-unit targets; footer links use the shared scale-aware 48dp minimum height.
- **LegalScreen:** scrollable heading, mint draft notice, and section text. Terms and Privacy are explicit drafts awaiting approved policy content.

AuthCanvas supplies the scale context through `TouchTargetScale`; shared fields, buttons, visibility actions, consent controls, and footer links compensate to retain a physical 48dp minimum.

The sidecar contains isolated HTML/CSS previews of these React Native visual patterns; it is documentation, not an additional production component source. Browser preview verification does not substitute for iOS/Android device testing. Native Google sign-in uses the shared Web client ID on Android and an additional iOS client ID on iPhone; live verification and Google Cloud registration remain pending (see `docs/google-sign-in.md`). Recovery has no available backend endpoint. Legal text remains unapproved for public launch.

## Do's and Don'ts

- Do reuse the shared tokens and authentication components when extending account flows.
- Do preserve the original SVG assets and their proportions.
- Do retain keyboard scrolling, default font scaling, and accessible touch areas.
- Do keep legal drafts visibly labeled until approved content replaces them.
- Don't claim native device verification from browser previews.
- Don't describe the unrelated dashboard as fully migrated.
- Don't imply recovery delivery, Google native configuration, or backend scale has been verified.
