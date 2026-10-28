import { useId } from 'react';
import { Text, View } from 'react-native';
import { TimeField } from './TimeField';
import { careStyles as c } from '../../components/app/CareUI';
import { colors } from '../../theme/tokens';

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
  const labelId = useId();
  if (mode === 'time')
    return <TimeField label={label} value={value} onChange={onChange} />;
  return (
    <View style={{ gap: 7 }}>
      <Text nativeID={labelId} style={c.text}>
        {label}
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
          colorScheme: 'light',
          accentColor: colors.primary,
          outlineColor: colors.primary,
        }}
      />
    </View>
  );
}
