# Profile setup implementation

The Growing Well redesign uses three tasks: goals, essential basics (date of birth, weight and height), then activity level. The original Arogio name and SVG logo remain; the new setup is code-led rather than a reproduction of the former eight-screen Body reference.

`src/app/setup-profile.tsx` is the authenticated setup route. Users without `profileCompletedAt` are sent here; completed users continue to Home. Signed-out access returns to signup. `resumeSetup` chooses the first incomplete required task from saved values rather than replaying optional steps.

Continue validates and saves through `PATCH /users/me/setup`. The payload retains server compatibility by mapping the third task to legacy step 7 and sending `complete: true`. Final success is shown only after persistence; a one-second timer then replaces the route with `/home`. Failed saves retain the task and draft with a retryable error; duplicate submission is blocked. In-memory back navigation preserves values, and reopening resumes from saved data. Unit changes convert the entered measurement.

Optional personal details, referral/location fields and notification/update preferences are outside required onboarding. Profile provides one personal Edit profile action and one Goals & preferences row. New users default updates opt-in to false; existing stored consent is preserved. Preferences store choices and do not establish notification delivery.

Shared tokens, CareUI, Button, profile fields and choice primitives provide warm neutral surfaces, forest actions, keyboard scrolling, default font scaling and accessible targets. Backend migration/API details remain in `D:/arogio_health_backend/PROFILE_SETUP.md`; deploy the matching backend before relying on the hosted API.

This document records source behavior. Native screenshot capture and finish review are separate, pending evidence; no rendered fidelity, physical-device verification or shipping verdict is claimed here.
