import { createContext, useCallback, useContext, useEffect, useRef, type ComponentRef } from 'react';
import { Keyboard, Platform, ScrollView, type ScrollViewProps, TextInput } from 'react-native';

type Input = ComponentRef<typeof TextInput>;
const FocusContext = createContext<(input: Input | null) => void>(() => {});
export const useFieldFocus = () => useContext(FocusContext);

/** Recheck the focused field after the keyboard and viewport have finished resizing. */
export function FocusScrollView({ children, onLayout, ...props }: ScrollViewProps) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const focused = useRef<Input | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reveal = useCallback(() => {
    if (Platform.OS === 'web' || !focused.current || !Keyboard.isVisible()) return;
    scroll.current?.scrollResponderScrollNativeHandleToKeyboard(focused.current, 24, true);
  }, []);
  const focus = useCallback((input: Input | null) => {
    focused.current = input;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(reveal, 100);
  }, [reveal]);
  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', reveal);
    return () => { shown.remove(); if (timer.current) clearTimeout(timer.current); };
  }, [reveal]);
  return <FocusContext.Provider value={focus}><ScrollView ref={scroll} {...props} onLayout={event => { onLayout?.(event); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(reveal, 100); }}>{children}</ScrollView></FocusContext.Provider>;
}
