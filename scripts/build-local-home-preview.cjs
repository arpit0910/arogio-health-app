/* global __dirname */
// Standalone emulator preview against the local API. Never an EAS release artifact.
const { readFileSync } = require('node:fs');
const { parseEnv } = require('node:util');
const { spawn } = require('node:child_process');
const path = require('node:path');

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  Object.assign(process.env, parseEnv(readFileSync(path.join(projectRoot, '.env.local'), 'utf8')));
  Object.assign(process.env, { AROGIO_LOCAL_QA: 'true', EXPO_NO_DOTENV: '1', EXPO_PUBLIC_API_URL: 'http://10.0.2.2:3001/api/v1' });
  const { getPrebuildConfigAsync } = require('@expo/prebuild-config');
  const { compileModsAsync } = require('expo/config-plugins');
  // Evaluate Expo's config plugins without clearing existing build outputs.
  const config = await getPrebuildConfigAsync(projectRoot, { platforms: ['android'] });
  await compileModsAsync(config.exp, { projectRoot, platforms: ['android'] });
  const result = spawn('cmd.exe', ['/d', '/c', 'gradlew.bat', ':app:assembleRelease', '-PreactNativeArchitectures=x86_64', '-Pandroid.enableMinifyInReleaseBuilds=false', '-Pandroid.enableShrinkResourcesInReleaseBuilds=false', '--console=plain'], { cwd: path.join(projectRoot, 'android'), env: process.env, stdio: 'inherit' });
  result.on('error', error => { console.error(error.message); process.exitCode = 1; });
  result.on('exit', code => { process.exitCode = code ?? 1; });
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
