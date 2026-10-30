import { canEnterApp } from '../profile/setupStatus';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useAuth } from '../auth/context/AuthContext';
import { usePhoneSteps } from '../activity/PhoneStepsProvider';
import { useHealthSync } from '../health-sync/HealthSyncProvider';
import { requestReminderPermission } from '../wellness/notifications';
import { CareBrand, useCareStyles } from '../../components/app/CareUI';
import { AppIcon } from '../../components/app/AppIcon';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { usePalette } from '../../theme/AppearanceProvider';
const key = (id: string) => `arogio.access.v3.${id}`;
export function AppAccessGate({ children }: PropsWithChildren) {
  const { user } = useAuth();
  return <AccessSession key={user && canEnterApp(user)?user.id:'out'} owner={user && canEnterApp(user) ? user.id : null}>{children}</AccessSession>;
}
function AccessSession({ owner, children }: PropsWithChildren<{owner:string|null}>) {
  const [checked,setChecked]=useState(false),[done,setDone]=useState(false);
  const colors=usePalette();
  useEffect(()=>{let alive=true;if(!owner||Platform.OS==='web')return;void SecureStore.getItemAsync(key(owner)).then(value=>{if(alive)setDone(value==='done');}).catch(()=>{}).finally(()=>{if(alive)setChecked(true);});return()=>{alive=false;};},[owner]);
  if(!owner||Platform.OS==='web')return children;
  if(!checked)return <View style={{flex:1,backgroundColor:colors.background,justifyContent:'center'}}><ActivityIndicator color={colors.primary}/></View>;
  if(!done)return <AccessSetup onComplete={()=>setDone(true)}/>;
  return children;
}
export function AppAccessScreen(){return <AccessSetup onComplete={()=>router.canGoBack()?router.back():router.replace('/home')}/>;}
function AccessSetup({onComplete}:{onComplete:()=>void}){
 const {user,updateProfile}=useAuth(),phone=usePhoneSteps(),health=useHealthSync(),c=useCareStyles(),colors=usePalette();
 const [source,setSource]=useState<string|null>(health.source?.id??null),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[applied,setApplied]=useState(false),lock=useRef(false);
 async function finish(){if(Platform.OS==='web'){onComplete();return;}if(user){try{await SecureStore.setItemAsync(key(user.id),'done');}catch{setStatus('Your choices are applied, but setup could not be saved. Try Continue again.');return;}}onComplete();}
 async function allow(){
  if(lock.current||!phone.ready||!health.ready)return;lock.current=true;setBusy(true);const messages:string[]=[];
  try{
   setStatus('Setting up notifications...');const notifications=await requestReminderPermission();if(!notifications)messages.push('Notifications stayed off.');
   setStatus('Setting up phone activity...');if(!phone.enabled)await phone.toggle();
   setStatus('Finding your city...');
   try{if(Platform.OS!=='web'){const permission=await Location.requestForegroundPermissionsAsync();if(permission.granted){const position=await Promise.race([Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('timeout')),12000))]);const [address]=await Location.reverseGeocodeAsync(position.coords);const city=address?.city||address?.subregion;if(city)await updateProfile({location:city});}else messages.push('City can be entered in your profile.');}}catch{messages.push('City lookup was unavailable; you can enter it in Profile.');}
   const selected=health.apps.find(app=>app.id===source);if(!source&&health.connected)await health.disconnect();if(selected){setStatus(`Connecting ${selected.name}...`);const connected=await health.connectSource(selected,['Steps','ExerciseSession','SleepSession','Distance','ActiveCaloriesBurned','Nutrition']);if(!connected)messages.push('The health source was not connected. You can review it in Settings.');}
   setApplied(true);setStatus(messages.length?messages.join(' ')+' Your records are still available.':'Access setup is complete. Activity will update automatically.');
  }catch{setApplied(true);setStatus('Some access was unavailable. You can still track in Arogio and manage access in Settings.');}
  finally{lock.current=false;setBusy(false);}
 }
 return <SafeAreaView style={{flex:1,backgroundColor:colors.background}}><ScrollView contentContainerStyle={{padding:24,maxWidth:440,width:'100%',alignSelf:'center',gap:24}}><CareBrand/><Text style={c.heading}>Set up your everyday care</Text><Text style={c.text}>One setup for the access Arogio uses. Android will ask for each permission separately. Declining optional access never blocks your journal.</Text>
 {([['bell','Notifications','For the water, medicine and cycle reminders you choose.'],['trend','Motion & activity','Count steps on supported phones while Arogio is open.'],['location','Location','Find your city for your profile and local weather. Only your city is saved.']] as const).map(([icon,title,description])=><View key={title} style={{flexDirection:'row',gap:14}}><AppIcon name={icon}/><View style={{flex:1,gap:6}}><Text style={c.title}>{title}</Text><Text style={c.text}>{description}</Text></View></View>)}
 {!applied&&health.availability==='available'&&health.apps.length>0&&<View style={{gap:12}}><Text style={c.title}>Optional health app</Text><Text style={c.text}>Choose a source for steps, exercise, sleep, distance and calories. Health Connect will let you choose which readings to share.</Text><View accessibilityRole="radiogroup">{[{id:'none',name:'Use Arogio on its own'},...health.apps].map(app=><TouchTarget key={app.id} accessibilityRole="radio" accessibilityState={{checked:(source??'none')===app.id,disabled:busy}} disabled={busy} onPress={()=>setSource(app.id==='none'?null:app.id)} style={{paddingVertical:14,flexDirection:'row',gap:12}}><AppIcon name={(source??'none')===app.id?'check':'device'} size={20}/><Text style={[c.text,{flex:1,color:colors.ink}]}>{app.name}</Text></TouchTarget>)}</View></View>}
 {!!status&&<Text accessibilityLiveRegion="polite" style={c.text}>{status}</Text>}
 {applied?<Button title="Continue to Arogio" onPress={()=>void finish()}/>:<><Button title="Set up access" loading={busy} disabled={!phone.ready||!health.ready||health.busy} onPress={()=>void allow()}/><Button title="Continue without optional access" variant="secondary" disabled={busy} onPress={()=>void finish()}/></>}
 <Text style={[c.text,{fontSize:12}]}>You can change access later in Settings. Arogio does not measure sleep, heart rate or calories with phone motion alone.</Text></ScrollView></SafeAreaView>;
}
