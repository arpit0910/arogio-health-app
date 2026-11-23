import { usePalette } from '../../../theme/AppearanceProvider';
import { SvgXml } from 'react-native-svg';
import { authAssets } from '../assets/authAssets';

export type AuthIconName = keyof typeof authAssets;

/** Preserve the original Figma SVG dimensions and paths. */
export function AuthIcon({ name, width, height }: { name: AuthIconName; width?: number | string; height?: number | string }) {
  const colors = usePalette();
  const xml = name === 'arrow' ? authAssets[name].replace(/stroke="white"/g, `stroke="${colors.onPrimary}"`) : ['back', 'email', 'eye', 'lock', 'user'].includes(name) ? authAssets[name].replace(/#[0-9a-f]{6}/gi, name === 'back' ? colors.ink : colors.muted) : authAssets[name];
  return <SvgXml xml={xml} {...(width === undefined ? {} : { width })} {...(height === undefined ? {} : { height })} />;
}
