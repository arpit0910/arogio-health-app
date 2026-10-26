import { SvgXml } from 'react-native-svg';
import { useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../theme/tokens';
import { TouchTargetScale } from '../../../components/ui/TouchTarget';
import { AuthIcon, type AuthIconName } from './AuthIcon';

const DESIGN_WIDTH = 326;
const DESIGN_CONTENT_HEIGHT = 678; // Figma's 714px screen minus its 36px mock status bar.

/** Phone proportions come from the supplied frame; native insets stay outside it.
 * On tablets the canvas is capped. Text scaling and keyboard scrolling remain native.
 */
export function AuthCanvas({ background, children, backgroundXml }: { background: AuthIconName; children: ReactNode; backgroundXml?: string }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [viewport, setViewport] = useState({ width, height: height - insets.top - insets.bottom });
  const measuredViewport = useRef<string | null>(null);
  const viewportKey = `${width}:${insets.top}:${insets.bottom}`;
  const scale = Math.min(Math.min(viewport.width, 420) / DESIGN_WIDTH, Math.max(1, viewport.height / DESIGN_CONTENT_HEIGHT));
  const minimumHeight = Math.max(DESIGN_CONTENT_HEIGHT, viewport.height / scale);
  const [contentHeight, setContentHeight] = useState(DESIGN_CONTENT_HEIGHT);
  const stageHeight = Math.max(minimumHeight, contentHeight);

  const artwork = backgroundXml ? <SvgXml xml={backgroundXml} width={326} height={714} /> : <AuthIcon name={background} />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        onLayout={({ nativeEvent: { layout } }) => {
          // Keep the original canvas size when the keyboard reduces the viewport.
          if (measuredViewport.current !== viewportKey) {
            measuredViewport.current = viewportKey;
            setViewport({ width: layout.width, height: layout.height });
          } else {
            setViewport((previous) => layout.height > previous.height || Math.abs(previous.width - layout.width) > 1
              ? { width: layout.width, height: layout.height } : previous);
          }
        }}>
        <ScrollView style={styles.fill} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={{ width: DESIGN_WIDTH * scale, height: stageHeight * scale }}>
            <View style={[styles.canvas, { minHeight: minimumHeight, transform: [{ scale }] }]}
              onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}>
              <View pointerEvents="none" accessible={false} style={styles.decoration}>
                <View style={styles.upperArtwork}><View style={styles.upperSvg}>{artwork}</View></View>
                <View style={styles.lowerArtwork}><View style={styles.lowerSvg}>{artwork}</View></View>
              </View>
              <TouchTargetScale value={scale}>{children}</TouchTargetScale>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  canvas: { width: DESIGN_WIDTH, transformOrigin: 'top left', backgroundColor: colors.background },
  decoration: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' },
  upperArtwork: { position: 'absolute', top: 0, left: 0, width: DESIGN_WIDTH, height: 300, overflow: 'hidden' },
  upperSvg: { position: 'absolute', top: -36, left: 0 },
  lowerArtwork: { position: 'absolute', bottom: 0, left: 0, width: DESIGN_WIDTH, height: 96, overflow: 'hidden' },
  lowerSvg: { position: 'absolute', top: -618, left: 0 },
});
