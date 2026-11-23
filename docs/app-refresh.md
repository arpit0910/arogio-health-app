# App UI and health refresh — 4 November 2026

The user approved Home's existing emerald/mint direction as the app-wide visual standard. The change extends that identity rather than replacing the brand.

## UX changes

- Home keeps today's actions and source-labelled activity, with no connect/refresh button pair.
- Health contains daily routines, the activity journal, private cycle records, body details and real imported trends when available.
- Explore now focuses on articles, meditation/affirmations, a direct breathing entry, blood banks and emergency contacts. It no longer repeats Home's four tracker shortcuts, Jeeva or health connection prompts.
- Settings is the single connection-management destination. Profile and sidebar retain Settings access; the duplicate health entries are removed. Manual App access now handles phone motion/location without selecting or disconnecting the existing health source.
- PageIntro, shared Inter aliases, 16-unit gutters, grouped rows and category cues align the main screens and trackers. Water deletion and cycle privacy controls are disclosed when needed. Calendar navigation uses compact accessible arrows.
- Existing reminders, saved records, account settings, authentication and accessible minimum touch sizes remain supported. New copy is translated into Hindi.

## Pebble Halo investigation and fixes

Reported behavior: Arogio showed 36 steps while Halo showed over 70,000, and readings appeared to update only once. No phone was connected to the local Android bridge during investigation, so the actual shared records could not be examined.

Confirmed app-side defects:

1. Home and Activity selected the phone/manual source when a configured wearable's connection became temporarily unavailable. They now preserve the enabled selected source and show its empty/error state rather than substituting phone counts. Source names are shown inside metric cards. Initial preference restoration also holds the activity display in a loading state to avoid flashing the phone count first.
2. An exception checking permission for a cached reading could reset the in-memory source preference for that session. Cache restoration is now optional; the saved choice survives and a fresh provider read is retried.
3. Installed non-writer versions of known health apps were silently filtered out. Native discovery now exposes them with explicit unsupported status, never as a working connection. This native change requires a new binary.

Additional refresh hardening:

- Foreground reads and connection requests intersect the current installed writer's advertised capabilities, including legacy saved preferences; background registration uses the same reduced set.
- Native reads have deadlines, and repeated sleep-page tokens fail the metric instead of trapping refresh forever. Failed metrics retain their earlier check time and error status.
- Per-type diagnostics distinguish permission, selection, errors and missing records. Current displayed values include the date and daily-total/average semantics.
- An explicit source-record diagnostic reads the selected writer's latest available record and Health Connect modification timestamp directly, without the Arogio cache or another app's data. It does not request new permissions.

Unconfirmed: whether this particular Halo version publishes current totals to Health Connect, or whether its exported records differ from Halo's own dashboard. Refreshing Arogio cannot force a wearable or its companion app to publish records. Verify on the affected phone after installing the new binary: sync the wearable in Halo, open Settings → Health app connections, check source records, compare the same date's step total and modification time, then refresh again after additional steps. No fabricated total, cross-source addition or raw cumulative-step summation is used to conceal that dependency.

## Evidence and limits

- Typecheck, lint and 133 tests pass, including the 36-step source-fallback regression; successive manual/polled readings above 70,000; temporary cache-permission failure; native read deadlines; repeated pagination; source timestamp isolation; existing permissions, reminders and account behavior.
- The Android health-source module compiles with `:arogio-health-source-apps:compileDebugKotlin`.
- Actual React Native components were rendered through React Native Web for light/dark and English/Hindi composition checks. Examples are under `.impeccable/review/ui-system` (Explore, Health, Activity, Settings, Profile, Water, Medicines, Cycle, Meditation and connection states). Previews contain explicitly synthetic records. They do not prove native permissions, motion, keyboard or physical-device behavior.
- Historical local Android build 40 assembles successfully; signature, package/version/architectures, ZIP integrity and bundled-code checks pass. It can update the previous local builds with the same certificate. Nothing is deployed or published by this change.

Sources: [Android source-filtered aggregation](https://developer.android.com/health-and-fitness/health-connect/aggregate-data), [Pebble's Health Connect integration guidance](https://www.pebblecart.com/blogs/wellness/we-heard-you-turning-community-questions-into-better-wellness), [Pebble Halo listing](https://play.google.com/store/apps/details?id=com.pebble.ring.app).
