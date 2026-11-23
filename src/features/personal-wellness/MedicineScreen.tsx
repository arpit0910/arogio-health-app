import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '../../components/app/AppScreen';
import { DAction, DCard, DHeading, DText } from '../../components/app/DesignUI';
import { MedicineSchedule } from './MedicineSchedule';
import { useWellness } from './WellnessContext';
import { localDay } from './domain';
export function MedicineScreen() {
 const router = useRouter(), w = useWellness(), today = localDay();
 return <AppScreen back title="Manage medicines"><View style={{ gap: 16 }}>
  <DAction filled label="Add medicine" disabled={w.busy || (w.data.medicines?.length ?? 0) >= 30} onPress={() => router.push('/medicine-reminder')} />
  <MedicineSchedule limit={12} showManage={false} />
  {(w.data.medicines ?? []).map(m => <DCard key={m.id}>
   <DHeading title={[m.name, m.strength ? `${m.strength}${m.unit ?? ''}` : ''].filter(Boolean).join(' ')} />
   <DText>{`${m.recurrence ?? 'daily'} ? ${m.enabled ? 'Reminders on' : 'Reminders off'}`}</DText>
   {!!m.startDate && <DText>{`${m.startDate} ? ${m.endDate ?? 'ongoing'}`}</DText>}
   {m.stock != null && <DText color={m.stock <= (m.lowStockThreshold ?? 4) ? '#BD3038' : undefined}>{`Stock: ${m.stock}${m.stock <= (m.lowStockThreshold ?? 4) ? ' ? Low stock ? arrange a refill' : ''}`}</DText>}
   <DAction label="Edit medicine" disabled={w.busy} onPress={() => router.push({ pathname: '/medicine-reminder', params: { id: m.id } })} />
   {m.recurrence === 'sos' && m.doses.map(d => {
    const taken = w.data.medicineDoses?.some(r => r.medicineId === m.id && r.time === d.time && r.day === today && r.status === 'taken');
    return <DAction key={d.time} label={`${taken ? 'Undo log' : 'Log as-needed dose'}: ${d.amount} (${d.time} slot)`} disabled={w.busy || !!m.endDate && today > m.endDate || !!m.startDate && today < m.startDate} onPress={() => void w.save(`medicines/${m.id}/doses/${today}/${d.time}`, { status: taken ? 'pending' : 'taken' })} />;
   })}
  </DCard>)}
  <DText>As-needed slots record prescribed doses. Follow your prescription. Device reminders are scheduled ahead; reopen Arogio regularly.</DText>
  {!!w.error && <DText color="#BD3038">{w.error}</DText>}
 </View></AppScreen>;
}
