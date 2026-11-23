# Sitemap and flows

See [information architecture](arogio-information-architecture.md) for the incumbent route inventory.

New public domain routes: /hospitals, /hospitals/[id], /doctors, /doctors/[id], /medicine-library, /medicine-library/[id]. Each has a separate feature folder and reuses shared source-reviewed search/detail primitives. Legacy /care/[id] remains supported.

| Journey | Path and state |
|---|---|
| 1 Guest care | Welcome -> Browse as guest -> Home -> Find Care |
| 2 Hospital | Home -> Find Hospital -> hospital list -> detail -> explicit call/directions |
| 3 Doctor | Home -> Find Doctor -> doctor list -> detail -> affiliated hospital by stable ID |
| 4 Medicine education | Find Care -> Medicine information -> dedicated list/detail; separate from reminders |
| 5 Blood bank | Home -> Blood Bank -> search/explicit nearby -> contact/source/report; no stock promise |
| 6 Emergency | Welcome or header -> Emergency -> explicit dialer action; no account |
| 7 Articles | Discover -> Articles -> paginated list -> detail |
| 8 Calm reset | Discover -> Meditation -> gentle breathing -> timer -> pause/background |
| 9 Wind-down | Calm Zone -> sleep practice or timed ambient sound -> pause |
| 10 Private routines | My Health -> sign-in prompt for guest -> existing account routines |
| 11 Activity | My Health -> Activity -> explicit step/health setup -> recorded-day insights |
| 12 Connected health | Connected health -> choose source -> explicit permission -> partial-success sync |
| 13 Jeeva | Jeeva -> account guard -> existing safety-gated chat |
| 14 Data export | Settings -> export -> authenticated own snapshot -> explicit OS share |
| 15 Directory correction | Provider/bank -> report -> admin queue -> human review; never automatic publication |

Records/family, schemes, bookings, teleconsultation and clinical quizzes have no completed journey yet. Do not expose a working-looking entry action until the service and approved data exist.

## Source route inventory

- `src/app/(account)/_layout.tsx`
- `src/app/(account)/activity.tsx`
- `src/app/(account)/app-access.tsx`
- `src/app/(account)/articles/[id].tsx`
- `src/app/(account)/articles/index.tsx`
- `src/app/(account)/blood-banks.tsx`
- `src/app/(account)/care/[id].tsx`
- `src/app/(account)/connected-health-settings.tsx`
- `src/app/(account)/connected-health.tsx`
- `src/app/(account)/cycle.tsx`
- `src/app/(account)/data-export.tsx`
- `src/app/(account)/delete-account.tsx`
- `src/app/(account)/doctors/[id].tsx`
- `src/app/(account)/doctors/index.tsx`
- `src/app/(account)/edit-health-goals.tsx`
- `src/app/(account)/edit-profile.tsx`
- `src/app/(account)/emergency.tsx`
- `src/app/(account)/feature.tsx`
- `src/app/(account)/hospitals/[id].tsx`
- `src/app/(account)/hospitals/index.tsx`
- `src/app/(account)/medicine-library/[id].tsx`
- `src/app/(account)/medicine-library/index.tsx`
- `src/app/(account)/medicines.tsx`
- `src/app/(account)/meditation-video.tsx`
- `src/app/(account)/notification-settings.tsx`
- `src/app/(account)/notifications.tsx`
- `src/app/(account)/profile.tsx`
- `src/app/(account)/settings.tsx`
- `src/app/(account)/water.tsx`
- `src/app/(main)/_layout.tsx`
- `src/app/(main)/explore.tsx`
- `src/app/(main)/find-care.tsx`
- `src/app/(main)/health.tsx`
- `src/app/(main)/home.tsx`
- `src/app/(main)/jeeva.tsx`
- `src/app/(main)/meditation.tsx`
- `src/app/_layout.tsx`
- `src/app/forgot-password.tsx`
- `src/app/index.tsx`
- `src/app/invite/[code].tsx`
- `src/app/login.tsx`
- `src/app/privacy.tsx`
- `src/app/setup-profile.tsx`
- `src/app/signup.tsx`
- `src/app/terms.tsx`
