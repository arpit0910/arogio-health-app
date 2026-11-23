import { useRef, useState } from 'react';
import { View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DField, DText } from '../../components/app/DesignUI';
import { apiClient } from '../../services/api/client';
import { useAuth } from '../authentication/context/AuthContext';
import { ResourceState } from '../care-directory/CarePrimitives';
const feedback = z.object({ id: z.string(), subject: z.string(), message: z.string(), state: z.string(), createdAt: z.string() });
export function FeedbackScreen() {
  const { user } = useAuth(), [subject, setSubject] = useState(''), [message, setMessage] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const lock = useRef(false), pending = useRef<{ id: string; subject: string; message: string } | null>(null);
  const history = useQuery({ queryKey: ['support-feedback', user?.id], queryFn: async ({ signal }) => z.array(feedback).parse(await apiClient.request({ path: '/support/feedback', signal })) });
  async function send() {
    if (lock.current) return;
    if (subject.trim().length < 3 || message.trim().length < 10) { setError('Enter a subject and a message of at least 10 characters.'); return; }
    lock.current = true; setBusy(true); setError(''); setNotice('');
    const same = pending.current?.subject === subject.trim() && pending.current?.message === message.trim();
    const request = same ? pending.current! : { id: Crypto.randomUUID(), subject: subject.trim(), message: message.trim() };
    pending.current = request;
    try {
      const result = feedback.parse(await apiClient.request({ path: `/support/feedback/${request.id}`, method: 'PUT', body: { subject: request.subject, message: request.message } }));
      if (result.id !== request.id) throw new Error();
      pending.current = null; setSubject(''); setMessage(''); setNotice('Feedback received. You can see its status below.'); await history.refetch();
    } catch { setError('Feedback could not be sent. Your message is still here; retry when connected. This may require the latest service update.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <AppScreen back title="Support & feedback"><View style={{ gap: 16 }}><DText>Send feedback about Arogio to the app team. This is not a live chat or emergency service. Avoid including prescriptions, identity documents or other sensitive medical details.</DText><DField label="Subject" value={subject} onChangeText={setSubject} editable={!busy} maxLength={120} /><DField label="Your feedback" multiline value={message} onChangeText={setMessage} editable={!busy} maxLength={2000} style={{ minHeight: 130 }} /><DAction filled label={busy ? 'Sending…' : 'Send feedback'} disabled={busy} onPress={() => void send()} />{!!error && <DText color="#BD3038">{error}</DText>}{!!notice && <DText>{notice}</DText>}<DText kind="title">Your recent feedback</DText>{history.isPending || history.isError ? <ResourceState loading={history.isPending} error={history.isError} onRetry={() => void history.refetch()} /> : history.data?.length ? history.data.map(item => <DCard key={item.id}><DText kind="label">{item.subject}</DText><DText>{item.message}</DText><DText kind="small">{`${item.state} · ${new Date(item.createdAt).toLocaleDateString()}`}</DText></DCard>) : <DText>No feedback sent yet.</DText>}</View></AppScreen>;
}
