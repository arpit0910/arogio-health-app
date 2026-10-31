import { useTranslation } from "../../localization/LanguageProvider";
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/app/AppHeader';
import { AppIcon } from '../../components/app/AppIcon';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { useAuth } from '../auth/context/AuthContext';
import { askJeeva } from './chatApi';
import { conversationForQuestion, type ChatMessage } from './model';

const suggestions = ['Help me build a daily walking habit', 'How do I track water in Arogio?', 'Help me plan a calmer bedtime'];
export function JeevaScreen() {
  const { user } = useAuth();
  return user ? <ChatSession key={user.id} /> : null;
}
function ChatSession() {
  const { t: tr } = useTranslation();
  const colors = usePalette(), s = useStyles();
  const [messages, setMessages] = useState<ChatMessage[]>([]), [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [useSavedHealth, setUseSavedHealth] = useState(true);
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
  }
  function edit() {
    const question = pending.current?.at(-1)?.content;
    if (question) { setDraft(question); setMessages(pending.current!.slice(0, -1)); }
    pending.current = null; setError('');
  }
  return <SafeAreaView edges={['top', 'left', 'right']} style={s.screen}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.screen}>
      <AppHeader title={tr("Jeeva AI")} action={<TouchTarget accessibilityRole="button" accessibilityLabel={tr("Clear chat and start again")} onPress={clear} style={s.clear}><Text style={s.action}>{tr("New chat")}</Text></TouchTarget>} />
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={s.conversation} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
        {!messages.length ? <View style={s.welcome}>
          <Image source={require('../../../assets/home/jeeva.png')} accessible={false} style={s.avatar} />
          <Text accessibilityRole="header" style={s.heading}>{tr("A little help for your day")}</Text>
          <Text style={s.body}>{tr("Ask Jeeva about everyday wellness or how to use Arogio.")}</Text>
          <View style={s.suggestions}>{suggestions.map(text => <TouchTarget key={text} accessibilityRole="button" onPress={() => void send(tr(text))} style={({ pressed }) => [s.suggestion, pressed && { backgroundColor: colors.subtle }]}><Text style={[s.body, { flex: 1 }]}>{tr(text)}</Text><AppIcon name="right" size={18} /></TouchTarget>)}</View>
        </View> : messages.map((message, index) => <View key={index} style={[s.message, message.role === 'user' ? s.userMessage : s.assistantMessage]}>
          <Text style={s.speaker}>{tr(message.role === 'user' ? 'You' : 'Jeeva')}</Text><Text selectable style={s.body}>{message.content}</Text>
        </View>)}
        {busy && <View accessibilityLiveRegion="polite" accessibilityLabel={tr("Jeeva is preparing a reply")} style={s.waiting}><ActivityIndicator color={colors.primary} /><Text style={s.detail}>{tr("Jeeva is thinking…")}</Text></View>}
        {Boolean(error) && <View accessibilityLiveRegion="polite" style={s.error}>
          <Text style={[s.body, { color: colors.error }]}>{tr(error)}</Text>
          {hasPending && <Button title={tr("Retry question")} variant="secondary" onPress={() => void send(undefined, true)} />}
          <Button title={tr(hasPending ? 'Edit question' : 'Continue writing')} variant="secondary" onPress={edit} />
        </View>}
      </ScrollView>
      <View style={s.composer}>
        <View style={s.contextControl}><Text style={[s.body, { flex: 1 }]}>{tr("Use saved health records")}</Text><Switch accessibilityLabel={tr("Use saved health records. Changing this starts a new chat.")} value={useSavedHealth} disabled={busy || Boolean(error)} onValueChange={value => { clear(); setUseSavedHealth(value); }} trackColor={{ false: colors.border, true: colors.primary }} /></View>
        <Text style={s.detail}>{tr(useSavedHealth ? 'Messages and saved profile, activity, water, medicine and cycle summaries go to NVIDIA. Device-only readings are not included.' : 'Only your chat messages go to NVIDIA.')} {tr(" AI guidance, not medical care. Changing record access starts a new chat.")}</Text>
        <TextInput accessibilityLabel={tr("Your question for Jeeva")} placeholder={tr("Ask Jeeva…")} placeholderTextColor={colors.placeholder} value={draft} onChangeText={setDraft} editable={!busy && !error} maxLength={2000} multiline textAlignVertical="top" style={s.input} />
        <View style={s.sendRow}><Text style={s.detail}>{draft.length}/2,000</Text><View style={s.send}><Button title={tr(busy ? 'Thinking…' : 'Send question')} loading={busy} disabled={!draft.trim() || Boolean(error)} onPress={() => void send()} /></View></View>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const useStyles = () => {
  const c = usePalette();
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    conversation: { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, gap: 16 },
    welcome: { paddingTop: 16, gap: 16 }, avatar: { width: 72, height: 72, borderRadius: 36 },
    heading: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 34, color: c.ink },
    body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, color: c.ink },
    detail: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: c.muted },
    speaker: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: c.primary },
    suggestions: { gap: 0, marginTop: 8 }, suggestion: { minHeight: 56, paddingVertical: 14, gap: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: c.border },
    message: { gap: 6, maxWidth: '95%', padding: 16, borderRadius: 16 },
    userMessage: { alignSelf: 'flex-end', backgroundColor: c.subtle }, assistantMessage: { alignSelf: 'flex-start', paddingHorizontal: 0 },
    waiting: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 48 }, error: { gap: 12, padding: 16, backgroundColor: c.errorSurface, borderRadius: 12 },
    composer: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 16, gap: 10, borderTopWidth: 1, borderColor: c.border },
    contextControl: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
    input: { minHeight: 56, maxHeight: 120, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, color: c.ink },
    sendRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, send: { minWidth: 160 },
    clear: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 }, action: { fontFamily: fonts.semibold, fontSize: 14, color: c.primary },
  });
};
