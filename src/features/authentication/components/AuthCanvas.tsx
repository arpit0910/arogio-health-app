import { usePalette } from '../../../theme/AppearanceProvider';
import { FocusScrollView } from '../../../components/ui/FocusScrollView';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TouchTargetScale } from '../../../components/ui/TouchTarget';
import { type AuthIconName } from './AuthIcon';

/** Native layout follows the available viewport; only decorative artwork scales.
 * Keep the background out of scroll content so it cannot create empty scroll space.
 */
export function AuthCanvas({ children }: { background: AuthIconName; children: ReactNode; backgroundXml?: string }) {
  const styles = useStyles();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const hasOverflow = contentHeight > viewportHeight + 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.fill}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <FocusScrollView style={styles.fill} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
            bounces={false} alwaysBounceVertical={false} overScrollMode="never"
            automaticallyAdjustContentInsets={false} automaticallyAdjustKeyboardInsets={false} contentInsetAdjustmentBehavior="never"
            scrollEnabled showsVerticalScrollIndicator={hasOverflow} contentContainerStyle={styles.scroll}
            onLayout={({ nativeEvent: { layout } }) => setViewportHeight(layout.height)}
            onContentSizeChange={(_, height) => setContentHeight(height)}>
            <View style={styles.content}><TouchTargetScale value={1}>{children}</TouchTargetScale></View>
          </FocusScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { flexGrow: 1, flexShrink: 0, width: '100%', maxWidth: 440, alignSelf: 'center' },
});
};
