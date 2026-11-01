import { Text, View } from 'react-native';
import { AppIcon } from '../../components/app/AppIcon';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { fonts } from '../../theme/tokens';
import type { ChatMessage } from './model';

export function ChatReply({ message }: { message: ChatMessage }) {
  const colors = usePalette(), { t } = useTranslation();
  const urgent = message.kind === 'urgent' || message.kind === 'harmful';
  const notice = message.kind && message.kind !== 'answer';
  const title = urgent ? 'Safety notice' : message.kind === 'medication' ? 'Medicine safety' : 'Jeeva';
  return <View accessibilityRole={urgent ? 'alert' : undefined} accessibilityLiveRegion={urgent ? 'assertive' : 'polite'} style={{ alignSelf: 'flex-start', width: '100%', gap: 12, padding: 18, borderRadius: 16, backgroundColor: urgent ? colors.errorSurface : colors.surface }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><AppIcon name={urgent ? 'shield' : notice ? message.kind === 'medication' ? 'pill' : 'explore' : 'heart'} size={19} color={urgent ? colors.error : colors.primary} /><Text style={{ fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: urgent ? colors.error : colors.primary }}>{t(title)}</Text></View>
    {message.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <Text key={index} selectable style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 25, color: colors.ink }}>{paragraph.replace(/^#{1,6}\s+/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/^\s*[-*]\s+/gm, '\u2022 ')}</Text>)}
  </View>;
}
