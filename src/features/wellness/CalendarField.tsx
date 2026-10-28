import { Field } from './TrackingUI';
import { TimeField } from './TimeField';
export function CalendarField({ label, value, onChange, mode }: { label: string; value: string; onChange: (value: string) => void; mode: 'date' | 'time' }) {
  return mode === 'time' ? <TimeField label={label} value={value} onChange={onChange} /> : <Field label={`${label} (YYYY-MM-DD)`} value={value} onChange={onChange} />;
}
