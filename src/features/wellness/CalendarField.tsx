import { useTranslation } from "../../localization/LanguageProvider";
import { usePalette, useAppearance } from '../../theme/AppearanceProvider';
import { useId } from 'react';
import { Text, View } from 'react-native';
import { TimeField } from './TimeField';
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
  const { t: tr } = useTranslation();
  const c = useCareStyles();
  const colors = usePalette();
  const { scheme } = useAppearance();

  const labelId = useId();
  if (mode === 'time')
    return <TimeField label={label} value={value} onChange={onChange} />;
  return (
    <View style={{ gap: 7 }}>
      <Text nativeID={labelId} style={c.text}>
        {tr(label)}
      </Text>
      <input
        aria-labelledby={labelId}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          minHeight: 52,
          padding: 14,
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
          color: colors.ink,
          backgroundColor: colors.surface,
          font: 'inherit',
          fontSize: 16,
          colorScheme: scheme,
          accentColor: colors.primary,
          outlineColor: colors.primary,
        }}
      />
    </View>
  );
}
