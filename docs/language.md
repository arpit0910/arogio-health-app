# English and Hindi

Choose **Settings → Language → English / हिन्दी**. The selected option remains readable in its own language. It applies immediately without restarting, and is restored on the next launch using the existing secure device storage (browser storage for web). A failed save keeps the previous choice and shows an error. English is the default for new installations; unsupported stored values fall back to English.

`src/localization/LanguageProvider.tsx` owns the preference, locale and translator. `hindi.ts` contains the interface catalogue. Display strings are translated at render time; API field names, enum values, routes, record identifiers and numeric form values stay unchanged. Names, medicine instructions, notes, user chat messages and other user-authored records are not machine-translated. Device names and provider app names retain their supplied names. Android/iOS system permission dialogs and other system UI follow device language.

Articles and blood-bank names/addresses follow the global choice using their imported Hindi fields, falling back to English when no Hindi field exists. Their per-page language buttons still allow a temporary reading override. Calendar labels on the main screens use `hi-IN` or `en-IN`; ISO record dates and India time semantics are preserved.

Tests cover English/Hindi copy, interpolated names and numbers, placeholder parity, unchanged unknown content, preference restoration after restart, switching back to English, unsupported values and storage failure. Actual component previews with synthetic accounts were inspected for Hindi Settings in dark mode and Profile at 320px in light mode. Native font rendering and permission dialogs still need a phone check.
