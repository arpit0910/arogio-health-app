import { Field } from './TrackingUI';
export function CalendarField({ label, value, onChange, mode }: { label: string; value: string; onChange: (value: string) => void; mode: 'date' | 'time' }) { return <Field label={`${label} (${mode === 'date' ? 'YYYY-MM-DD' : 'HH:mm, 24-hour'})`} value={value} onChange={onChange} />; }
