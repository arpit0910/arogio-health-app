import { AccessibleText as Text, AccessibleTextInput as TextInput } from '../../components/ui/AccessibleText';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCareStyles } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { useTranslation } from '../../localization/LanguageProvider';
import { AppScreen } from '../../components/app/AppScreen';
import { PageIntro } from '../../components/app/PageIntro';
import { useAuth } from '../authentication/context/AuthContext';
import type { PropsWithChildren } from 'react';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';

export function ResourceState({ loading, error, empty, onRetry }: { loading?: boolean; error?: boolean; empty?: string; onRetry?: () => void }) {
  const c = useCareStyles(), colors = usePalette(), { t } = useTranslation();
  return <View style={{ paddingVertical: 24, gap: 16 }}>
    {loading ? <ActivityIndicator accessibilityLabel={t('Loading directory')} color={colors.primary} /> : error ? <><Text accessibilityRole="alert" style={c.title}>{t('We could not load this information')}</Text><Text style={c.text}>{t('Check your connection and try again. This feature may also need the latest service update.')}</Text>{onRetry && <Button title={t('Try again')} variant="secondary" onPress={onRetry} />}</> : empty ? <><Text style={c.title}>{t('No entries yet')}</Text><Text style={c.text}>{t(empty)}</Text></> : null}
  </View>;
}
export function AppSearchBar({ value, onChange, onSubmit, label = 'Search care by name, area or specialty' }: { value: string; onChange: (value: string) => void; onSubmit?: () => void; label?: string }) {
  const colors = usePalette(), { t } = useTranslation();
  return <View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, backgroundColor: colors.subtle, borderRadius: 14 }}><AppIcon name="search" size={20} color={colors.muted} /><TextInput accessibilityLabel={t(label)} placeholder={t(label)} value={value} onChangeText={onChange} onSubmitEditing={onSubmit} maxLength={150} returnKeyType="search" selectionColor={colors.primary} placeholderTextColor={colors.placeholder} style={{ flex: 1, minWidth: 0, minHeight: 48, color: colors.ink, paddingVertical: 12, paddingRight: 8, fontFamily: fonts.regular, fontSize: 14 }} />{onSubmit && <TouchTarget accessibilityRole="button" accessibilityLabel={t('Search care')} onPress={onSubmit} style={{ width: 48, alignItems: 'center', justifyContent: 'center' }}><AppIcon name="arrow" size={20} color={colors.primary} /></TouchTarget>}</View></View>;
}
export function PrivateFeature({ children }: PropsWithChildren) {
  const router = useRouter();
  const { user, isLoading } = useAuth(), { t } = useTranslation();
  if (isLoading) return <AppScreen><ResourceState loading /></AppScreen>;
  if (user) return children;
  return <AppScreen><PageIntro title="Your health stays personal" description="Sign in to save your routines and use Jeeva. You can browse care and emergency contacts without an account." icon="shield" /><View style={{ gap: 12 }}><Button title={t('Sign in')} onPress={() => router.push('/login')} /><Button title={t('Create account')} variant="secondary" onPress={() => router.push('/signup')} /></View></AppScreen>;
}
