# Connected health chart QA

`phone-fixed.png` captures the shipping HealthChart and WeeklyShare components rendered through react-native-web at a 390-unit content width. All readings are synthetic fixtures. The preview covers missing days, a recorded zero, partial-day values, weekly contribution slices, heart-rate trends, sleep duration and an empty metric.

Reproduce the HTML with `node scripts/preview-health-charts.cjs`. This is component visual verification, not complete-screen or native-device sign-off. Physical Android testing is still required for permission restore, real source sharing, platform revocation and OS background scheduling. The updated app needs a native rebuild because it adds Expo background modules and Health Connect permissions.
