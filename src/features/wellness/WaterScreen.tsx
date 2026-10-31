import { useTranslation } from "../../localization/LanguageProvider";
import { APP_TIMEZONE, formatClock, formatDateTime, formatTime } from '../../lib/time';
import { LogChoice, TrackingIntro } from './TrackingVisuals';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { AppScreen } from '../../components/app/AppScreen';
import { CareDisclosure, useCareStyles } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { addDays, awakeMinutes, waterDay, waterSchedule, waterWindow, type WaterPlan } from './domain';
import { useWellness } from './WellnessContext';
import { requestReminderPermission } from './notifications';
import { TrackingFeedback, useTrackingFeedback } from './TrackingFeedback';
import { useTrackingClock } from './useTrackingClock';
import { WaterSummary, WaterHistory } from './WaterSummary';
import { CalendarField } from './CalendarField';
import { Check, confirmDelete, Field, Group, TrackingStatus, useTrackingStyles } from './TrackingUI';
export function WaterScreen() {
  const { t: tr } = useTranslation();
  const c = useCareStyles();
  const s = useTrackingStyles();

  const { data, loading, busy, save, notice, scheduledThrough } = useWellness(), plan = data.waterPlan;
  const [editing, setEditing] = useState(false), [wake, setWake] = useState(plan?.wakeTime ?? '07:00'), [sleep, setSleep] = useState(plan?.sleepTime ?? '23:00'), [target, setTarget] = useState(plan ? String(plan.targetMl) : ''), [serving, setServing] = useState(String(plan?.servingMl ?? 250)), [reminders, setReminders] = useState(plan?.remindersEnabled ?? false), [custom, setCustom] = useState('250');
  const { feedback, setFeedback } = useTrackingFeedback();
  const now = useTrackingClock();
  const [savingPlan, setSavingPlan] = useState(false);
  const planLock = useRef(false);

  function editPlan() { if(plan) {setWake(plan.wakeTime);setSleep(plan.sleepTime);setTarget(String(plan.targetMl));setServing(String(plan.servingMl));setReminders(plan.remindersEnabled);}setEditing(true); }
  const pending = useRef<{ key: string; id: string; loggedAt: string } | null>(null);
  const day = plan ? waterDay(plan, now) : null, tasks = plan && day ? waterSchedule(plan, day, data.waterLogs, data.waterTasks, now) : [];
  const todayLogs = data.waterLogs.filter(l => l.day === day), total = todayLogs.reduce((sum,l) => sum+l.amountMl,0);
  const paused = Boolean(plan?.pausedUntil && Date.parse(plan.pausedUntil) > now.getTime());
  async function savePlan() {
    if (planLock.current || busy) return;
    setFeedback(null);
    if (!/^\d+$/.test(target) || Number(target)<100 || Number(target)>6000 || !/^\d+$/.test(serving) || Number(serving)<50 || Number(serving)>1000 || awakeMinutes({ wakeTime: wake, sleepTime: sleep }) < 120 || awakeMinutes({ wakeTime: wake, sleepTime: sleep }) > 1320) { setFeedback('Choose a target from 100–6000 ml, a serving from 50–1000 ml and waking hours between 2 and 22 hours.'); return; }
    planLock.current = true; setSavingPlan(true);
    try {
      let enabled = reminders;
      if (enabled && !await requestReminderPermission(false)) { enabled = false; setReminders(false); }
      if (await save('water/plan', { wakeTime: wake, sleepTime: sleep, targetMl: Number(target), servingMl: Number(serving), timezone: APP_TIMEZONE, remindersEnabled: enabled, pausedUntil: plan?.pausedUntil ?? null })) {
        setEditing(false);
        setFeedback(reminders && !enabled ? 'Plan saved. Device notifications are off; you can enable them in notification settings.' : 'Water plan saved.', reminders && !enabled ? 'info' : 'success');
      }
    } finally { planLock.current = false; setSavingPlan(false); }
  }
  async function updatePlan(update: Partial<WaterPlan>) { if (!plan) return; const { version: _, ...body } = plan; await save('water/plan', { ...body, ...update }); }
  async function log(amount: number, taskId: string | null = null) {
    setFeedback(null);
    if (pending.current && data.waterLogs.some(log => log.id === pending.current?.id)) pending.current = null;
    if (!Number.isInteger(amount) || amount<1 || amount>3000) { setFeedback('Enter between 1 and 3000 ml per log.'); return; }
    const key = `${amount}:${taskId}`;
    if (pending.current && pending.current.key !== key) { setFeedback('Retry the previous water log first, or reload tracking to check whether it was saved.'); return; }
    pending.current ??= { key, id: randomUUID(), loggedAt: new Date().toISOString() };
    if (await save(`water/logs/${pending.current.id}`, { amountMl: amount, taskId, loggedAt: pending.current.loggedAt })) { pending.current = null; setFeedback(`${amount} ml logged.`, 'success'); }
  }
  return <AppScreen back title={tr("Water")}><TrackingIntro name="water" title={tr("Water log")} description={tr("Record a drink, check your target and manage your reminder times.")} /><TrackingStatus />
    <TrackingFeedback value={feedback} />
    {(!plan || editing) && !loading && <Group title={tr(plan ? 'Your water plan' : 'Make your water plan')}>
      <CalendarField label={tr("I wake up at")} mode="time" value={wake} onChange={setWake} /><CalendarField label={tr("I go to sleep at")} mode="time" value={sleep} onChange={setSleep} />
      <Field label={tr("Daily target (ml)")} value={target} onChange={setTarget} numeric /><Text style={c.text}>{tr("Choose your own target. Follow your clinician’s advice if you have a fluid restriction.")}</Text><View style={s.inline}>{[150,250,500].map(amount => <LogChoice key={amount} label={tr(`${amount} ml`)} icon={amount === 500 ? 'bottle' : 'glass'} selected={serving === String(amount)} disabled={busy} onPress={() => setServing(String(amount))} />)}</View><Field label={tr("Preferred serving (ml)")} value={serving} onChange={setServing} numeric />
      <Text style={c.text}>{tr("We spread up to 16 tasks across your waking hours. Each day’s tasks add up to your target. All times use IST (Indian Standard Time).")}</Text><Check checked={reminders} onChange={() => setReminders(!reminders)} label={tr("Remind me every day")} disabled={busy} /><Button title={tr("Save water plan")} onPress={() => void savePlan()} loading={busy || savingPlan} />{plan && <Button title={tr("Cancel editing")} variant="secondary" onPress={() => setEditing(false)} />}
    </Group>}
    {plan && !editing && <>
      <WaterSummary total={total} target={plan.targetMl} done={tasks.filter((task) => task.status === 'done').length} tasks={tasks.length} />
      <Text style={[c.text, { marginTop: 12 }]}>{tr("Waking hours: ")}{formatClock(plan.wakeTime)} {tr(" to ")}{formatClock(plan.sleepTime)}. {tr(paused ? 'Reminders paused for this waking day.' : plan.remindersEnabled ? 'Daily reminders on.' : 'Reminders off; you can keep logging.')}</Text>
      <Group title={tr("Log a drink")}><Button title={tr(`Log ${plan.servingMl} ml water`)} disabled={busy} onPress={() => void log(plan.servingMl)} /><CareDisclosure title={tr("Other amounts")}><View style={s.inline}>{[150,500].filter(amount => amount !== plan.servingMl).map(amount => <LogChoice key={amount} label={tr(`${amount} ml`)} icon={amount >= 500 ? 'bottle' : 'glass'} disabled={busy} onPress={() => void log(amount)} />)}</View><Field label={tr("Amount (ml)")} value={custom} onChange={setCustom} numeric /><Button title={tr("Log this amount")} variant="secondary" onPress={() => void log(Number(custom))} disabled={busy} /></CareDisclosure></Group>
      <Group title={tr("Your drinking tasks")}><Text style={c.text}>{tr("Quick logs count toward the earliest unfinished tasks. Skipping a task leaves your target unchanged.")}</Text><CareDisclosure title={tr(`View all ${tasks.length} drinking tasks`)}>{tasks.map(task => <CareDisclosure key={task.id} title={tr(formatTime(task.snoozedUntil ?? task.at)+' · '+task.amountMl+' ml · '+({ done: 'Logged', skipped: 'Skipped', missed: 'Earlier', pending: 'Upcoming' }[task.status]))}><Text style={c.text}>{tr(task.status === 'done' ? 'Logged' : task.status === 'missed' ? 'Earlier today · still available to log' : task.status === 'skipped' ? 'Skipped' : task.snoozedUntil ? 'Snoozed' : 'Upcoming')}</Text>{task.status !== 'done' && <>
        <Button title={tr(`Log ${task.remainingMl} ml for this task`)} onPress={() => void log(task.remainingMl, task.id)} disabled={busy} variant="secondary" />
        {task.status !== 'skipped' && <Button title={tr("Snooze 15 minutes")} variant="secondary" disabled={busy || now.getTime()+900000 < waterWindow(plan,day!).start.getTime() || now.getTime()+900000 >= waterWindow(plan,day!).end.getTime()} onPress={() => void save(`water/tasks/${encodeURIComponent(task.id)}`, { day, status: 'pending', snoozedUntil: new Date(Date.now()+900000).toISOString() })} />}
        <Button title={tr(task.status === 'skipped' ? 'Restore task' : 'Skip task')} variant="secondary" disabled={busy} onPress={() => void save(`water/tasks/${encodeURIComponent(task.id)}`, { day, status: task.status === 'skipped' ? 'pending' : 'skipped', snoozedUntil: null })} />
      </>}</CareDisclosure>)}</CareDisclosure></Group>
      <Group title={tr("Reminder controls")}><Text style={c.text}>{tr("Water reminders use a short droplet sound in the installed app. Silent mode, Do Not Disturb and your notification settings control whether it plays.")}</Text><Button title={tr(paused ? 'Resume reminders' : 'Pause until bedtime')} variant="secondary" disabled={busy || !plan.remindersEnabled} onPress={() => void updatePlan({ pausedUntil: paused ? null : waterWindow(plan, day!).end.toISOString() })} /><Button title={tr("Edit target, hours & reminders")} variant="secondary" onPress={editPlan} />{notice && <Text style={c.text}>{tr(notice)}</Text>}{plan.remindersEnabled && scheduledThrough && <Text style={c.text}>{tr("Water reminders scheduled through ")}{formatDateTime(scheduledThrough)}{tr(". Open Arogio regularly to extend this schedule. Delivery follows your device’s notification and battery settings.")}</Text>}</Group>
      <View style={c.section}><CareDisclosure title={tr("Today’s logs")}>{todayLogs.length ? todayLogs.map(l => <View key={l.id} style={s.row}><Text style={c.text}>{formatTime(l.loggedAt)} · {l.amountMl} {tr(" ml")}</Text><Button title={tr("Undo this log")} variant="secondary" disabled={busy} onPress={() => void save(`water/logs/${l.id}`, undefined, 'DELETE')} /></View>) : <Text style={c.text}>{tr("Your first drink will appear here.")}</Text>}</CareDisclosure>
      <CareDisclosure title={tr("Last 7 waking days")}><WaterHistory logs={data.waterLogs} day={day!} />{Array.from({length:7},(_,i) => addDays(day!, -i)).map(d => { const daily = data.waterLogs.filter(l=>l.day===d); return <Text key={d} style={c.text}>{d} - {daily.reduce((sum,l)=>sum+l.amountMl,0)} {tr(" ml")}{tr(daily[0] ? ` / ${daily[0].targetMl} ml target` : ' - No logs')}</Text>; })}</CareDisclosure></View>
      <Group title={tr("Your data")}><Text style={c.text}>{tr("Water logs are saved to your account. Deleting water tracking removes the plan, logs and water reminders.")}</Text><Button title={tr("Delete water tracking data")} variant="danger" disabled={busy} onPress={() => confirmDelete('Delete water tracking?', 'This permanently removes your water plan and all water logs.', () => { pending.current=null; void save('water/data',undefined,'DELETE'); }, tr)} /></Group>
    </>}
  </AppScreen>;
}

