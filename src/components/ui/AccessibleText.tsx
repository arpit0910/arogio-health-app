import { createContext, forwardRef, useContext, type ComponentRef } from 'react';
import { Text as NativeText, TextInput as NativeInput, StyleSheet, type TextProps, type TextInputProps } from 'react-native';
import { useAccessibilityPreferences } from '../../features/accessibility/AccessibilityPreferences';

const Nested = createContext(false);
export const AccessibleText = forwardRef<ComponentRef<typeof NativeText>, TextProps>(function AccessibleText({ style, ...props }, ref) {
  const { large } = useAccessibilityPreferences(), nested = useContext(Nested), flat = StyleSheet.flatten(style);
  const size = flat?.fontSize ?? (nested ? undefined : 14), line = flat?.lineHeight;
  return <Nested.Provider value><NativeText ref={ref} {...props} style={[style, large && { ...(size ? { fontSize: size * 1.2 } : {}), ...(line ? { lineHeight: line * 1.2 } : {}) }]} /></Nested.Provider>;
});
export const AccessibleTextInput = forwardRef<ComponentRef<typeof NativeInput>, TextInputProps>(function AccessibleTextInput({ style, ...props }, ref) {
  const { large } = useAccessibilityPreferences(), flat = StyleSheet.flatten(style);
  return <NativeInput ref={ref} {...props} style={[style, large && { fontSize: (flat?.fontSize ?? 14) * 1.2, ...(flat?.lineHeight ? { lineHeight: flat.lineHeight * 1.2 } : {}) }]} />;
});
