import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { newReminder, recurrenceLabel, reminderStepError, reminderDateLabel } from '../src/features/personal-wellness/reminderForm.ts';
import { addDays, localDay } from '../src/features/personal-wellness/domain.ts';

type Element = { type: unknown; props: Record<string, any> };
function medicineForm(allowed: boolean, blank = false) {
  const saves: { path: string; body: Record<string, any> }[] = [], feedback: string[] = [];
  const seed = blank ? newReminder('fixture-medicine') : { ...newReminder('fixture-medicine'), name: 'Saved medicine', doses: [{ time: '08:00', amount: '1 tablet' }] };
  let stateCursor = 0, refCursor = 0;
  const states: any[] = [], refs: any[] = [];
  const component = (props: unknown) => props;
  const jsx = (type: unknown, props: unknown) => ({ type, props });
  const router = { canGoBack: () => true, back() {}, replace() {} };
  const dependencies: Record<string, unknown> = {
    react: {
      useEffect() {},
      useState: (initial: any) => { const i = stateCursor++; if (!(i in states)) states[i] = i === 0 ? structuredClone(seed) : typeof initial === 'function' ? initial() : initial; return [states[i], (value: any) => { states[i] = typeof value === 'function' ? value(states[i]) : value; }]; },
      useRef: (value: unknown) => { const i = refCursor++; return refs[i] ??= { current: value }; }, useCallback: (fn: unknown) => fn,
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { View: component, Keyboard: { dismiss() {} }, BackHandler: { addEventListener: () => ({ remove() {} }) }, Alert: { alert: (title: string, message: string) => feedback.push(`${title}. ${message}`) } },
    'expo-router': { useRouter: () => router, useLocalSearchParams: () => ({}), useFocusEffect() {} },
    'expo-crypto': { randomUUID: () => 'fixture-medicine' },
    '../../components/app/AppScreen': { AppScreen: component },
    '../../components/app/AppIcon': { AppIcon: component },
    '../../components/ui/AccessibleText': { AccessibleText: component },
    '../../components/ui/Button': { Button: component },
    '../../components/ui/TouchTarget': { TouchTarget: component },
    '../../components/ui/DocumentPhotoInput': { DocumentPhotoInput: component },
    '../../theme/tokens': { colors: {} },
    '../../localization/LanguageProvider': { useTranslation: () => ({ t: (s: string) => s, locale: 'en-IN' }) },
    '../../shared/date-time': { formatClock: (s: string) => s },
    './domain': { addDays, localDay },
    './reminderForm': { newReminder, recurrenceLabel, reminderStepError, reminderDateLabel },
    './CalendarField': { CalendarField: component },
    './ReminderTimePicker': { ReminderTimePicker: component },
    './ReminderFormUI': { ReminderText: component, ReminderField: component, ReminderChoice: component, ReminderDisclosure: component, r: {} },
    './notifications': { requestReminderPermission: async () => allowed },
    './WellnessContext': { useWellness: () => ({ ready: true, data: { medicines: [] }, busy: false, error: null, save: async (path: string, body: Record<string, any>) => { saves.push({ path, body }); return true; } }) },
  };
  const module = { exports: {} as { MedicineReminderScreen: () => Element } };
  const code = ts.transpileModule(readFileSync(new URL('../src/features/personal-wellness/MedicineReminderScreen.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: (name: string) => { if (!(name in dependencies)) throw new Error(name); return dependencies[name]; } });
  function render() { stateCursor = 0; refCursor = 0; const wrapper = module.exports.MedicineReminderScreen(); return (wrapper.type as () => Element)(); }
  function find(value: any, predicate: (v: Element) => boolean): Element | undefined {
    if (!value) return;
    if (Array.isArray(value)) return value.map(v => find(v, predicate)).find(Boolean);
    if (!value.props) return;
    if (predicate(value)) return value;
    return find(value.props.footer, predicate) || find(value.props.children, predicate);
  }
  function button(title: string) { const result = find(render(), v => v.props.title === title); assert.ok(result, `Missing button: ${title}`); return result; }
  return { saves, feedback, render, find, button, click: (title: string) => button(title).props.onPress(), settle: () => new Promise<void>(resolve => setImmediate(resolve)) };
}
describe('Simple medicine reminder setup', () => {
  it('saves only after the review step and keeps the medicine when notifications are declined', async () => {
    const form = medicineForm(false);
    assert.equal(form.find(form.render(), v => v.props.title === 'Save reminder'), undefined);
    form.click('Continue to times'); assert.equal(form.saves.length, 0);
    form.click('Check my reminder'); assert.equal(form.saves.length, 0);
    form.click('Save reminder'); await form.settle();
    assert.equal(form.saves.length, 1);
    assert.equal(form.saves[0].path, 'medicines/fixture-medicine');
    assert.equal(form.saves[0].body.enabled, false);
    assert.equal(form.saves[0].body.name, 'Saved medicine');
    assert.equal(form.saves[0].body.doses[0].time, '08:00');
    assert.match(form.feedback[0], /Medicine saved.*Notifications are off/);
  });
  it('retains reminder opt-in when existing device permission is granted', async () => {
    const form = medicineForm(true); form.click('Continue to times'); form.click('Check my reminder'); form.click('Save reminder'); await form.settle();
    assert.equal(form.saves[0].body.enabled, true);
  });
  it('requires a name and explicit time and amount, preserving input when going back', () => {
    const form = medicineForm(true, true);
    form.click('Continue to times');
    assert.ok(form.find(form.render(), v => v.props.children === 'Write the medicine name to continue.'));
    form.find(form.render(), v => v.props.label === 'Medicine name')!.props.onChangeText('Label medicine');
    form.click('Continue to times'); form.click('Check my reminder');
    assert.ok(form.find(form.render(), v => v.props.children === 'Choose a time for reminder 1.'));
    form.find(form.render(), v => v.props.label === 'Reminder time')!.props.onChange('09:30');
    form.find(form.render(), v => v.props.label === 'Amount to take')!.props.onChangeText('Amount from label');
    form.click('Back');
    assert.equal(form.find(form.render(), v => v.props.label === 'Medicine name')!.props.value, 'Label medicine');
    form.click('Continue to times');
    assert.equal(form.find(form.render(), v => v.props.label === 'Reminder time')!.props.value, '09:30');
    assert.equal(form.find(form.render(), v => v.props.label === 'Amount to take')!.props.value, 'Amount from label');
    assert.equal(form.saves.length, 0);
  });
});
