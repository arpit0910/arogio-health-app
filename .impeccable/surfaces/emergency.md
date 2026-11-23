---
version: 1
slug: emergency
primary_target: src/features/directory/EmergencyScreen.tsx
related_targets: [src/app/(account)/emergency.tsx]
---

# Emergency contacts

Mode: Operate. Preserve the established emerald/mint themes and Inter type. Show the India emergency contact first with a readable 112 and an explicit call action using the shared primary button. The ambulance contact follows with its own full-width primary call button and ambulance icon, followed by grouped nearby and manual blood bank search actions. Both contacts inherit Home tonal surfaces and emerald/mint actions; reserve error colors for actual failures. Preserve the existing verified number descriptions and state availability qualification. Calls open the device dialer only after an explicit tap. Dialer failure appears next to the chosen number. Keep full text, flexible wrapping and native minimum touch areas.

Source checks: lint and typecheck pass. React Native Web compositions reviewed at 390 dark and 320 light widths; native calling and location remain unverified.
