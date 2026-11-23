const { withAndroidManifest } = require('expo/config-plugins');

// React Native updates text and useWindowDimensions on configuration changes.
// Keep the activity/navigation tree alive when Android changes accessibility text size.
module.exports = function withResponsiveFontScale(config) {
  return withAndroidManifest(config, mod => {
    const activities = mod.modResults.manifest.application[0].activity ?? [];
    const main = activities.find(activity => activity.$['android:name'] === '.MainActivity');
    if (main) {
      const changes = new Set((main.$['android:configChanges'] ?? '').split('|').filter(Boolean));
      changes.add('fontScale');
      main.$['android:configChanges'] = [...changes].join('|');
    }
    return mod;
  });
};
