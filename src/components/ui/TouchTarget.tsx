import { createContext, useContext } from 'react';
import { Pressable, type PressableProps } from 'react-native';

// Canvas transforms scale layout units; retain a physical 48dp minimum.
export const TouchTargetScale = createContext(1);
export function useTouchTarget() {
  const scale = useContext(TouchTargetScale);
  return { minimum: 48 / scale, control: Math.max(44, 48 / scale) };
}

export function TouchTarget({ style, ...props }: PressableProps) {
  const { minimum } = useTouchTarget();
  return <Pressable {...props} style={(state) => [typeof style === 'function' ? style(state) : style, { minHeight: minimum }]} />;
}
