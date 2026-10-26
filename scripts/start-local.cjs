/* global __dirname */
const { spawn } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex >= 0 ? args[portIndex + 1] : '8081';
if (!/^\d+$/.test(port || '') || Number(port) < 1 || Number(port) > 65535) {
  throw new Error('Pass a valid Metro port with --port.');
}

// SDK 58 reads this setting from the original process environment, not .env.
// Android's emulator reaches the host through 10.0.2.2, including bundle URLs.
const env = {
  ...process.env,
  EXPO_PACKAGER_PROXY_URL: process.env.EXPO_PACKAGER_PROXY_URL || `http://10.0.2.2:${port}`,
};
const child = spawn(process.execPath, [
  path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli'),
  'start', '--dev-client', '--offline',
  ...(portIndex < 0 ? ['--port', port] : []), ...args,
], { cwd: projectRoot, stdio: 'inherit', env });

child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
