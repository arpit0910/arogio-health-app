import { useState } from 'react';
import { View } from 'react-native';
import { DAction, DCard, DField, DText } from '../../components/app/DesignUI';
import { useTranslation } from '../../localization/LanguageProvider';
import { NEARBY_RADIUS_KM, type useDirectoryLocation } from './useDirectoryLocation';

export function DirectoryLocationControl({ area, radiusKm = NEARBY_RADIUS_KM }: { area: ReturnType<typeof useDirectoryLocation>; radiusKm?: number }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(null);
  const city = draft ?? area.city;
  function locate(mode: 'city' | 'nearby') {
    setDraft(null);
    void area.locate(mode);
  }
  function applyCity() {
    if (!city.trim()) return;
    area.selectCity(city);
    setDraft(null);
  }
  return <DCard>
    <DText kind="label">{t('Search area')}</DText>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <DAction label={t('Use my city')} disabled={area.locating} onPress={() => locate('city')} />
      <DAction label={t('Near me')} filled={!!area.position} disabled={area.locating} onPress={() => locate('nearby')} />
    </View>
    <DField label={t('City')} placeholder={t('Enter a city')} value={city} onChangeText={setDraft} onSubmitEditing={applyCity} maxLength={80} />
    <DAction label={t('Search this city')} disabled={!city.trim()} onPress={applyCity} />
    <View accessibilityLiveRegion="polite"><DText>
      {area.locating ? t('Finding your location…') : area.position
        ? `${t('Nearest first')} · ${radiusKm} km`
        : area.city ? `${t('Showing listings in')} ${area.city}` : t('Choose a city to see local listings.')}
    </DText>
    {!!area.locationError && <DText>{t(area.locationError)}</DText>}</View>
  </DCard>;
}
