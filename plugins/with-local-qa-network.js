const { withAndroidManifest } = require('expo/config-plugins');

// Only used by an explicitly selected local preview; never enabled on EAS.
module.exports = function withLocalQaNetwork(config) {
  return withAndroidManifest(config, mod => {
    mod.modResults.manifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    return mod;
  });
};
