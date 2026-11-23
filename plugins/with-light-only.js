const { withAndroidColorsNight, withAndroidStyles } = require('expo/config-plugins');

/** Clear stale generated night resources when migrating an existing app to light-only. */
module.exports = function withLightOnly(config) {
  if (config.userInterfaceStyle !== 'light') return config;
  const background = config.backgroundColor || '#F7FAF7';
  config = withAndroidColorsNight(config, mod => {
    const resources = mod.modResults.resources ??= {};
    resources.color = (resources.color ?? []).filter(color => color.$?.name !== 'splashscreen_background');
    resources.color.push({ $: { name: 'splashscreen_background' }, _: background });
    return mod;
  });
  return withAndroidStyles(config, mod => {
    const theme = mod.modResults.resources.style?.find(style => style.$?.name === 'AppTheme');
    if (theme) {
      theme.$.parent = 'Theme.AppCompat.Light.NoActionBar';
      theme.item = (theme.item ?? []).filter(item => item.$?.name !== 'android:forceDarkAllowed');
      theme.item.push({ $: { name: 'android:forceDarkAllowed' }, _: 'false' });
    }
    return mod;
  });
};
