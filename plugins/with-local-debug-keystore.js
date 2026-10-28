const { withAppBuildGradle } = require('expo/config-plugins');

// Keep local Google testing on the developer's registered debug certificate.
// The path is supplied locally; no keystore or password is copied into source.
module.exports = function withLocalDebugKeystore(config) {
  return withAppBuildGradle(config, (mod) => {
    const original = "storeFile file('debug.keystore')";
    const replacement = "storeFile file(System.getenv('AROGIO_LOCAL_DEBUG_KEYSTORE') ?: 'debug.keystore')";
    if (!mod.modResults.contents.includes(replacement)) {
      if (!mod.modResults.contents.includes(original)) {
        throw new Error('Local debug keystore setup could not find the generated debug signing configuration.');
      }
      mod.modResults.contents = mod.modResults.contents.replace(original, replacement);
    }
    // Ninja on Windows can reject long generated JNI object paths. Ask CMake
    // to hash them earlier without changing machine-wide path/security settings.
    if (process.platform === 'win32') {
      mod.modResults.contents = mod.modResults.contents.replace(/CMAKE_OBJECT_PATH_MAX=160/g, 'CMAKE_OBJECT_PATH_MAX=240');
    }
    if (process.platform === 'win32' && !mod.modResults.contents.includes('CMAKE_OBJECT_PATH_MAX')) {
      const defaultConfig = 'defaultConfig {';
      if (!mod.modResults.contents.includes(defaultConfig)) {
        throw new Error('Local Windows setup could not find the Android defaultConfig block.');
      }
      mod.modResults.contents = mod.modResults.contents.replace(defaultConfig,
        `${defaultConfig}\n        externalNativeBuild {\n            cmake {\n                arguments "-DCMAKE_OBJECT_PATH_MAX=240"\n            }\n        }`);
    }
    if (process.platform === 'win32' && !mod.modResults.contents.includes('buildStagingDirectory file("../../.c")')) {
      mod.modResults.contents = mod.modResults.contents.replace('android {', 'android {\n    externalNativeBuild { cmake { buildStagingDirectory file("../../.c") } }');
    }
    return mod;
  });
};
