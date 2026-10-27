import { SvgXml } from 'react-native-svg';
import { authAssets } from '../assets/authAssets';

export type AuthIconName = keyof typeof authAssets;

/** Preserve the original Figma SVG dimensions and paths. */
export function AuthIcon({ name, width, height }: { name: AuthIconName; width?: number | string; height?: number | string }) {
  return <SvgXml xml={authAssets[name]} {...(width === undefined ? {} : { width })} {...(height === undefined ? {} : { height })} />;
}
