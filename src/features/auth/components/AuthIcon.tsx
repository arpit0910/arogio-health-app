import { SvgXml } from 'react-native-svg';
import { authAssets } from '../assets/authAssets';

export type AuthIconName = keyof typeof authAssets;

/** Preserve the original Figma SVG dimensions and paths. */
export function AuthIcon({ name }: { name: AuthIconName }) {
  return <SvgXml xml={authAssets[name]} />;
}
