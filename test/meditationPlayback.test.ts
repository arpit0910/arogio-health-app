import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { videoEmbedUrl, allowPlayerNavigation } from '../src/features/meditation/videoPlayer.ts';
const require = createRequire(import.meta.url), ts = require('typescript');
function audio(running: boolean) {
  const effects: (() => void | (() => void))[] = [], calls: string[] = [];
  const exports: Record<string, any> = {};
  const player = { pause: () => calls.push('pause'), play: () => calls.push('play') };
  vm.runInNewContext(ts.transpileModule(readFileSync('src/features/meditation/PracticeAudio.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports, require: (name: string) => {
      if (name === 'react') return { useEffect: (fn: () => void) => effects.push(fn), useState: (value: unknown) => [value, () => {}] };
      if (name === 'expo-audio') return { useAudioPlayer: () => player, setAudioModeAsync: async () => {} };
      if (name === 'expo-speech') return { getAvailableVoicesAsync: async () => [], stop: async () => { calls.push('stop'); }, speak: (cue: string) => calls.push(cue) };
      if (name.includes('LanguageProvider')) return { useTranslation: () => ({ t: (s: string) => s }) };
      if (name.includes('AppearanceProvider')) return { usePalette: () => ({}) };
      if (name.includes('AppScreen')) return { useAppStyles: () => ({}) };
      if (name.endsWith('.wav')) return 1;
      if (name === 'react/jsx-runtime') return require(name);
      return {};
    },
  });
  exports.PracticeAudio({ running, cue: 'Breathe in', language: 'en' });
  return { calls, cleanup: effects.map(fn => fn()).filter(Boolean) as (() => void)[] };
}
describe('Meditation playback', () => {
  it('uses only valid YouTube IDs and keeps navigation in the embedded player', () => {
    assert.match(videoEmbedUrl('s2NISyShKXM')!, /^https:\/\/www.youtube.com\/embed\/s2NISyShKXM/);
    assert.equal(videoEmbedUrl('bad<script>'), null);
    assert.equal(allowPlayerNavigation('https://www.youtube.com/embed/s2NISyShKXM?playsinline=1'), true);
    for (const url of ['https://www.youtube.com/watch?v=s2NISyShKXM', 'youtube://watch', 'https://www.youtube.com.evil.test/embed/s2NISyShKXM']) assert.equal(allowPlayerNavigation(url), false);
  });
  it('starts audio only during an active practice and stops on cleanup', async () => {
    const session = audio(true); await new Promise(resolve => setImmediate(resolve));
    assert.ok(session.calls.includes('play')); assert.ok(!session.calls.includes('Breathe in'));
    session.cleanup.forEach(fn => fn());
    assert.equal(session.calls.at(-1), 'pause');
    const paused = audio(false); await new Promise(resolve => setImmediate(resolve));
    assert.ok(paused.calls.includes('pause')); assert.ok(!paused.calls.includes('play')); assert.ok(!paused.calls.includes('Breathe in'));
  });
  it('cancels pending audio starts when the screen is left immediately', async () => {
    const session = audio(true); session.cleanup.forEach(fn => fn());
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(!session.calls.includes('play')); assert.ok(!session.calls.includes('Breathe in'));
  });
  it('keeps the Profile tab private after moving it into main navigation', () => {
    assert.ok(existsSync('src/app/(main)/profile.tsx'));
    assert.ok(!existsSync('src/app/(account)/profile.tsx'));
    assert.match(readFileSync('src/app/(main)/profile.tsx', 'utf8'), /<PrivateFeature><AccountProfileScreen\s*\/><\/PrivateFeature>/);
  });
});
