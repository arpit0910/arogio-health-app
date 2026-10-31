import { useTranslation } from "../../localization/LanguageProvider";
import { usePalette, useAppearance } from '../../theme/AppearanceProvider';
import { useState } from 'react';
import { Keyboard, Platform, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { TimeField } from './TimeField';
import { Button } from '../../components/ui/Button';

import { AppIcon } from '../../components/app/AppIcon';
import { useCareStyles } from '../../components/app/CareUI';
export function CalendarField({
  label,
  value,
  onChange,
  mode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode: 'date' | 'time';
}) {
  const { t: tr, locale } = useTranslation();
  const colors = usePalette();
  const { scheme } = useAppearance();
  const c = useCareStyles();

  const [open, setOpen] = useState(false);
  const date = new Date(`${value || '2000-01-01'}T12:00:00`);
  const select = (selected: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    onChange(
      `${selected.getFullYear()}-${pad(selected.getMonth() + 1)}-${pad(selected.getDate())}`,
    );
  };
  if (mode === 'time')
    return <TimeField label={label} value={value} onChange={onChange} />;
  const show = () => {
    Keyboard.dismiss();
    if (Platform.OS === 'android')
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        display: 'default',
        positiveButton: { label: 'Save date', textColor: colors.primary },
        negativeButton: { label: 'Cancel', textColor: colors.muted },
        onValueChange: (_event, selected) => select(selected),
      });
    else setOpen(!open);
  };
  return (
    <View style={{ gap: 7 }}>
      <Text style={c.text}>{tr(label)}</Text>
      <Button
        variant="secondary"
        title={
          tr(value
            ? new Intl.DateTimeFormat(locale, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }).format(date)
            : 'Choose date')
        }
        leading={<AppIcon name="calendar" size={21} />}
        onPress={show}
      />
      {open && (
        <>
          <DateTimePicker
            value={date}
            mode={mode}
            display="spinner"
            themeVariant={scheme}
            textColor={colors.ink}
            onValueChange={(_event, selected) => select(selected)}
          />
          <Button title={tr("Done")} onPress={() => setOpen(false)} />
        </>
      )}
    </View>
  );
}
