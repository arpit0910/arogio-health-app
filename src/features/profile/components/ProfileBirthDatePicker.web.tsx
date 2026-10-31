import { useTranslation } from "../../../localization/LanguageProvider";
import { usePalette, useAppearance } from '../../../theme/AppearanceProvider';
import { useState } from 'react';
import type { BirthDatePickerProps } from '../birthDate';
import { birthDateValue, validBirthDate } from '../model';

import { ProfileDialog } from './ProfilePrimitives';

export function ProfileBirthDatePicker({ value, onSelect, onClose }: BirthDatePickerProps) {
  const { t: tr } = useTranslation();
  const colors = usePalette();
  const { scheme } = useAppearance();

  const [date, setDate] = useState(value);
  const [error, setError] = useState<string | null>(null);
  return <ProfileDialog title={tr("Date of birth")} subtitle={tr("Choose your date of birth.")} value={date} onChange={setDate} onClose={onClose} error={error} onSave={() => {
    if (!validBirthDate(date)) { setError('Choose a valid date of birth that is not in the future.'); return; }
    onSelect(date);
  }}>
    <input aria-label="Date of birth" type="date" min="1900-01-01" max={birthDateValue(new Date())} value={date}
      onChange={event => { setDate(event.target.value); setError(null); }}
      style={{ boxSizing: 'border-box', width: '100%', minHeight: 48, padding: 12, borderRadius: 12, border: `1px solid ${colors.border}`, color: colors.ink, backgroundColor: colors.background, font: 'inherit', colorScheme: scheme, accentColor: colors.primary }} />
  </ProfileDialog>;
}
