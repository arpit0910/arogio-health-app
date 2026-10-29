import { Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { AppIcon } from '../../components/app/AppIcon';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useCareStyles } from '../../components/app/CareUI';
import { useAppearance } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { useWellness } from '../wellness/WellnessContext';
import { useHealthSync } from '../health-sync/HealthSyncProvider';
import { usePhoneSteps } from './PhoneStepsProvider';
import { activityReading, emptyActivity } from './model';
import { addDays, localDay } from '../wellness/domain';
import { useTrackingClock } from '../wellness/useTrackingClock';
import { formatHealthValue } from '../health-sync/model';
export function TodayActivity(){
 const c=useCareStyles(),{colors,scheme}=useAppearance(),{fontScale,width}=useWindowDimensions();
 const {data,loading,error}=useWellness(),health=useHealthSync(),phone=usePhoneSteps();
 const tracking=data.activityTracking??emptyActivity(),day=localDay(useTrackingClock()),mode=health.connected?'connected':'manual';
 const open=()=>router.push({pathname:'/activity',params:{source:mode}});
 const rows=[{key:'Steps',title:'Steps',icon:'trend',color:'#69E4B7'},{key:'ExerciseSession',title:'Movement',icon:'clock',color:'#A6D3C2'},{key:'SleepSession',title:'Sleep',icon:'moon',color:'#B7A6FB'}] as const;
 return <View style={{marginTop:24}}><TouchTarget accessibilityRole="button" accessibilityLabel="View all activity" onPress={open} style={{flexDirection:'row',alignItems:'center',gap:8,paddingBottom:12}}><Text accessibilityRole="header" style={[c.title,{flex:1}]}>Today’s activity</Text><Text style={[c.text,{color:colors.primary,fontSize:13}]}>View all</Text><AppIcon name="right" size={17}/></TouchTarget>
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{rows.map(row=>{
 const reading=activityReading(row.key,day,mode,tracking,health.snapshot,phone),unavailable=mode==='manual'&&!(row.key==='Steps'&&phone.enabled)&&(loading||!!error);
 const goal=tracking.goals[row.key],value=reading.value,ratio=value!=null&&goal?Math.min(1,value/goal):0;
 const week=Array.from({length:7},(_,i)=>activityReading(row.key,addDays(day,i-6),mode,tracking,health.snapshot,phone).value),max=Math.max(1,...week.map(v=>v??0));
 const color=scheme==='dark'?row.color:row.key==='SleepSession'?'#6752A4':'#176B51';
 return <TouchTarget key={row.key} accessibilityRole="button" accessibilityLabel={`${row.title}: ${unavailable?'unavailable':value==null?'Not recorded':formatHealthValue(row.key,value)}${goal?`. Target ${goal}`:''}. View activity`} onPress={open} style={({pressed})=>({flex:1,flexBasis:fontScale>1.25?'45%':'29%',minWidth:82,padding:12,borderRadius:16,borderWidth:1,borderColor:row.key==='Steps'?colors.border:'transparent',backgroundColor:pressed?colors.subtle:scheme==='dark'?row.key==='SleepSession'?'#17363C':row.key==='Steps'?'#0B4737':'#103E33':colors.surface,overflow:'hidden'})}>
 <View style={{flexDirection:width<360?'column':'row',alignItems:'flex-start',gap:6,minHeight:42,marginBottom:8}}><AppIcon name={row.icon} color={color} size={20}/><Text style={[c.text,{fontSize:11,lineHeight:17,flexShrink:1}]}>{row.title}</Text></View>
 <Text style={{fontFamily:fonts.semibold,fontSize:value==null?14:width<360?18:23,lineHeight:29,minHeight:width<360?52:29,color:colors.ink,fontVariant:['tabular-nums']}}>{unavailable?'--':value==null?mode==='connected'?'Not shared':'Not logged':formatHealthValue(row.key,value)}</Text>
 <Text style={[c.text,{fontSize:12,lineHeight:18,marginTop:3}]}>{goal?`of ${row.key==='SleepSession'?`${goal}h`:`${goal.toLocaleString('en-IN')}${row.key==='ExerciseSession'?' min':''}`}`:row.key==='ExerciseSession'&&value!=null?'minutes':row.key==='Steps'&&value!=null?'steps':' '}</Text>
 {row.key==='Steps'&&goal&&value!=null?<View style={{alignItems:'center',marginTop:10}}><Svg width={48} height={48} viewBox="0 0 48 48" accessible={false}><Circle cx="24" cy="24" r="19" stroke={colors.border} strokeWidth="5" fill="none"/><Circle cx="24" cy="24" r="19" stroke={color} strokeWidth="5" fill="none" strokeDasharray={`${119.38*ratio} 119.38`} strokeLinecap="round" rotation="-90" origin="24,24"/></Svg></View>:row.key==='SleepSession'&&goal&&value!=null?<View style={{height:6,borderRadius:3,backgroundColor:colors.border,marginTop:16}}><View style={{height:6,width:`${ratio*100}%`,borderRadius:3,backgroundColor:color}}/></View>:null}
 <View accessible accessibilityLabel="Last seven days; gaps mean no recorded value" style={{height:26,flexDirection:'row',alignItems:'flex-end',gap:4,marginTop:12}}>{week.map((v,i)=><View key={i} style={{flex:1,height:v==null?3:Math.max(4,v/max*24),borderRadius:3,backgroundColor:v==null?colors.border:color,opacity:v==null?.35:1}}/>)}</View>
 </TouchTarget>;
 })}</View><Text style={[c.text,{fontSize:11,lineHeight:17,marginTop:10}]}>{mode==='connected'?`From ${health.source?.name??'connected app'}${health.busy?' - syncing...':''}`:phone.enabled?'Phone steps update while Arogio is open. Other totals are entered by you.':'Your Arogio journal - enter the totals you want to track.'}</Text></View>;
}
