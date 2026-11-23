import { DocumentPhotoInput } from '../../components/ui/DocumentPhotoInput';
import { AccessibleText as Text, AccessibleTextInput as TextInput } from '../../components/ui/AccessibleText';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from "../../localization/LanguageProvider";
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DCard, DText, DPill, design } from '../../components/app/DesignUI';
import { AppHeader } from '../../components/app/AppHeader';
import { AppIcon } from '../../components/app/AppIcon';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts, typeStyles } from '../../theme/tokens';
import { useAuth } from '../authentication/context/AuthContext';
import { askJeeva } from './chatApi';
import { conversationForQuestion, type ChatMessage } from './model';
import { ChatReply } from './ChatReply';

const suggestions = [{ text: 'What can affect my sleep?', icon: 'moon' }, { text: 'How do I log water in Arogio?', icon: 'drop' }, { text: 'What does blood pressure mean?', icon: 'heart' }, { text: 'How do medicine reminders work?', icon: 'bell' }] as const;
export function JeevaScreen() {
  const { user } = useAuth();
  const { draft: articleDraft } = useLocalSearchParams<{ draft?: string }>();
  const initialDraft = typeof articleDraft === 'string' ? articleDraft.slice(0, 2000) : '';
  return user ? <ChatSession key={`${user.id}:${initialDraft}`} initialDraft={initialDraft} /> : null;
}
function ChatSession({ initialDraft = '' }: { initialDraft?: string }) {
  const { t: tr } = useTranslation();
  const colors = usePalette(), s = useStyles(), { user } = useAuth();
  const { width } = useWindowDimensions();
  const [messages, setMessages] = useState<ChatMessage[]>([]), [draft, setDraft] = useState(initialDraft);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [useSavedHealth, setUseSavedHealth] = useState(false);
  const [contextOpen, setContextOpen] = useState(false), [documentOpen, setDocumentOpen] = useState(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null), request = useRef<AbortController | null>(null), revision = useRef(0);
  const lock = useRef(false), mounted = useRef(true), pending = useRef<ChatMessage[] | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current?.abort(); }; }, []);
  const hasPending = messages.at(-1)?.role === 'user';
  async function send(question?: string, retry = false) {
    if (lock.current || (!retry && error)) return;
    let conversation: ChatMessage[];
    try { conversation = retry && pending.current ? pending.current : conversationForQuestion(messages, question ?? draft); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Write a question first.'); return; }
    lock.current = true; setBusy(true); setError('');
    const turn = ++revision.current, controller = new AbortController(); request.current = controller;
    pending.current = conversation;
    if (!retry) { setMessages(conversation); setDraft(''); }
    try {
      const reply = await askJeeva(conversation, controller.signal, useSavedHealth);
      if (!mounted.current || revision.current !== turn) return;
      setMessages([...conversation, reply]); pending.current = null;
    } catch (cause) {
      if (mounted.current && revision.current === turn) setError(cause instanceof Error ? cause.message : 'Jeeva could not answer. Please retry.');
    } finally {
      if (mounted.current && revision.current === turn) { lock.current = false; setBusy(false); }
    }
  }
  function clear() {
    revision.current++; request.current?.abort(); request.current = null; pending.current = null;
    lock.current = false; setMessages([]); setDraft(''); setError(''); setBusy(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function edit() {
    const question = pending.current?.at(-1)?.content;
    if (question) { setDraft(question); setMessages(pending.current!.slice(0, -1)); }
    pending.current = null; setError('');
  }
  const lastReply = messages.at(-1);
  return <SafeAreaView edges={width >= 768 ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']} style={s.screen}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.screen}>
      <AppHeader />
      <View style={s.contextBar}>
        <TouchTarget accessibilityRole="button" accessibilityState={{ expanded: contextOpen }} onPress={() => setContextOpen(value => !value)} style={s.contextToggle}><AppIcon name="shield" size={18} /><Text style={[s.detail, { flex: 1 }]}>{tr('Privacy & record access')}</Text><AppIcon name={contextOpen ? 'down' : 'right'} size={16} /></TouchTarget>
        {contextOpen && <View style={s.contextPanel}><View style={s.contextControl}><Text style={[s.body, { flex: 1 }]}>{tr("Use saved wellness tracking")}</Text><Switch accessibilityLabel={tr("Use saved wellness tracking. Changing this starts a new chat.")} value={useSavedHealth} disabled={busy || Boolean(error)} onValueChange={value => { clear(); setUseSavedHealth(value); }} trackColor={{ false: colors.border, true: colors.primary }} /></View><Text style={s.detail}>{tr(useSavedHealth ? 'Messages and saved profile, activity, water, medicine and cycle summaries go to the AI service. Device-only readings are not included.' : 'Only your chat messages go to the AI service.')} {tr('Changing record access starts a new chat.')}</Text></View>}
      </View>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={s.conversation} onContentSizeChange={() => { if (busy || hasPending || documentOpen) scroll.current?.scrollToEnd({ animated: false }); }}>
        <DCard style={{ gap: 10, padding: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={[s.avatar, { width: 36, height: 36, borderRadius: 18 }]}><AppIcon name="sparkles" size={21} color={colors.onBrand} /></View><View style={{ flex: 1 }}><DText kind="label">Jeeva AI</DText><DText kind="small">Health information & care navigation</DText></View><TouchTarget accessibilityRole="button" onPress={clear} style={{ paddingHorizontal: 10, borderRadius: 20, backgroundColor: colors.subtle }}><DText kind="small">Reset</DText></TouchTarget></View></DCard>
        <View style={{ padding: 12, borderRadius: 10, backgroundColor: colors.mintSurface, gap: 5 }}><DText kind="small">AI health information: Not a diagnosis or emergency service. For severe distress or trauma, seek immediate emergency assistance.</DText><DPill>Emergency: 108</DPill></View>
        {!messages.length ? <View style={{ gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}><View style={[s.avatar, { width: 28, height: 28, borderRadius: 14 }]}><AppIcon name="sparkles" size={16} color={colors.onBrand} /></View><View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14, gap: 8 }}><DText kind="small" color={design.green}>JEEVA AI</DText><DText color={colors.ink}>{`Hello ${user?.fullName?.split(' ')[0] || 'there'}! I am Jeeva, your health information assistant. What health topic or Arogio feature can I help you understand?`}</DText></View></View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginLeft: 37 }}>{suggestions.map(item => <TouchTarget key={item.text} accessibilityRole="button" onPress={() => void send(tr(item.text))} style={{ paddingHorizontal: 10, minHeight: 34, borderRadius: 18, backgroundColor: colors.mintSurface, justifyContent: 'center' }}><DText kind="small" color={colors.primary}>{tr(item.text)}</DText></TouchTarget>)}</View></View> : messages.map((message, index) => message.role === 'assistant' ? <View key={index} onLayout={({ nativeEvent: { layout } }) => { if (index === messages.length - 1) scroll.current?.scrollTo({ y: Math.max(0, layout.y - 8), animated: false }); }}><ChatReply message={message} /></View> : <View key={index} style={[s.message, s.userMessage]}><Text selectable style={[s.body, { color: colors.onPrimary }]}>{message.content}</Text></View>)}
        {documentOpen && <DocumentPhotoInput onText={text => { setDraft(text); setDocumentOpen(false); }} disabled={busy || Boolean(error)} useLabel="Use in question draft" />}
        {busy && <View accessibilityLiveRegion="polite" accessibilityLabel={tr("Jeeva is preparing a reply")} style={s.waiting}><ActivityIndicator color={colors.primary} /><Text style={s.detail}>{tr('Preparing a helpful reply...')}</Text></View>}
        {!busy && !error && lastReply?.role === 'assistant' && (!lastReply.kind || lastReply.kind === 'answer') && <View style={s.followups}>{['Explain that more simply', 'What could I ask my clinician?'].map(text => <TouchTarget key={text} accessibilityRole="button" onPress={() => void send(tr(text))} disabled={Boolean(draft.trim())} style={s.followup}><Text style={[s.detail, { color: colors.primary }]}>{tr(text)}</Text></TouchTarget>)}</View>}
        {Boolean(error) && <View accessibilityLiveRegion="polite" style={s.error}><Text style={[s.body, { color: colors.error }]}>{tr(error)}</Text>{hasPending && <Button title={tr("Retry question")} variant="secondary" onPress={() => void send(undefined, true)} />}<Button title={tr(hasPending ? 'Edit question' : 'Continue writing')} variant="secondary" onPress={edit} /></View>}
      </ScrollView>
      <View style={s.composer}><TouchTarget accessibilityRole="button" accessibilityLabel={tr('Read prescription or report photo')} disabled={busy || Boolean(error)} onPress={() => setDocumentOpen(value => !value)}><DText kind="small">{tr(documentOpen ? 'Close document reader' : 'Read prescription or report photo')}</DText></TouchTarget>

        <View style={s.inputRow}><TextInput accessibilityLabel={tr("Your question for Jeeva")} placeholder={tr('Ask symptoms or healthcare')} placeholderTextColor={colors.placeholder} value={draft} onFocus={() => setContextOpen(false)} onChangeText={setDraft} editable={!busy && !error} maxLength={2000} multiline textAlignVertical="top" selectionColor={colors.primary} style={s.input} /><TouchTarget accessibilityRole="button" accessibilityLabel={tr(busy ? 'Preparing a reply' : 'Send question')} accessibilityState={{ disabled: busy || !draft.trim() || Boolean(error), busy }} disabled={busy || !draft.trim() || Boolean(error)} onPress={() => void send()} style={[s.send, (!draft.trim() || busy || error) && { opacity: 0.5 }]}>{busy ? <ActivityIndicator color={colors.onPrimary} /> : <AppIcon name="send" size={24} color={colors.onPrimary} />}</TouchTarget></View>
        {draft.length > 1600 && <Text style={s.detail}>{draft.length}/2,000</Text>}
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const useStyles = () => {
  const c = usePalette();
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    conversation: { flexGrow: 1, width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
    welcome: { paddingTop: 16, gap: 20 }, introRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.mintSurface, padding: 20, borderRadius: 20 }, avatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: c.brandSurface, alignItems: 'center', justifyContent: 'center' },
    heading: { ...typeStyles.heading, color: c.ink },
    sectionTitle: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 25, color: c.ink, marginTop: 8 },
    body: { ...typeStyles.body, color: c.ink },
    detail: { ...typeStyles.detail, color: c.muted },
    speaker: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: c.primary },
    suggestions: { gap: 10 }, suggestion: { minHeight: 68, padding: 16, gap: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: c.border, borderRadius: 20 },
    message: { gap: 6, maxWidth: '90%', padding: 16, borderRadius: 16 },
    userMessage: { alignSelf: 'flex-end', backgroundColor: c.primary },
    waiting: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 48 }, error: { gap: 12, padding: 16, backgroundColor: c.errorSurface, borderRadius: 12 },
    composer: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 10, borderTopWidth: 1, borderColor: c.border },
    contextBar: { width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 20 }, contextToggle: { flexDirection: 'row', gap: 8, alignItems: 'center' }, contextPanel: { padding: 14, backgroundColor: c.surface, borderRadius: 14, marginBottom: 10, gap: 8 },
    contextControl: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
    input: { flex: 1, minWidth: 0, minHeight: 56, maxHeight: 128, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, includeFontPadding: false, textAlignVertical: 'top', color: c.ink },
    send: { width: 52, minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: c.primary },
    followups: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, followup: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: c.border, borderRadius: 12, justifyContent: 'center' },
    clear: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 8 }, action: { fontFamily: fonts.semibold, fontSize: 14, color: c.primary },
  });
};
