---
version: 1
slug: "src-features-home-homescreen-tsx"
primary_target: "src/features/home/HomeScreen.tsx"
related_targets: ["src/features/home/homeModel.ts","src/features/wellness/WellnessContext.tsx","src/navigation/AppNavigation.tsx","src/navigation/AuthenticatedLayout.tsx"]
---

# Growing Well: daily Home

Mode: Operate. Scope: the authenticated mobile Home screen and its adaptive navigation placement. This is a functional refinement inside the established Growing Well visual system, not a replacement identity. Preserve Arogio's name/logo, Jeeva AI's prominent artwork entry (centre on phones, in the rail on expanded layouts), authentication illustrations and account/API behavior. The user explicitly chose a private cycle shortcut instead of cycle information on Home.

## Direction contract

THESIS: Put today's useful actions first: see saved hydration progress, log a drink or open a tracker without navigating through promotional copy or profile disclosures.

OWN-WORLD: Inherit the existing warm canvas, forest-green actions, plum supporting accents and Inter typography from the shared tokens. Home uses a compact app bar, one bordered hydration surface, small labelled shortcuts and divided task/activity rows. No new palette, imagery system or decorative motion is introduced.

STORY: Arrive at today's saved plan, log a preferred serving with confirmation and Undo, or open Water, private Cycle, Profile or Goals. See up to two upcoming drinking tasks and the three most recent drinks for the current waking day. Pull down to refresh. If a plan does not exist, open its setup; if loading fails, show recovery rather than invented activity.

FIRST VIEWPORT: Fixed Arogio app bar and profile avatar, a compact personal greeting/date, then today's water progress and a direct Log serving action (or the real setup/loading/error state) before secondary shortcuts. Phones retain bottom navigation; expanded layouts use a left rail and two-column Home. Exact fold placement at native sizes and enlarged text requires captured device evidence.

FORM: A native task dashboard with safe areas, a fixed app bar, scrollable daily content and pull-to-refresh. At 768 logical units or wider, navigation moves left and Home expands to a two-column composition bounded at 1100 units. Loading, ready and setup containers have distinct keys so loading accessibility state does not persist into the ready view. The original Growing Well direction remains the visual authority (seed:e6073cd8d511dd7a); its earlier profile-promotion first viewport is superseded for Home by the user's request for usable daily actions. No marketing hero, profile accordion, fabricated statistics or unavailable-service promotion is part of this Home composition.

FINISH: Source lint/typecheck and the local Android rebuild pass. Scoped local Android logging/Undo and the ready accessibility-state check pass. Phone, small-phone enlarged-text, tablet and system-night recaptures and the final review remain in progress; no final visual, iOS, hardware or production sign-off is claimed. Documentation preserves the incumbent DESIGN.md and sidecar for this local extension; their pre-existing drift is reported rather than repaired as a side effect. No new raster asset is introduced by Home.

## Mobile dashboard and sidebar update

The user requested a more native-feeling Home and approved a slide-out sidebar alongside existing bottom tabs. Extend Growing Well with a compact fixed app bar (menu, original brand, avatar), greeting/date, four care shortcuts before the water action, a single tonal water surface with real progress and direct logging, and one combined list of up to three future water/medicine schedule times. Preserve water log retry/Undo, empty/loading/error recovery and pull refresh. Do not imply medication adherence or show cycle records on Home. Connected health remains an explicit destination rather than silently importing device readings into Home.

The sidebar contains primary destinations, care tools, account destinations and Log out. It scrolls independently, honors safe areas and reduced motion, closes before navigation, and supports backdrop, explicit close and Android Back. Keep the bottom tabs and existing expanded-screen rail. This request extends the incumbent visual world; it does not replace it or change authentication, reminder persistence, API routes or the original Jeeva artwork.

Source checks and tests are recorded with the build. Historical Home captures remain incumbent evidence only; they do not verify the new screen. Current live visual verification depends on reconnecting the native UI host.
