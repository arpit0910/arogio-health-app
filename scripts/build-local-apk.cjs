/* global __dirname */
// Local standalone APK; source and signing material stay on this computer.
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { spawn } = require('node:child_process');
async function main() {
  const root = path.resolve(__dirname, '..');
  const versionArgument = process.argv.find(arg => arg.startsWith('--version-code='));
  const versionCode = versionArgument ? Number(versionArgument.split('=')[1]) : 16;
  if (!Number.isInteger(versionCode) || versionCode < 16) throw new Error('Pass an integer version code of at least 16.');
  const production = parseEnv(fs.readFileSync(path.join(root, '.env.production'), 'utf8'));
  const local = parseEnv(fs.readFileSync(path.join(root, '.env.local'), 'utf8'));
  Object.assign(process.env, { EXPO_NO_DOTENV: '1', EXPO_PUBLIC_API_URL: production.EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: production.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, EXPO_PUBLIC_GOOGLE_CLIENT_ID: production.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  if (local.AROGIO_LOCAL_DEBUG_KEYSTORE) process.env.AROGIO_LOCAL_DEBUG_KEYSTORE = local.AROGIO_LOCAL_DEBUG_KEYSTORE;
  delete process.env.AROGIO_LOCAL_QA;
  const { getPrebuildConfigAsync } = require('@expo/prebuild-config');
  const { compileModsAsync } = require('expo/config-plugins');
  const config = await getPrebuildConfigAsync(root, { platforms: ['android'] });
  config.exp.android = { ...config.exp.android, versionCode };
  await compileModsAsync(config.exp, { projectRoot: root, platforms: ['android'] });
  const child = spawn('cmd.exe', ['/d', '/c', path.join(root, 'android', 'gradlew.bat'), ':app:assembleRelease', ...(process.argv.includes('--online') ? [] : ['--offline']), '-PreactNativeArchitectures=arm64-v8a,armeabi-v7a', '-Pandroid.enableMinifyInReleaseBuilds=false', '-Pandroid.enableShrinkResourcesInReleaseBuilds=false', '--console=plain'], { cwd: path.join(root, 'android'), env: process.env, stdio: 'inherit' });
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { if (code === 0) { const output = path.join(root, `dist/apk-qa/arogio-build${versionCode}-local.apk`); fs.mkdirSync(path.dirname(output), { recursive: true }); fs.copyFileSync(path.join(root, 'android/app/build/outputs/apk/release/app-release.apk'), output); console.log('APK: ' + output); } process.exitCode = code ?? 1; });
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
