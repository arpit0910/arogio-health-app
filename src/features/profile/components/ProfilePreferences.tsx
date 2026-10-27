import { StyleSheet, Text, View } from 'react-native';
import { Checkbox } from '../../auth/components/AuthPrimitives';
import { colors, fonts } from '../../../theme/tokens';
import type { SetupDraft } from '../model';
import { ProfileHeading } from './ProfilePrimitives';

type Preference = 'healthReminders' | 'tipsAndInsights' | 'productUpdates';

export function ProfilePreferences({ values, onChange, disabled = false }: {
  values: Pick<SetupDraft, Preference>;
  onChange: (key: Preference, checked: boolean) => void;
  disabled?: boolean;
}) {
  return <>
    <ProfileHeading title="Stay on track" subtitle="Get helpful reminders and insights to reach your goals." />
    {([
      { key: 'healthReminders', title: 'Health reminders', subtitle: 'Take medications, track habits and daily check-ins' },
      { key: 'tipsAndInsights', title: 'Tips and insights', subtitle: 'Personalized health tips and recommendations' },
      { key: 'productUpdates', title: 'Product updates', subtitle: 'New features and important announcements' },
    ] as const).map(preference => {
      const toggle = () => onChange(preference.key, !values[preference.key]);
      return <View key={preference.key} style={styles.preference}>
        <Checkbox checked={values[preference.key]} onChange={toggle} disabled={disabled}
          label={`${preference.title}. ${preference.subtitle}`}>
          <Text style={styles.copy} onPress={disabled ? undefined : toggle}>
            {preference.title}{'\n'}<Text style={styles.description}>{preference.subtitle}</Text>
          </Text>
        </Checkbox>
      </View>;
    })}
  </>;
}

const styles = StyleSheet.create({
  preference: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  copy: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 21, color: colors.ink },
  description: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.muted },
});
