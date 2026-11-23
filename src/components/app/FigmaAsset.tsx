import { useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { SvgXml } from 'react-native-svg';
import { figmaAssets } from './figmaAssets';

type ExportedAsset = { source: number; width: number; height: number; svg: boolean };
const cache = new Map<number, Promise<string>>();
function loadXml(source: number) {
  if (!cache.has(source)) cache.set(source, (async () => {
    const resolved = Asset.fromModule(source);
    // Android's image resolver marks dimensioned SVG resources as downloaded,
    // although their URI is a raw resource name rather than a readable file.
    // Copy that resource to Expo's cache before asking File to read the XML.
    const asset = Platform.OS === 'android' && !resolved.uri.includes(':')
      ? Asset.fromURI(resolved.uri)
      : resolved;
    await asset.downloadAsync();
    if (Platform.OS === 'web') return (await fetch(asset.uri)).text();
    return new File(asset.localUri ?? asset.uri).text();
  })().catch(error => { cache.delete(source); throw error; }));
  return cache.get(source)!;
}
export async function prepareLaunchAssets() {
  const screens = ['3:462', '3:542', '3:842'] as const;
  await Promise.allSettled(screens.flatMap(screen => Object.values(figmaAssets[screen]).filter(asset => asset.svg).map(asset => loadXml(asset.source))));
}
/** Scale the wrapper, leaving the exported SVG's own dimensions intact. */
export function FigmaAsset({ screen, name, width, height }: { screen: keyof typeof figmaAssets; name: string; width?: number; height?: number }) {
  const exports = figmaAssets[screen] as Record<string, ExportedAsset>;
  const asset = name.startsWith('@') ? Object.values(exports)[Number(name.slice(1))] : exports[name];
  const [xml, setXml] = useState<string | null>(null);
  useEffect(() => { let alive = true; if (asset?.svg) void loadXml(asset.source).then(value => { if (alive) setXml(value); }).catch(() => {}); return () => { alive = false; }; }, [asset]);
  if (!asset) return null;
  const w = width ?? (height ? height * asset.width / asset.height : asset.width), h = height ?? w * asset.height / asset.width;
  if (!asset.svg) return <Image source={asset.source} resizeMode="cover" accessible={false} style={{ width: w, height: h, borderRadius: 12 }} />;
  return <View pointerEvents="none" accessible={false} style={{ width: w, height: h, overflow: 'hidden' }}><View style={{ width: asset.width, height: asset.height, transformOrigin: 'top left', transform: [{ scaleX: w / asset.width }, { scaleY: h / asset.height }] }}>{xml && <SvgXml xml={xml} />}</View></View>;
}
