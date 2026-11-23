# Home and directory fixes

2 November 2026.

Home now requests the latest three published articles using the existing newest sort. The prior random sort required backend deployment; this removes that dependency from Home. The hosted API has not been authenticated or verified in this task.

Daily care shows Water, Medicines, Cycle and Activity with equal visual emphasis. The standalone water hero, setup promotion and water-only recent history were removed from Home; water tracking remains in its dedicated screen.

Emergency opens a dedicated screen with India emergency contacts (112 and 108), explicit dialer actions, nearby blood banks and manual city search. Numbers verified against https://112.gov.in/about and https://nhm.gov.in/nhm_live/index1.php?lang=1&level=2&lid=189&sublinkid=1217 on 2 November 2026. It does not automatically place calls.

Blood bank search is visible immediately; optional filters stay in a disclosure. Results have separated surfaces, phone and directions icons, legible selected filter text and pagination only when needed. Pull-to-refresh now reports its active state.

Validation: app lint/typecheck and 120 tests passed; backend directory integration suite passed all five tests. Static React Native Web compositions inspected at 320 light and 390 dark logical widths; these use fixture records. Device calling, location, native layout and the deployed API still need runtime verification. No APK build or deployment performed.

The design detector reported only two existing Home shortcut color advisories. Existing product/design context drift was left unchanged.

## Emergency UI refinement

The 112 contact now has a large readable number and a semantic emergency call button. The 108 ambulance contact uses a compact secondary action, with flexible wrapping. Nearby and city blood bank searches share one divided action group. Existing factual copy and routes are preserved. Dialer failures appear beside the chosen number and repeated in-flight taps are suppressed.

Reviewed React Native Web compositions at 390 dark and 320 light widths, plus 320 light Hindi. Typecheck and lint pass; the design detector returns no findings for EmergencyScreen. No new native build or device calling verification.

## Ambulance action and Home theme alignment

Replaced the compact custom ambulance control with the shared full-width primary Button. Explicit English and Hindi labels identify the service and number. Added a matching SVG ambulance icon. Both contact surfaces now use the active Home emerald/mint palette, consistent 32-unit number type, and the same spacing and button behavior as the rest of the app. Error colors are reserved for dialer failures. Previewed dark/light layouts, including the 320-unit-wide ambulance action.
