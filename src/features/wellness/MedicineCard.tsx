import { Text, View } from 'react-native';
import { AppIcon } from '../../components/app/AppIcon';
import { useCareStyles } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
import { useTranslation } from '../../localization/LanguageProvider';
import { formatClock } from '../../lib/time';
import type { Medicine } from './domain';

export function MedicineCard({ medicine, disabled, onEdit }: { medicine: Medicine; disabled: boolean; onEdit: () => void }) {
  const colors = usePalette(), c = useCareStyles(), { t } = useTranslation();
  return <View style={{ padding: 18, borderRadius: 16, backgroundColor: colors.surface, gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.subtle, alignItems: 'center', justifyContent: 'center' }}><AppIcon name="pill" /></View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text style={c.title}>{medicine.name}</Text><Text style={[c.text, { fontSize: 13 }]}>{t(medicine.enabled ? 'Daily reminders on' : 'Reminders paused')}</Text></View>
    </View>
    <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 14, gap: 12 }}>
      {[...medicine.doses].sort((a, b) => a.time.localeCompare(b.time)).map(dose => <View key={dose.time} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <AppIcon name="clock" size={20} /><View style={{ flex: 1, gap: 2 }}><Text style={[c.text, { color: colors.ink }]}>{formatClock(dose.time)}</Text><Text style={c.text}>{dose.amount}</Text></View>
      </View>)}
    </View>
    {!!medicine.notes && <Text style={c.text}>{medicine.notes}</Text>}
    <Button title={t('Edit medicine')} variant="secondary" disabled={disabled} leading={<AppIcon name="pencil" size={18} />} onPress={onEdit} />
  </View>;
}
