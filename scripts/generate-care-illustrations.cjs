/* global __dirname */
// Keep editable SVG assets and the native SvgXml source module in sync.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const names = ['welcome', 'login', 'signup', 'water', 'cycle', 'medicine'];
const scenes = Object.fromEntries(names.map(name => [name, fs.readFileSync(path.join(root, 'assets/illustrations/vector', name + '.svg'), 'utf8')]));
fs.writeFileSync(path.join(root, 'src/components/app/careIllustrations.ts'), '/** Original flat-vector scenes; editable SVG sources: assets/illustrations/vector/. */\nexport const careIllustrations = ' + JSON.stringify(scenes, null, 2) + ' as const;\n');
