/* global __dirname, Buffer */
// Render the existing authentication logo; no separate launcher artwork.
// Run with: node scripts/generate-app-icons.cjs <path-to-sharp-module>
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(path.resolve(process.argv[2]));
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/features/auth/assets/authAssets.ts'), 'utf8');
const match = source.match(/brand: ("(?:[^"\\]|\\.)*")/);
if (!match) throw new Error('Existing Arogio brand SVG not found');
const brand = JSON.parse(match[1]);
const contents = brand.slice(brand.indexOf('>') + 1, brand.lastIndexOf('</svg>'));

async function render(name, size, width, background, monochrome = false) {
  const height = width * 36 / 40;
  const art = monochrome
    ? contents.replace(/#[\da-f]{6}/gi, '#000000').replace(/url\(#[^)]+\)/g, '#000000')
    : contents;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">${background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : ''}<svg x="${(size-width)/2}" y="${(size-height)/2}" width="${width}" height="${height}" viewBox="0 0 40 36">${art}</svg></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(root, 'assets', name));
}

(async () => {
  await render('icon.png', 1024, 800, '#FFFFFF');
  // Visible mark stays inside Android's central 66/108 safe zone.
  await render('android-icon-foreground.png', 1024, 650, null);
  await render('android-icon-monochrome.png', 1024, 650, null, true);
  await render('favicon.png', 64, 52, '#FFFFFF');
})();
