import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { BirthDatePickerProps } from '../birthDate';
import { birthDateInitialValue, birthDateValue } from '../model';
import { colors } from '../../../theme/tokens';
import { ProfileDialog } from './ProfilePrimitives';

function AndroidBirthDatePicker(props: BirthDatePickerProps) {
  // Snapshot this dialog's values; parent rerenders must not reopen it.
  const [initial] = useState(() => props);
  useEffect(() => {
    DateTimePickerAndroid.open({
      mode: 'date', display: 'default', value: birthDateInitialValue(initial.value),
      minimumDate: new Date(1900, 0, 1), maximumDate: new Date(),
      positiveButton: { label: 'Save', textColor: colors.primary },
      negativeButton: { label: 'Cancel', textColor: colors.muted },
      onValueChange: (_event, date) => initial.onSelect(birthDateValue(date)),
      onDismiss: initial.onClose,
    });
    return () => { void DateTimePickerAndroid.dismiss('date'); };
  }, [initial]);
  return null;
}

export function ProfileBirthDatePicker(props: BirthDatePickerProps) {
  const [date, setDate] = useState(() => birthDateInitialValue(props.value));
  if (Platform.OS === 'android') return <AndroidBirthDatePicker {...props} />;
  return <ProfileDialog title="Date of birth" subtitle="Choose your date of birth." value={birthDateValue(date)} onChange={() => {}} onSave={() => props.onSelect(birthDateValue(date))} onClose={props.onClose}>
    <DateTimePicker accessibilityLabel="Date of birth" mode="date" display="spinner" value={date}
      minimumDate={new Date(1900, 0, 1)} maximumDate={new Date()} themeVariant="light" textColor={colors.ink}
      onValueChange={(_event, selected) => setDate(selected)} style={{ width: '100%' }} />
  </ProfileDialog>;
}
