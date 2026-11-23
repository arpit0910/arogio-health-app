# New Login and light-only app

The latest uploaded `Login.svg` and `Login.png` govern Login. Earlier Home, Profile and three splash references remain the layout targets, with the user's later moving-spiral and city-neutral-copy instructions taking precedence. Original uploads are retained in `.impeccable/references/`.

Login uses the actual leaf/shield mark extracted from the uploaded SVG, the reference's welcome/network heading, labelled tonal fields, password recovery, emerald Sign In, white Google button, information badges, Sign Up and legal links. The previous outer card, welcome-back copy and Remember Me row are removed. Inputs retain validation, keyboard navigation, password visibility, busy protection and error recovery.

The reference's marketing and accreditation copy is reproduced as supplied design content. It is not independent evidence of appointments, nationwide provider coverage, government accreditation or a completed ABDM integration. Account/profile integration states elsewhere remain driven by actual backend capabilities. The email/mobile field accepts the reference's input design; the existing backend supports email authentication only. Mobile-looking input receives a clear email fallback message without sending an unsupported request. Google sign-in and legal/recovery routes use existing implementations.

The runtime dark palette, OS color-scheme selection, persisted appearance loading and Settings appearance selector are removed. The app and native splash configuration are light-only; previous saved dark/system choices are ignored. Navigation and picker themes use light appearance, and system bars use dark foreground icons on the light canvas. Preview tools use the light palette as well.

Validation: lint, TypeScript and all 165 tests passed, including new regressions for saved/device dark preferences, native light-only configuration and stale native night resources. The scoped design detector returned no findings. Source-rendered Login composition pages cover normal and compact/enlarged-text sizes.

Pixel-perfect acceptance on a rendered device is pending. The browser/native screenshot hosts are unavailable; static component rendering and passing tests do not establish a 100% visual match. Sample personal records and provider availability in reference images are not fabricated as account data.

The standalone Android artifact is build 50, version 1.0.1, using the hosted API and the existing local testing signature. Signature, archive, package, native light-only resources and bundled-content verification passed. The historical APK and build report have been removed.
