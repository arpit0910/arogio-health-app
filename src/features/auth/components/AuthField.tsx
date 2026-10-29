import { usePalette } from '../../../theme/AppearanceProvider';
import { useFieldFocus } from '../../../components/ui/FocusScrollView';
import { useRef, useState, type ComponentRef, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { fonts } from '../../../theme/tokens';
import { AuthIcon } from './AuthIcon';
import { useTouchTarget } from '../../../components/ui/TouchTarget';

export type AuthFieldRef = ComponentRef<typeof TextInput>;
type Props = Omit<TextInputProps, 'ref'> & { icon: 'user' | 'email' | 'lock'; password?: boolean; invalid?: boolean; ref?: Ref<AuthFieldRef> };

export function AuthField({ icon, password, invalid, ref, ...props }: Props) {
  const colors = usePalette();
  const styles = useStyles();

  const inputRef = useRef<AuthFieldRef>(null);
  const reveal = useFieldFocus();
  const [visible, setVisible] = useState(false);
  const { control, minimum } = useTouchTarget();
  const [focused, setFocused] = useState(false);
  return <Pressable accessible={false} onPress={() => inputRef.current?.focus()} style={[styles.field, { minHeight: control }, focused && styles.focused, invalid && styles.invalid]}>
    <View accessible={false}><AuthIcon name={icon} /></View>
    <TextInput ref={node => { inputRef.current = node; if (typeof ref === 'function') return ref(node); if (ref) ref.current = node; }} {...props} accessibilityLabel={props.accessibilityLabel ?? props.placeholder}
      onFocus={(event) => { setFocused(true); reveal(inputRef.current); props.onFocus?.(event); }}
      onBlur={(event) => { setFocused(false); reveal(null); props.onBlur?.(event); }}
      style={styles.input} placeholderTextColor={colors.placeholder} selectionColor={colors.primary}
      secureTextEntry={password && !visible} />
    {password && <Pressable accessibilityRole="button" accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${props.placeholder?.toLowerCase() ?? 'password'}`}
      accessibilityState={{ selected: visible }} aria-pressed={visible} hitSlop={2} onPress={() => setVisible(!visible)} style={[styles.visibility, { minHeight: minimum, minWidth: minimum }]}>
      <View style={{ opacity: visible ? 0.5 : 1 }}><AuthIcon name="eye" /></View>
    </Pressable>}
  </Pressable>;
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingLeft: 14,
    borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.error },
  input: { flex: 1, minWidth: 0, paddingHorizontal: 10, paddingVertical: 14, fontSize: 15,
    fontFamily: fonts.regular, color: colors.ink, outlineWidth: 0, includeFontPadding: false },
  visibility: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
};
