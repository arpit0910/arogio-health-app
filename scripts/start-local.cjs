/* global __dirname */
const { spawn } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { parseEnv } = require('node:util');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const rawArgs = process.argv.slice(2);
const production = rawArgs.includes('--production-api');
const exporting = rawArgs.includes('--export');
const dryRun = rawArgs.includes('--dry-run');
const args = rawArgs.filter(arg => !['--production-api', '--export', '--dry-run'].includes(arg));
const web = args.includes('--web') || args[args.indexOf('--platform') + 1] === 'web';
const file = production ? '.env.production' : '.env.local';
const settings = parseEnv(readFileSync(path.join(projectRoot, file), 'utf8'));
const portIndex = args.indexOf('--port');
const port = portIndex >= 0 ? args[portIndex + 1] : '8081';
if (!/^\d+$/.test(port || '') || Number(port) < 1 || Number(port) > 65535) throw new Error('Pass a valid Metro port with --port.');
const apiUrl = production ? settings.EXPO_PUBLIC_API_URL : web ? 'http://localhost:3001/api/v1' : settings.EXPO_PUBLIC_API_URL;
if (!apiUrl || (production && !apiUrl.startsWith('https://'))) throw new Error('Configure a valid API URL in ' + file);
const webClientId = settings.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
if (!webClientId?.endsWith('.apps.googleusercontent.com')) throw new Error('Configure the Google Web OAuth client in ' + file);
const env = { ...process.env, EXPO_NO_DOTENV: '1', EXPO_PUBLIC_API_URL: apiUrl,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: webClientId, EXPO_PUBLIC_GOOGLE_CLIENT_ID: webClientId,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: settings.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '' };
// Whitelist configuration; production must never inherit the local signing hook.
if (!production && settings.AROGIO_LOCAL_DEBUG_KEYSTORE) env.AROGIO_LOCAL_DEBUG_KEYSTORE = settings.AROGIO_LOCAL_DEBUG_KEYSTORE;
else delete env.AROGIO_LOCAL_DEBUG_KEYSTORE;
if (!exporting) env.EXPO_PACKAGER_PROXY_URL = web ? `http://localhost:${port}` : `http://10.0.2.2:${port}`;
else delete env.EXPO_PACKAGER_PROXY_URL;
const command = exporting ? ['export', ...args] : ['start', ...(web ? [] : ['--dev-client']), '--offline', ...(portIndex < 0 ? ['--port', port] : []), ...args];
if (dryRun) {
  console.log(JSON.stringify({ mode: production ? 'production' : 'local', target: web ? 'web' : 'android-emulator', apiUrl, webClientId, command, localSigningHook: !!env.AROGIO_LOCAL_DEBUG_KEYSTORE }));
} else {
  const child = spawn(process.execPath, [path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli'), ...command], { cwd: projectRoot, stdio: 'inherit', env });
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
}
