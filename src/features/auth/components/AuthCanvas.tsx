import { usePalette } from '../../../theme/AppearanceProvider';
import { FocusScrollView } from '../../../components/ui/FocusScrollView';
import { SvgXml } from 'react-native-svg';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TouchTargetScale } from '../../../components/ui/TouchTarget';
import { type AuthIconName } from './AuthIcon';
import { authAssets } from '../assets/authAssets';
import { useScreenLayout } from '../../../components/ui/useScreenLayout';

const DESIGN_WIDTH = 326;

/** Native layout follows the available viewport; only decorative artwork scales.
 * Keep the background out of scroll content so it cannot create empty scroll space.
 */
export function AuthCanvas({ background, children, backgroundXml }: { background: AuthIconName; children: ReactNode; backgroundXml?: string }) {
  const styles = useStyles();

  const { contentWidth: artworkWidth } = useScreenLayout();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const artworkScale = artworkWidth / DESIGN_WIDTH;
  const artwork = <SvgXml xml={backgroundXml ?? authAssets[background]} width={artworkWidth} height={714 * artworkScale} />;
  const hasOverflow = contentHeight > viewportHeight + 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.fill}>
        <View pointerEvents="none" accessible={false} style={styles.decoration}>
          <View style={[styles.artworkCanvas, { width: artworkWidth }]}>
            <View style={[styles.upperArtwork, { height: 300 * artworkScale }]}><View style={{ top: -36 * artworkScale }}>{artwork}</View></View>
            <View style={[styles.lowerArtwork, { height: 96 * artworkScale }]}><View style={{ top: -618 * artworkScale }}>{artwork}</View></View>
          </View>
        </View>
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
  decoration: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', overflow: 'hidden' },
  artworkCanvas: { flex: 1 },
  upperArtwork: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  lowerArtwork: { position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden' },
});
};
