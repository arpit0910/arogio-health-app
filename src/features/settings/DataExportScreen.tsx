import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useState } from 'react';
import { Share, View } from 'react-native';
import { AppScreen } from '../../components/app/AppScreen';
import { PageIntro } from '../../components/app/PageIntro';
import { useCareStyles } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/api/client';
import { useTranslation } from '../../localization/LanguageProvider';
export function DataExportScreen() {
  const { t } = useTranslation(), c = useCareStyles();
  const [data, setData] = useState<string | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function prepare() { if (busy) return; setBusy(true); setError(''); try { const value = await apiClient.request({ path: '/profile/export' }); setData(JSON.stringify(value, null, 2)); } catch { setError('Your export could not be prepared. Check your connection and try again.'); } finally { setBusy(false); } }
  return <AppScreen back><PageIntro title="Export your saved data" description="Prepare your profile and retained wellness snapshot. Device-only readings, health documents and chat are not included. Nothing is shared until you choose a destination." icon="shield" /><View style={{ gap: 16 }}><Text style={c.text}>{t('Your export contains personal health information. Share it only with people or services you trust.')}</Text><Button title={t('Prepare export')} loading={busy} onPress={() => void prepare()} />{data && <><Text style={c.text}>{t('Export ready. Water history covers the last 90 days; other sections include retained records available to your account.')}</Text><Button title={t('Share export')} variant="secondary" onPress={() => void Share.share({ message: data, title: 'Arogio personal data export' }).catch(() => setError('Sharing could not open. Please try again.'))} /></>}{!!error && <Text accessibilityRole="alert" style={c.text}>{t(error)}</Text>}</View></AppScreen>;
}
