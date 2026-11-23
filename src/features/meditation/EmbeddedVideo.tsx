import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useState } from 'react';
import { WebView } from 'react-native-webview';
import { View} from 'react-native';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../localization/LanguageProvider';
import { useAppStyles } from '../../components/app/AppScreen';
import { allowPlayerNavigation, playerReferrer, videoEmbedUrl } from './videoPlayer';
export function EmbeddedVideo({ id, title }: { id: string; title: string }) {
  const [error, setError] = useState(false), [attempt, setAttempt] = useState(0);
  const { t } = useTranslation(), s = useAppStyles();
  const uri = videoEmbedUrl(id);
  if (!uri || error) return <View style={{ padding: 20, gap: 16 }}><Text accessibilityRole="alert" style={s.subtitle}>{t('This video could not load. Check your connection and try again.')}</Text><Button title={t('Retry')} onPress={() => { setError(false); setAttempt(value => value + 1); }} /></View>;
  return <WebView key={attempt} accessibilityLabel={title} source={{ uri, headers: { Referer: playerReferrer } }} style={{ flex: 1, backgroundColor: '#000' }} javaScriptEnabled allowsFullscreenVideo allowsInlineMediaPlayback mediaPlaybackRequiresUserAction setSupportMultipleWindows onOpenWindow={() => {}} originWhitelist={['*']} onShouldStartLoadWithRequest={request => allowPlayerNavigation(request.url, request.isTopFrame)} onError={() => setError(true)} onHttpError={event => { if (event.nativeEvent.url.startsWith(uri.split('?')[0])) setError(true); }} />;
}
