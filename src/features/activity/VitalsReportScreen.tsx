import { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DHeading, DText } from '../../components/app/DesignUI';
import { useWellness } from '../personal-wellness/WellnessContext';
import { useHealthSync } from '../health-connections/HealthSyncProvider';
import { useAuth } from '../authentication/context/AuthContext';
import { vitalsReportHtml } from './vitalsReport';
export function VitalsReportScreen() {
  const wellness = useWellness(), health = useHealthSync(), { user } = useAuth();
  const [uri, setUri] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), lock = useRef(false);
  async function prepare() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setUri('');
    try {
      const html = vitalsReportHtml(user?.fullName ?? '', wellness.data, health.connected ? health.snapshot : null);
      if (Platform.OS === 'web') {
        const tab = window.open('', '_blank');
        if (!tab) throw new Error('Allow popups to open the report.');
        tab.document.write(html); tab.document.close(); tab.focus(); tab.print();
      } else { const file = await Print.printToFileAsync({ html }); setUri(file.uri); }
    } catch { setError('The PDF could not be prepared. A new app build with PDF support may be required. Try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function share() {
    if (lock.current || !uri) return;
    lock.current = true; setBusy(true); setError('');
    try { if (!await Sharing.isAvailableAsync()) throw new Error(); await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf', dialogTitle: 'Share wellness summary' }); }
    catch { setError('Sharing could not open. Try again on your phone.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <AppScreen back title="Wellness PDF"><View style={{ gap: 16 }}><DHeading title="Export your wellness summary" /><DText>Includes retained entered activity totals, available connected readings and recent medicine dose logs, with dates and sources. It is a personal journal, not a clinical assessment.</DText><DCard><DText>{`${wellness.data.activityTracking?.days.length ?? 0} retained activity days`}</DText><DText>{`${health.connected ? health.snapshot?.days.length ?? 0 : 0} connected reading days`}</DText><DText>{`${wellness.data.medicineDoses?.length ?? 0} retained dose records`}</DText></DCard><DText>Prepare the report on this device. Nothing is shared until you choose a destination. Share only with someone you trust.</DText><DAction filled label={busy ? 'Working…' : uri ? 'Prepare updated PDF' : 'Prepare PDF'} disabled={busy || !wellness.ready} onPress={() => void prepare()} />{!!uri && <DAction label="Share PDF" disabled={busy} onPress={() => void share()} />}{!!error && <DText color="#BD3038">{error}</DText>}</View></AppScreen>;
}
