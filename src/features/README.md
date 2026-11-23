# Frontend feature modules

Expo routes stay in `src/app/`; each route imports its implementation from the responsible feature. Source feature names describe functionality, rather than the screen tab or an old design name.

| Feature | Responsibility |
| --- | --- |
| [account-onboarding](account-onboarding/) | Profile/access setup sequence |
| [activity](activity/) | Phone steps and activity views |
| [app-launch](app-launch/) | Animated opening scenes and launch sequence |
| [articles](articles/) | Wellness Library browsing and article reading |
| [authentication](authentication/) | Sign in, sign up, password recovery and authenticated session state |
| [blood-banks](blood-banks/) | Blood-bank listing, nearby discovery and contact actions |
| [care-directory](care-directory/) | Shared care search/detail screens and care API models |
| [doctors](doctors/) | Doctor list/detail wrappers |
| [emergency](emergency/) | Emergency contact and dispatch entry screen |
| [health-connections](health-connections/) | Optional external health sources and Health Connect adapters |
| [home-dashboard](home-dashboard/) | Homepage and real daily-health values |
| [hospitals](hospitals/) | Hospital list/detail wrappers |
| [jeeva-assistant](jeeva-assistant/) | Jeeva conversations and AI response rendering |
| [legal](legal/) | Terms and privacy screens |
| [medicine-library](medicine-library/) | Medicine information list/detail wrappers |
| [meditation](meditation/) | Meditation library, practices and playback |
| [notifications](notifications/) | Notification inbox and delivery state |
| [personal-wellness](personal-wellness/) | Water, medicines, menstrual cycle and daily tracking |
| [profile](profile/) | Profile presentation, setup models and account editors |
| [referrals](referrals/) | Referral invitation and attribution views |
| [settings](settings/) | Application settings and access management |

Shared HTTP transport and the articles/blood-bank resource API live in `src/services/api/`. Reusable time helpers live in `src/shared/date-time.ts`; environment configuration lives in `src/configuration/environment.ts`. Android/iOS/web suffixes are platform implementations. Route URLs and native package identifiers are stable.
