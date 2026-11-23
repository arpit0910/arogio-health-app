import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { useTranslation } from "../../localization/LanguageProvider";
import { useRef, useState, type PropsWithChildren } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAuth } from '../authentication/context/AuthContext';
import { usePhoneSteps } from '../activity/PhoneStepsProvider';
import { CareBrand, useCareStyles } from '../../components/app/CareUI';
import { PageIntro } from '../../components/app/PageIntro';
import { AppIcon } from '../../components/app/AppIcon';
import { Button } from '../../components/ui/Button';
import { usePalette } from '../../theme/AppearanceProvider';
const key = (id: string) => `arogio.access.v3.${id}`;
export function AppAccessGate({ children }: PropsWithChildren) { return children; }
export function AppAccessScreen(){
  const router = useRouter();return <AccessSetup onComplete={()=>router.canGoBack()?router.back():router.replace('/home')}/>;}
function AccessSetup({onComplete}:{onComplete:()=>void}){
  const { t: tr } = useTranslation();
 const {user,updateProfile}=useAuth(),phone=usePhoneSteps(),c=useCareStyles(),colors=usePalette();
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[applied,setApplied]=useState(false),lock=useRef(false);
 async function finish(){if(Platform.OS==='web'){onComplete();return;}if(user){try{await SecureStore.setItemAsync(key(user.id),'done');}catch{setStatus('Your choices are applied, but setup could not be saved. Try Continue again.');return;}}onComplete();}
 async function allow(){
  if(lock.current||!phone.ready)return;lock.current=true;setBusy(true);const messages:string[]=[];
  try{
   setStatus('Setting up phone activity...');if(!phone.enabled)await phone.toggle();
   setStatus('Finding your city...');
   try{if(Platform.OS!=='web'){const permission=await Location.requestForegroundPermissionsAsync();if(permission.granted){const position=await Promise.race([Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('timeout')),12000))]);const [address]=await Location.reverseGeocodeAsync(position.coords);const city=address?.city||address?.subregion;if(city)await updateProfile({location:city});}else messages.push('City can be entered in your profile.');}}catch{messages.push('City lookup was unavailable; you can enter it in Profile.');}
   setApplied(true);setStatus(messages.length?messages.join(' ')+' Your records are still available.':'Your access choices are applied.');
  }catch{setApplied(true);setStatus('Some access was unavailable. You can still track in Arogio and manage access in Settings.');}
  finally{lock.current=false;setBusy(false);}
 }
 return <SafeAreaView style={{flex:1,backgroundColor:colors.background}}><ScrollView contentContainerStyle={{padding:24,maxWidth:440,width:'100%',alignSelf:'center',gap:24}}><CareBrand/><PageIntro title="Phone permissions" description="Enable phone activity and find your city. Both are optional; your journal works without them." icon="shield" />
 {([['trend','Motion & activity','Count steps on supported phones. Background counting depends on device support and battery settings.'],['location','Location','Find your city for your profile and local weather. Only your city is saved.']] as const).map(([icon,title,description])=><View key={title} style={{flexDirection:'row',gap:14}}><AppIcon name={icon}/><View style={{flex:1,gap:6}}><Text style={c.title}>{tr(title)}</Text><Text style={c.text}>{tr(description)}</Text></View></View>)}
 {!!status&&<Text accessibilityLiveRegion="polite" style={c.text}>{status}</Text>}
 {applied?<Button title={tr("Continue to Arogio")} onPress={()=>void finish()}/>:<><Button title={tr("Set up phone access")} loading={busy} disabled={!phone.ready} onPress={()=>void allow()}/><Button title={tr("Continue without optional access")} variant="secondary" disabled={busy} onPress={()=>void finish()}/></>}
 <Text style={[c.text,{fontSize:12}]}>{tr("You can change access later in Settings. Arogio does not measure sleep, heart rate or calories with phone motion alone.")}</Text></ScrollView></SafeAreaView>;
}
