import { useTranslation } from '../../localization/LanguageProvider';
import { createContext, useContext } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

// Canvas transforms scale layout units; retain a physical 48dp minimum.
export const TouchTargetScale = createContext(1);
export function useTouchTarget() {
  const scale = useContext(TouchTargetScale);
  return { minimum: 48 / scale, control: Math.max(44, 48 / scale) };
}

export function TouchTarget({ style, ...props }: PressableProps) {
  const {t: tr} = useTranslation();
  const { minimum } = useTouchTarget();
  return <Pressable {...props} accessibilityLabel={tr(props.accessibilityLabel)} accessibilityHint={tr(props.accessibilityHint)} style={(state) => {
    const resolved = typeof style === 'function' ? style(state) : style;
    const requested = StyleSheet.flatten(resolved)?.minHeight;
    return [resolved, { minHeight: Math.max(minimum, typeof requested === 'number' ? requested : 0) }];
  }} />;
}
