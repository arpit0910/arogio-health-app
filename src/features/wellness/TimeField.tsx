import { useFieldFocus } from '../../components/ui/FocusScrollView';
import { AppIcon } from '../../components/app/AppIcon';
import { useRef, useState, type ComponentRef } from 'react';
import { Text, TextInput, View, useWindowDimensions } from 'react-native';
import { careStyles as c } from '../../components/app/CareUI';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { colors, fonts } from '../../theme/tokens';
import { clockFrom12Hour } from '../../lib/time';

/** Explicit AM/PM controls also work on devices whose system clock is 24-hour. */
export function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const reveal = useFieldFocus();
  const { fontScale } = useWindowDimensions();
  const controlHeight = Math.max(52, Math.ceil(24 * fontScale + 24));
  const hourRef = useRef<ComponentRef<typeof TextInput>>(null),
    minuteRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState<'hour' | 'minute' | null>(null);
  const [draft, setDraft] = useState<{
    source: string;
    hour: string;
    minute: string;
    period: 'AM' | 'PM';
  } | null>(null);
  const [storedHour, storedMinute] = value.split(':');
  const { hour, minute, period } =
    draft?.source === value
      ? draft
      : {
          hour: String(+storedHour % 12 || 12),
          minute: storedMinute,
          period: +storedHour >= 12 ? ('PM' as const) : ('AM' as const),
        };
  const valid = clockFrom12Hour(hour, minute, period);
  function update(h: string, m: string, p: 'AM' | 'PM') {
    const next = clockFrom12Hour(h, m, p);
    setDraft({ source: next ?? value, hour: h, minute: m, period: p });
    if (next) onChange(next);
  }
  const input = {
    minHeight: controlHeight,
    minWidth: 60,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
    backgroundColor: colors.surface,
    textAlign: 'center' as const,
  };
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <AppIcon name="clock" size={20} />
        <Text style={[c.text, { flex: 1 }]}>{label} / IST</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            flexBasis: 148,
            minWidth: 148,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <TextInput
            ref={hourRef}
            onFocus={() => {
              setFocused('hour');
              reveal(hourRef.current);
            }}
            placeholder="HH"
            selectionColor={colors.primary}
            accessibilityLabel={`${label}, hour, 1 to 12`}
            keyboardType="number-pad"
            maxLength={2}
            value={hour}
            onChangeText={(h) => update(h, minute, period)}
            onBlur={() => {
              setFocused(null);
              reveal(null);
              if (!valid) {
                const [h, m] = value.split(':');
                update(String(+h % 12 || 12), m, +h >= 12 ? 'PM' : 'AM');
              }
            }}
            selectTextOnFocus
            style={[
              input,
              {
                borderColor:
                  focused === 'hour' ? colors.primary : colors.border,
              },
            ]}
          />
          <Text
            style={[
              c.title,
              { textAlignVertical: 'center', alignSelf: 'center' },
            ]}
          >
            :
          </Text>
          <TextInput
            ref={minuteRef}
            onFocus={() => {
              setFocused('minute');
              reveal(minuteRef.current);
            }}
            placeholder="MM"
            selectionColor={colors.primary}
            accessibilityLabel={`${label}, minutes, 0 to 59`}
            keyboardType="number-pad"
            maxLength={2}
            value={minute}
            onChangeText={(m) => update(hour, m, period)}
            onBlur={() => {
              setFocused(null);
              reveal(null);
              if (!valid) {
                const [h, m] = value.split(':');
                update(String(+h % 12 || 12), m, +h >= 12 ? 'PM' : 'AM');
              }
            }}
            selectTextOnFocus
            style={[
              input,
              {
                borderColor:
                  focused === 'minute' ? colors.primary : colors.border,
              },
            ]}
          />
        </View>
        <View
          style={{ flexGrow: 1, flexBasis: 112, flexDirection: 'row', gap: 8 }}
        >
          {(['AM', 'PM'] as const).map((p) => (
            <TouchTarget
              key={p}
              accessibilityRole="radio"
              accessibilityLabel={`${label}, ${p}`}
              accessibilityState={{
                checked: period === p,
                selected: period === p,
              }}
              onPress={() => update(hour, minute, p)}
              style={{
                flex: 1,
                minHeight: controlHeight,
                minWidth: 48,
                paddingHorizontal: 10,
                paddingVertical: 12,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                backgroundColor: period === p ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: period === p ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.semibold,
                  fontSize: 18,
                  lineHeight: 24,
                  color: period === p ? colors.surface : colors.ink,
                }}
              >
                {p}
              </Text>
            </TouchTarget>
          ))}
        </View>
      </View>
      {!valid && (
        <Text
          accessibilityLiveRegion="polite"
          style={[c.text, { color: colors.error }]}
        >
          Use an hour from 1–12 and minutes from 00–59.
        </Text>
      )}
    </View>
  );
}
