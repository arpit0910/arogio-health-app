# Articles and nearby blood banks

Home includes published articles and a bottom-right Emergency shortcut. The shortcut is Home-only. The sidebar links to Articles and Blood banks; these pages sit in the account stack rather than adding bottom-navigation tabs.

The bank page requests location only after Find near me or the Emergency shortcut. It uses a one-time foreground location, keeps coordinates in screen memory, and posts them to `/blood-banks/nearby`. There is no background tracking or persisted location. Search by city/name/pincode works without permission. Search, language and service filters sit in an expandable section so nearby results are easy to reach. Distances are labelled straight-line; listed groups and opening hours require confirmation by phone.

The app requires the backend directory migration and CSV import described in `D:/arogio_health_backend/DIRECTORY.md`. No sample article or bank is bundled as production content. Until the backend is deployed, the screens provide loading/error/retry states.

`node scripts/preview-directory.cjs 390 light banks` renders the actual screen with a local CSV fixture. Preview scripts do not read user health records or request location. The supplied CSV paths are used only by this development preview tool.
