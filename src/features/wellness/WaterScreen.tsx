import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { AppScreen } from '../../components/app/AppScreen';
import { CareDisclosure, careStyles as c } from '../../components/app/CareUI';
import { Button } from '../../components/ui/Button';
import { addDays, awakeMinutes, waterDay, waterSchedule, waterWindow, type WaterPlan } from './domain';
import { useWellness } from './WellnessContext';
import { requestReminderPermission } from './notifications';
import { CalendarField } from './CalendarField';
import { Check, confirmDelete, deviceTimezone, displayTime, Field, Group, TrackingStatus, trackingStyles as s } from './TrackingUI';
export function WaterScreen() {
  const { data, loading, busy, save, notice, scheduledThrough } = useWellness(), plan = data.waterPlan;
  const [editing, setEditing] = useState(false), [wake, setWake] = useState(plan?.wakeTime ?? '07:00'), [sleep, setSleep] = useState(plan?.sleepTime ?? '23:00'), [target, setTarget] = useState(plan ? String(plan.targetMl) : ''), [serving, setServing] = useState(String(plan?.servingMl ?? 250)), [reminders, setReminders] = useState(plan?.remindersEnabled ?? false), [custom, setCustom] = useState('250'), [feedback, setFeedback] = useState<string | null>(null);
  const [now, setNow] = useState(()=>new Date()); useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  function editPlan() { if(plan) {setWake(plan.wakeTime);setSleep(plan.sleepTime);setTarget(String(plan.targetMl));setServing(String(plan.servingMl));setReminders(plan.remindersEnabled);}setEditing(true); }
  const pending = useRef<{ key: string; id: string; loggedAt: string } | null>(null);
  const day = plan ? waterDay(plan) : null, tasks = plan && day ? waterSchedule(plan, day, data.waterLogs, data.waterTasks) : [];
  const todayLogs = data.waterLogs.filter(l => l.day === day), total = todayLogs.reduce((sum,l) => sum+l.amountMl,0);
  const paused = Boolean(plan?.pausedUntil && Date.parse(plan.pausedUntil) > now.getTime());
  async function savePlan() {
    setFeedback(null);
    if (!/^\d+$/.test(target) || Number(target)<100 || Number(target)>6000 || !/^\d+$/.test(serving) || Number(serving)<50 || Number(serving)>1000 || awakeMinutes({ wakeTime: wake, sleepTime: sleep }) < 120 || awakeMinutes({ wakeTime: wake, sleepTime: sleep }) > 1320) { setFeedback('Choose a target from 100–6000 ml, a serving from 50–1000 ml and waking hours between 2 and 22 hours.'); return; }
    let enabled = reminders;
    if (enabled && !await requestReminderPermission()) { enabled = false; setReminders(false); setFeedback('The plan can be saved, but notifications are off. Enable device notifications to receive reminders.'); }
    if (await save('water/plan', { wakeTime: wake, sleepTime: sleep, targetMl: Number(target), servingMl: Number(serving), timezone: deviceTimezone(), remindersEnabled: enabled, pausedUntil: plan?.pausedUntil ?? null })) setEditing(false);
  }
  async function updatePlan(update: Partial<WaterPlan>) { if (!plan) return; const { version: _, ...body } = plan; await save('water/plan', { ...body, ...update }); }
  async function log(amount: number, taskId: string | null = null) {
    if (pending.current && data.waterLogs.some(log => log.id === pending.current?.id)) pending.current = null;
    if (!Number.isInteger(amount) || amount<1 || amount>3000) { setFeedback('Enter between 1 and 3000 ml per log.'); return; }
    const key = `${amount}:${taskId}`;
    if (pending.current && pending.current.key !== key) { setFeedback('Retry the previous water log first, or reload tracking to check whether it was saved.'); return; }
    pending.current ??= { key, id: randomUUID(), loggedAt: new Date().toISOString() };
    if (await save(`water/logs/${pending.current.id}`, { amountMl: amount, taskId, loggedAt: pending.current.loggedAt })) { pending.current = null; setFeedback(`${amount} ml logged.`); }
  }
  return <AppScreen back title="Water"><Text style={c.heading}>A little, throughout the day.</Text><Text style={c.text}>A drinking plan that fits your waking hours.</Text><TrackingStatus />
    {feedback && <Text accessibilityLiveRegion="polite" style={[c.text,{ marginTop: 14 }]}>{feedback}</Text>}
    {(!plan || editing) && !loading && <Group title={plan ? 'Your water plan' : 'Make your water plan'}>
      <CalendarField label="I wake up at" mode="time" value={wake} onChange={setWake} /><CalendarField label="I go to sleep at" mode="time" value={sleep} onChange={setSleep} />
      <Field label="Daily target (ml)" value={target} onChange={setTarget} numeric /><Text style={c.text}>Choose your own target. Follow your clinician’s advice if you have a fluid restriction.</Text><Field label="Preferred serving (ml)" value={serving} onChange={setServing} numeric />
      <Text style={c.text}>We spread up to 16 tasks across your waking hours. Each day’s tasks add up to your target. Timezone: {deviceTimezone()}.</Text><Check checked={reminders} onChange={() => setReminders(!reminders)} label="Remind me every day" disabled={busy} /><Button title="Save water plan" onPress={() => void savePlan()} loading={busy} />{plan && <Button title="Cancel editing" variant="secondary" onPress={() => setEditing(false)} />}
    </Group>}
    {plan && !editing && <>
      <View style={s.panel}><Text style={c.title}>{total >= plan.targetMl ? 'Your target is complete.' : `${total} of ${plan.targetMl} ml logged`}</Text><Text style={c.text}>Waking day: {day} · {plan.wakeTime}–{plan.sleepTime} · {plan.timezone}</Text><Text style={c.text}>{paused ? 'Reminders are paused for this waking day.' : plan.remindersEnabled ? 'Daily reminders are on.' : 'Device reminders are off. Your plan is still available.'}</Text></View>
      {plan.timezone !== deviceTimezone() && <Text style={s.error}>Your device timezone has changed. Edit and save your plan to use {deviceTimezone()}.</Text>}
      <Group title="Log a drink"><Button title={`Log ${plan.servingMl} ml`} onPress={() => void log(plan.servingMl)} disabled={busy} /><Field label="Another amount (ml)" value={custom} onChange={setCustom} numeric /><Button title="Log entered amount" variant="secondary" onPress={() => void log(Number(custom))} disabled={busy} /></Group>
      <Group title="Your drinking tasks"><Text style={c.text}>Quick logs count toward the earliest unfinished tasks. Skipping a task leaves your target unchanged.</Text>{tasks.map(task => <CareDisclosure key={task.id} title={displayTime(task.snoozedUntil ?? task.at, plan.timezone)+' · '+task.amountMl+' ml · '+task.status}><Text style={c.text}>{task.status === 'done' ? 'Logged' : task.status === 'missed' ? 'Earlier today · still available to log' : task.status === 'skipped' ? 'Skipped' : task.snoozedUntil ? 'Snoozed' : 'Upcoming'}</Text>{task.status !== 'done' && <>
        <Button title={`Log ${task.remainingMl} ml for this task`} onPress={() => void log(task.remainingMl, task.id)} disabled={busy} variant="secondary" />
        {task.status !== 'skipped' && <Button title="Snooze 15 minutes" variant="secondary" disabled={busy || now.getTime()+900000 < waterWindow(plan,day!).start.getTime() || now.getTime()+900000 >= waterWindow(plan,day!).end.getTime()} onPress={() => void save(`water/tasks/${encodeURIComponent(task.id)}`, { day, status: 'pending', snoozedUntil: new Date(Date.now()+900000).toISOString() })} />}
        <Button title={task.status === 'skipped' ? 'Restore task' : 'Skip task'} variant="secondary" disabled={busy} onPress={() => void save(`water/tasks/${encodeURIComponent(task.id)}`, { day, status: task.status === 'skipped' ? 'pending' : 'skipped', snoozedUntil: null })} />
      </>}</CareDisclosure>)}</Group>
      <Group title="Reminder controls"><Button title={paused ? 'Resume reminders' : 'Pause until bedtime'} variant="secondary" disabled={busy || !plan.remindersEnabled} onPress={() => void updatePlan({ pausedUntil: paused ? null : waterWindow(plan, day!).end.toISOString() })} /><Button title="Edit target, hours & reminders" variant="secondary" onPress={editPlan} />{notice && <Text style={c.text}>{notice}</Text>}{plan.remindersEnabled && scheduledThrough && <Text style={c.text}>Water reminders scheduled through {new Date(scheduledThrough).toLocaleString()}. Open Arogio regularly to extend this schedule. Delivery follows your device’s notification and battery settings.</Text>}</Group>
      <View style={c.section}><CareDisclosure title="Today’s logs">{todayLogs.length ? todayLogs.map(l => <View key={l.id} style={s.row}><Text style={c.text}>{displayTime(l.loggedAt,plan.timezone)} · {l.amountMl} ml</Text><Button title="Undo this log" variant="secondary" disabled={busy} onPress={() => void save(`water/logs/${l.id}`, undefined, 'DELETE')} /></View>) : <Text style={c.text}>Your first drink will appear here.</Text>}</CareDisclosure>
      <CareDisclosure title="Last 7 waking days">{Array.from({length:7},(_,i) => addDays(day!, -i)).map(d => { const daily = data.waterLogs.filter(l=>l.day===d); return <Text key={d} style={c.text}>{d} · {daily.reduce((sum,l)=>sum+l.amountMl,0)} ml{daily[0] ? ` / ${daily[0].targetMl} ml target` : ' · No logs'}</Text>; })}</CareDisclosure></View>
      <Group title="Your data"><Text style={c.text}>Water logs are saved to your account. Deleting water tracking removes the plan, logs and water reminders.</Text><Button title="Delete water tracking data" variant="secondary" disabled={busy} onPress={() => confirmDelete('Delete water tracking?', 'This permanently removes your water plan and all water logs.', () => { pending.current=null; void save('water/data',undefined,'DELETE'); })} /></Group>
    </>}
  </AppScreen>;
}

