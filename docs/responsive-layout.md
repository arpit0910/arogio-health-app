# Responsive screen verification

The shared authentication/profile layout now follows the usable viewport instead of scaling a fixed 326 × 678 content canvas. The decorative SVG background is anchored outside the scroll view. Content scrolls only when its measured height exceeds the viewport; Android overscroll and iOS bouncing are disabled. Keyboard avoidance updates the available scroll area instead of retaining the largest previously measured height.

The supplied SVG paths, colors and typography are preserved. Short windows use compact vertical spacing, artwork keeps its aspect ratio, controls keep native 48dp touch targets, and wider windows use a centered form column capped at 440dp. Profile setup no longer forces a 678dp minimum height. Profile dialogs have a bounded scrollable surface so keyboard/large-content cases retain access to Save and Cancel. Legal/dashboard overscroll is disabled as well.

## Native Android results

Verified with the API 34 Pixel 3a emulator using software graphics. Display size was changed through Android's window manager at density 320; original display/font settings were restored afterward. These are native app screenshots and accessibility-tree checks, not browser approximations.

| Usable device class | Logical display | System font scale | Login | Signup |
| --- | --- | --- | --- | --- |
| Phone | 360 × 720 | 1.0 | Fits, scrolling disabled | Fits, scrolling disabled |
| Small phone | 320 × 568 | 1.0 | Necessary scrolling only | Necessary scrolling only |
| Phone with larger text | 360 × 720 | 1.3 | Fits, scrolling disabled | Necessary scrolling only |
| Tablet | 800 × 1280 | 1.0 | Fits, scrolling disabled | Fits, scrolling disabled |

All eight cases verified that the final account-switch link was reachable and that extra swipes stopped at the content boundary. Font-size cases used a cold development-app relaunch because changing system font size during a development session caused duplicate-linking transition warnings; test navigation then used the app's buttons.

Additional native checks passed:

- Login remains stationary when swiped while all content fits.
- Opening the Android keyboard reduces the available content viewport and enables required scrolling; dismissing it restores the fitting layout.
- Profile intro and personal-details screens render with the shared viewport layout.
- The date-of-birth dialog works at the small-phone size and retains reachable actions.

Profile checks used a disposable local backend/account. No production profile was changed. Temporary local services should be stopped after verification so they do not lock the native Argon2 dependency during the next `npm ci`.

App lint, TypeScript and all 31 existing tests passed. Android portrait layouts were exercised; iOS keyboard behavior is implemented but has not been verified on an iOS device in this environment. A new standalone APK is required to deliver these layout changes to installed apps.
