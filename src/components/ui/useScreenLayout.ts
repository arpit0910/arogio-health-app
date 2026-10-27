import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Compact spacing follows usable window space, not a particular phone model. */
export function useScreenLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableHeight = Math.max(0, height - insets.top - insets.bottom);
  return {
    compact: availableHeight < 660,
    availableHeight,
    contentWidth: Math.min(Math.max(0, width - insets.left - insets.right), 440),
  };
}
