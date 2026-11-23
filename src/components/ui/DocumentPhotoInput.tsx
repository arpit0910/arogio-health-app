import { useTranslation } from '../../localization/LanguageProvider';
import { useCallback, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { DAction, DField, DText, ds } from '../app/DesignUI';

/** OCR text is always reviewed; neither the photo nor its text is sent automatically. */
export function DocumentPhotoInput({ onText, disabled = false, limit = 2000, useLabel = 'Use reviewed text' }: { onText: (text: string) => void; disabled?: boolean; limit?: number; useLabel?: string }) {
  const { language } = useTranslation();
  const [text, setText] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const revision = useRef(0), lock = useRef(false);
  useFocusEffect(useCallback(() => () => { revision.current++; lock.current = false; setText(''); setBusy(false); }, []));
  async function scan(camera: boolean) {
    if (disabled || lock.current) return;
    if (Platform.OS === 'web') { setError('Photo text recognition is available in the Android and iOS app. Type or paste the text instead.'); return; }
    const turn = ++revision.current; lock.current = true; setBusy(true); setError(''); setText('');
    try {
      const picker = await import('expo-image-picker');
      if (camera && !(await picker.requestCameraPermissionsAsync()).granted) { if (turn === revision.current) setError('Camera access is off. Choose an existing photo or type the details.'); return; }
      const image = camera ? await picker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }) : await picker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (image.canceled || turn !== revision.current) return;
      const { requireNativeModule } = await import('expo');
      const reader = requireNativeModule<{ recognize: (uri: string, language: string) => Promise<string> }>('ArogioDocumentText');
      const result = { text: await reader.recognize(image.assets[0].uri, language) };
      if (turn !== revision.current) return;
      if (!result.text.trim()) { setError('No text was found. Try a clear photo of printed text or enter it manually.'); return; }
      setText(result.text.slice(0, limit));
      if (result.text.length > limit) setError(`Only the first ${limit} characters fit. Edit the text to keep the relevant details.`);
    } catch { if (turn === revision.current) setError('Photo text recognition could not run. A new app build may be required. You can enter the text manually.'); }
    finally { if (turn === revision.current) { lock.current = false; setBusy(false); } }
  }
  return <View style={{ gap: 8 }}><DText kind="small">Read printed text from a prescription or report photo on this device. Check every word and number. Recognition can be wrong, especially handwriting. Nothing is sent automatically.</DText><View style={[ds.row, { flexWrap: 'wrap' }]}><DAction label={busy ? 'Reading photo…' : 'Scan photo'} disabled={disabled || busy} onPress={() => void scan(true)} /><DAction label="Choose document photo" disabled={disabled || busy} onPress={() => void scan(false)} /></View>{!!text && <><DField label="Review recognized text" multiline value={text} onChangeText={setText} maxLength={limit} style={{ minHeight: 120 }} /><DAction filled label={useLabel} disabled={disabled || busy || !text.trim()} onPress={() => { onText(text.trim()); setText(''); }} /><DAction label="Discard text" onPress={() => setText('')} /></>}{!!error && <DText kind="small" color="#BD3038">{error}</DText>}</View>;
}
