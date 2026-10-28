import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { careIllustrations } from './careIllustrations';

export type IllustrationName = keyof typeof careIllustrations;
type Dimension = number | `${number}%`;

/** Distinct content-specific vector scenes on a transparent canvas. */
export function CareIllustration({ name, size = 120, width = size, height = size }: { name: IllustrationName; size?: number; width?: Dimension; height?: Dimension }) {
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ width, height }}>
    <SvgXml xml={careIllustrations[name]} width="100%" height="100%" />
  </View>;
}
