const { withAndroidManifest } = require('expo/config-plugins');
module.exports = function withProductionSecurity(config) {
  return withAndroidManifest(config, mod => {
    const application = mod.modResults.manifest.application[0].$;
    application['android:allowBackup'] = 'false';
    application['android:usesCleartextTraffic'] = 'false';
    return mod;
  });
};
