// The app is locked to portrait ("orientation": "portrait" in app.json). Google Play then
// treats android.hardware.screen.portrait as a *required* hardware feature (implied by the
// activity's screenOrientation), which hides the app from tablets, desktops and Android XR.
// Declaring the feature explicitly as optional overrides that: the app stays portrait, but
// every device can install it.
const { withAndroidManifest } = require('expo/config-plugins');

const FEATURE = 'android.hardware.screen.portrait';

module.exports = function withOptionalPortraitScreen(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const features = (manifest['uses-feature'] = manifest['uses-feature'] || []);
    const existing = features.find((f) => f.$['android:name'] === FEATURE);
    if (existing) existing.$['android:required'] = 'false';
    else features.push({ $: { 'android:name': FEATURE, 'android:required': 'false' } });
    return cfg;
  });
};
