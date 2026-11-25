import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { usePalette } from '../../theme/AppearanceProvider';
import { typeStyles } from '../../theme/tokens';
import { useTranslation } from '../../localization/LanguageProvider';
import { careDirections, carePhone, careRoute, type CareEntry } from '../care-directory/api';
import { ArticleThumbnail } from '../articles/ArticleThumbnail';
import { loadArticles } from '../../services/api/healthResourcesApi';
import type { loadDiscovery } from './discoveryApi';
import { ProviderArtwork } from '../../components/app/ProviderArtwork';

export function HomeSectionHeading({ title, detail, action, onPress }: { title: string; detail?: string; action: string; onPress: () => void }) {
  const c = usePalette(), { t } = useTranslation();
  return <View style={s.heading}><View style={s.copy}><Text accessibilityRole="header" style={[typeStyles.title, { color: c.ink }]}>{t(title)}</Text>{detail && <Text style={[typeStyles.detail, { color: c.muted }]}>{t(detail)}</Text>}</View><TouchTarget accessibilityRole="button" accessibilityLabel={`${t(action)}: ${t(title)}`} onPress={onPress} style={s.textAction}><Text style={[typeStyles.label, { color: c.primary }]}>{t(action)}</Text><AppIcon name="right" size={12} color={c.primary} /></TouchTarget></View>;
}

function SectionState({ loading, error, retry, empty }: { loading: boolean; error: boolean; retry: () => void; empty: string }) {
  const c = usePalette(), { t } = useTranslation();
  return <View style={[s.state, { backgroundColor: c.surface, borderColor: c.border }]}><AppIcon name={error ? 'cloud' : 'shield'} size={24} color={c.primary} /><Text style={[typeStyles.body, s.copy, { color: c.muted }]}>{t(loading ? 'Loading published care information…' : error ? 'Care information could not load. Please try again.' : empty)}</Text>{error && <TouchTarget accessibilityRole="button" onPress={retry} style={s.textAction}><Text style={[typeStyles.label, { color: c.primary }]}>{t('Retry')}</Text></TouchTarget>}</View>;
}

function HomeProviderCard({ entry, specialist = false }: { entry: CareEntry; specialist?: boolean }) {
  const c = usePalette(), { t, language } = useTranslation(), router = useRouter(), [error, setError] = useState('');
  const name = language === 'hi' && entry.nameHi ? entry.nameHi : entry.name;
  const phone = carePhone(entry.phone) ?? carePhone(entry.alternatePhone ?? null);
  const directions = careDirections(entry);
  const address = (language === 'hi' && entry.addressHi) || entry.address || entry.city;
  function open(url: string) {
    setError('');
    void Linking.openURL(url).catch(() => setError('Could not open this action. View details for contact information.'));
  }
  return <View style={[s.provider, specialist && { width: 270 }, { backgroundColor: c.surface, borderColor: c.border }]}>
    <TouchTarget accessibilityRole="button" accessibilityLabel={`${t('View details')}: ${name}`} onPress={() => router.push(careRoute(entry))} style={s.providerHeading}>
      <ProviderArtwork entry={entry} style={specialist ? { width: 56, height: 56, borderRadius: 28 } : undefined} />
      <View style={s.copy}>{!!entry.details.providerType && <Text style={[typeStyles.label, { color: c.primary }]}>{entry.details.providerType}</Text>}<Text style={[typeStyles.title, { color: c.ink }]} numberOfLines={2}>{name}</Text><Text style={[typeStyles.detail, { color: c.secondary }]} numberOfLines={2}>{entry.details.specialties.join(', ') || entry.city}</Text><Text style={[typeStyles.detail, { color: c.muted }]} numberOfLines={2}>{address}</Text></View>
    </TouchTarget>
    <View style={s.tags}>{entry.details.specialties.slice(0, 2).map(text => <Text key={text} style={[typeStyles.label, s.tag, { backgroundColor: c.subtle, color: c.primary }]}>{text}</Text>)}</View>
    <View style={s.providerActions}>
      {phone && <TouchTarget accessibilityRole="button" accessibilityLabel={`${t('Call')}: ${name}`} onPress={() => open(phone)} style={[s.providerAction, { backgroundColor: c.subtle }]}>
        <AppIcon name="phone" size={17} color={c.primary} /><Text style={[typeStyles.label, { color: c.primary }]}>{t('Call')}</Text>
      </TouchTarget>}
      {directions && <TouchTarget accessibilityRole="button" accessibilityLabel={`${t('Directions')}: ${name}`} onPress={() => open(directions)} style={[s.providerAction, { backgroundColor: c.subtle }]}>
        <AppIcon name="directions" size={17} color={c.primary} /><Text style={[typeStyles.label, { color: c.primary }]}>{t('Directions')}</Text>
      </TouchTarget>}
      <TouchTarget accessibilityRole="button" accessibilityLabel={`${t('View details')}: ${name}`} onPress={() => router.push(careRoute(entry))} style={[s.providerAction, { backgroundColor: c.primary }]}>
        <Text style={[typeStyles.label, { color: c.onPrimary }]}>{t('View details')}</Text>
      </TouchTarget>
    </View>
    {!!error && <Text accessibilityRole="alert" style={[typeStyles.detail, { color: c.error }]}>{t(error)}</Text>}
  </View>;
}

export function HomeCareDiscovery({ city, data, pending, error, retry }: { city?: string; data?: Awaited<ReturnType<typeof loadDiscovery>>; pending: boolean; error: boolean; retry: () => void }) {
  const router = useRouter(), c = usePalette(), { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  // Only source-provided provider types can be used as filters or badges.
  const types = [...new Set(data?.hospitals.items.map(entry => entry.details.providerType).filter(Boolean))];
  const hospitals = data?.hospitals.items.filter(entry => filter === 'all' || entry.details.providerType === filter) ?? [];
  const open = (pathname: '/hospitals' | '/doctors') => router.push({ pathname, params: city ? { city } : {} });
  return <View style={{ gap: 28 }}>
    <View style={{ gap: 10 }}><HomeSectionHeading title="Hospitals & Clinics" detail={city || 'Hospital directory information'} action="View all" onPress={() => open('/hospitals')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}><View style={{ flexDirection: 'row', gap: 6 }}>{['all', ...types].map(value => <TouchTarget key={value} accessibilityRole="radio" accessibilityState={{ checked: filter === value }} accessibilityLabel={t(value === 'all' ? 'All hospitals' : value)} onPress={() => setFilter(value)} style={[s.filter, { backgroundColor: value === filter ? c.primary : c.surface, borderColor: c.border }]}><Text style={[typeStyles.label, { color: value === filter ? c.onPrimary : c.muted }]}>{t(value === 'all' ? 'All' : value)}</Text></TouchTarget>)}<TouchTarget accessibilityRole="button" onPress={() => router.push('/hospitals')} style={[s.filter, { backgroundColor: c.surface, borderColor: c.border }]}><Text style={[typeStyles.label, { color: c.muted }]}>{t('Browse directory')}</Text><AppIcon name="right" size={12} /></TouchTarget></View></ScrollView>
      {hospitals.map(entry => <HomeProviderCard key={entry.id} entry={entry} />)}{!hospitals.length && <SectionState loading={pending} error={error || data?.hospitals.status === 'unavailable'} retry={retry} empty="Listed hospitals will appear here. Emergency contacts remain available." />}
    </View>
    <View style={{ gap: 12 }}><HomeSectionHeading title="Specialists" detail={city || 'Find the right care for you'} action="Find doctors" onPress={() => open('/doctors')} />
      {data?.doctors.items.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>{data.doctors.items.map(entry => <HomeProviderCard key={entry.id} entry={entry} specialist />)}</ScrollView> : <SectionState loading={pending} error={error || data?.doctors.status === 'unavailable'} retry={retry} empty="Specialists will appear here when listed." />}
    </View>
  </View>;
}

export function HomeGuides() {
  const c = usePalette(), { t, language } = useTranslation(), router = useRouter();
  const articles = useQuery({ queryKey: ['articles', 'home'], queryFn: ({ signal }) => loadArticles('', 1, signal, { limit: 3 }), staleTime: 300000 });
  return <View style={{ gap: 10 }}><HomeSectionHeading title="Featured Health Guides" detail="Ideas for your everyday wellbeing" action="Browse all" onPress={() => router.push('/articles')} />
    {articles.data?.items.slice(0, 2).map(article => <TouchTarget key={article.id} accessibilityRole="button" accessibilityLabel={`${t('Read')}: ${language === 'hi' && article.title_hi ? article.title_hi : article.title_en}`} onPress={() => router.push({ pathname: '/articles/[id]', params: { id: article.id } })} style={[s.article, { backgroundColor: c.surface }]}><ArticleThumbnail thumbnailUrl={article.thumbnail_url} imageUrl={article.image_url} style={{ width: 96, height: 86, borderRadius: 12 }} /><View style={s.copy}><Text style={[typeStyles.label, { color: c.primary }]}>{language === 'hi' && article.category_hi ? article.category_hi : article.category}</Text><Text style={[typeStyles.title, { color: c.ink, fontSize: 17, lineHeight: 23 }]} numberOfLines={2}>{language === 'hi' && article.title_hi ? article.title_hi : article.title_en}</Text><Text style={[typeStyles.body, { color: c.muted }]} numberOfLines={2}>{language === 'hi' && article.excerpt_hi ? article.excerpt_hi : article.excerpt_en}</Text></View></TouchTarget>)}
    {!articles.data?.items.length && <SectionState loading={articles.isPending} error={articles.isError} retry={() => void articles.refetch()} empty="New articles will appear here when published." />}
  </View>;
}
const s = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 6 }, copy: { flex: 1, minWidth: 0 }, textAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 4 },
  state: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, minHeight: 98 },
  provider: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 }, providerHeading: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }, providerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, providerAction: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  filter: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 14, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth }, article: { flexDirection: 'row', padding: 16, gap: 10, borderRadius: 20 },
});
