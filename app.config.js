/** @type {import('expo/config').ExpoConfig | ((context: import('expo/config').ConfigContext) => import('expo/config').ExpoConfig)} */
module.exports = ({ config }) => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const plugins = [...(config.plugins ?? [])];
  if (process.env.AROGIO_LOCAL_DEBUG_KEYSTORE && process.env.EAS_BUILD !== 'true') {
    plugins.push('./plugins/with-local-debug-keystore');
  }
  // Android is autolinked and uses the shared web client ID. The plugin only
  // registers iOS's callback scheme; do not enable its Firebase configuration.
  if (iosClientId) {
    if (!iosClientId.endsWith('.apps.googleusercontent.com')) {
      throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be a Google OAuth iOS client ID.');
    }
    plugins.push(['@react-native-google-signin/google-signin', {
      iosUrlScheme: `com.googleusercontent.apps.${iosClientId.replace(/\.apps\.googleusercontent\.com$/, '')}`,
    }]);
  }
  return { ...config, plugins };
};
