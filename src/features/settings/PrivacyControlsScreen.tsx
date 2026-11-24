import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { CareGroup, CareRow } from '../../components/app/CareUI';
import { AppIcon } from '../../components/app/AppIcon';
import { DText } from '../../components/app/DesignUI';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';

export function PrivacyControlsScreen() {
  const router = useRouter();
  const colors = usePalette();
  const { t } = useTranslation();

  return (
    <AppScreen back title={t('Privacy & access')}>
      <View style={{ gap: 10, padding: 20, backgroundColor: colors.mintSurface, borderRadius: 24 }}>
        <AppIcon name="shield" size={26} color={colors.primaryPressed} />
        <DText kind="title">Control your data</DText>
        <DText>Jeeva uses saved wellness tracking only when you enable record access in that chat. Changing access starts a new chat. You review photo text before putting it into a question.</DText>
      </View>
      <CareGroup title="Device access">
        <CareRow icon="shield" title={t('Manage app permissions')} onPress={() => router.push('/app-access')} />
        <CareRow icon="sync" title={t('Manage connected health access')} onPress={() => router.push('/connected-health-settings')} />
        <DText>Disconnecting stops health reads in Arogio. Your source health app keeps its records.</DText>
      </CareGroup>
      <CareGroup title="Your information">
        <CareRow icon="report" title={t('Manage health records')} onPress={() => router.push('/health-records')} />
        <CareRow icon="report" title={t('Export saved account data')} onPress={() => router.push('/data-export')} />
        <CareRow icon="book" title={t('Read Privacy Policy')} onPress={() => router.push('/privacy')} />
        <DText>Saved care, search history, health documents and the SOS contact are stored on this device separately for each account. Clear history and remove saved entries, documents or contacts on their respective screens. Health document files are not included in the account export; share them individually from EHR records.</DText>
      </CareGroup>
      <CareGroup title="Account">
        <CareRow icon="user" title={t('Delete account')} onPress={() => router.push('/delete-account')} />
      </CareGroup>
    </AppScreen>
  );
}
