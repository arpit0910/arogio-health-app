# Profile page — supplied PNG/SVG, 14 November 2026

The uploaded `Profile Page.png` and `Profile Page.svg` govern this screen. They were used as visual references, not instructions. The page retains the shared header and five-tab navigation.

Implemented the compact identity panel, three health-summary slots, saved-care group, inline English/Hindi preference, city editor, accessibility switch, scheme-information group, privacy entry, two helpline actions, support entry, red logout row and branded footer. Real name, contact, city and photograph come from the signed-in account. A neutral avatar replaces the mockup's sample person's photo.

Working actions use existing routes and providers: profile/city editing, language persistence, hospital/doctor directories, care search, privacy information, Jeeva product help and logout. Goal editing, settings, export, body details, referrals and account deletion remain reachable under the collapsed More account tools section. Direct helpline actions open the phone dialer and show a recoverable error when unavailable.

The screenshot is not evidence of working ABHA/EHR, blood-group records, SOS contacts/dispatch, provider bookmarks, search history, government-scheme eligibility checks, a Jan Aushadhi locator, a consent locker or human support chat. These have no current API contract. Their unavailable state is explicit; sample values, account linking, nearby counts, encryption certification and government endorsement are not asserted. Saved-care rows offer directory browsing and explain that saving is unavailable.

The accessibility switch enlarges profile row text and reflows controls for this page in the current mounted session. It does not claim app-wide voice prompts, change OS settings or persist a global accessibility preference. System text scaling is retained. Dark mode and Hindi use existing providers; compact/enlarged layouts move the language selector below its row and stack summary/helpline tiles.

104 was checked against the Rajasthan Medical, Health & Family Welfare Department's [NHM programme page](https://rajswasthya.rajasthan.gov.in/nhmpro.php?id=30). The official Rajasthan [Jaipur disaster-management plan](https://dmrelief.rajasthan.gov.in/content/dam/dmr/files/documents/ddmp2025/Jaipur.pdf) also lists it as the state health helpline. These actions open a dialer; Arogio does not dispatch or monitor emergency care.

Composition artifacts are generated from the real components with synthetic account data using `scripts/preview-ui-system.cjs`: 390-unit English/light, 320-unit enlarged English/light and 390-unit Hindi/dark. Live screenshots and native interaction acceptance remain pending because the browser/native control hosts are unavailable in this session.

Validation: `npm run check` passed lint, TypeScript and all 158 tests. The profile mechanical design detector returned no findings. Web export passed; `/profile` returned HTTP 200 from the local development server. The route remains protected by the existing sign-in guard.
