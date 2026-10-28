import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Button } from '../../components/ui/Button';
import { careStyles as c } from '../../components/app/CareUI';
export function CalendarField({ label, value, onChange, mode }: { label: string; value: string; onChange: (value: string) => void; mode: 'date' | 'time' }) {
  const [open, setOpen] = useState(false);
  const date = mode === 'date' ? new Date(`${value || '2000-01-01'}T12:00:00`) : new Date(`2000-01-01T${value || '08:00'}:00`);
  const select = (selected: Date) => { const pad = (n: number) => String(n).padStart(2, '0'); onChange(mode === 'date' ? `${selected.getFullYear()}-${pad(selected.getMonth()+1)}-${pad(selected.getDate())}` : `${pad(selected.getHours())}:${pad(selected.getMinutes())}`); };
  const show = () => { if (Platform.OS === 'android') DateTimePickerAndroid.open({ value: date, mode, is24Hour: true, onValueChange: (_event, selected) => select(selected) }); else setOpen(!open); };
  return <View style={{ gap: 7 }}><Text style={c.text}>{label}</Text><Button variant="secondary" title={value || 'Choose date'} onPress={show} />{open && <><DateTimePicker value={date} mode={mode} display="spinner" onValueChange={(_event, selected) => select(selected)} /><Button title="Done" variant="secondary" onPress={() => setOpen(false)} /></>}</View>;
}
