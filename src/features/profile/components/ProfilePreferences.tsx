import { usePalette } from '../../../theme/AppearanceProvider';
import { StyleSheet, Text, View } from 'react-native';
import { Checkbox } from '../../auth/components/AuthPrimitives';
import { fonts } from '../../../theme/tokens';
import type { SetupDraft } from '../model';
import { ProfileHeading } from './ProfilePrimitives';

type Preference = 'healthReminders' | 'tipsAndInsights' | 'productUpdates';

export function ProfilePreferences({ values, onChange, disabled = false }: {
  values: Pick<SetupDraft, Preference>;
  onChange: (key: Preference, checked: boolean) => void;
  disabled?: boolean;
}) {
  const styles = useStyles();

  return <>
    <ProfileHeading title="Stay in the loop" subtitle="Choose the updates you would like. These choices are optional." />
    {([
      { key: 'healthReminders', title: 'Health reminders', subtitle: 'Reminders when this feature becomes available' },
      { key: 'tipsAndInsights', title: 'Tips and insights', subtitle: 'Health and wellbeing updates' },
      { key: 'productUpdates', title: 'Product updates', subtitle: 'New features and important announcements' },
    ] as const).map(preference => {
      const toggle = () => onChange(preference.key, !values[preference.key]);
      return <View key={preference.key} style={styles.preference}>
        <Checkbox checked={values[preference.key]} onChange={toggle} disabled={disabled}
          label={`${preference.title}. ${preference.subtitle}`}>
          <Text style={styles.copy} onPress={disabled ? undefined : toggle}>{preference.title}</Text>
        </Checkbox>
        <Text style={styles.description} onPress={disabled ? undefined : toggle}>{preference.subtitle}</Text>
      </View>;
    })}
  </>;
}

const useStyles = () => {
  const colors = usePalette();
return StyleSheet.create({
  preference: { borderBottomWidth: 1, borderColor: colors.border, paddingTop: 4, paddingBottom: 16 },
  copy: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 23, color: colors.ink },
  description: { marginLeft: 28, fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.muted },
});
};
