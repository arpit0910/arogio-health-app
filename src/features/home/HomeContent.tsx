import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Image, ImageBackground, Text, View } from 'react-native';
import { router } from 'expo-router';
import { z } from 'zod';
import { useAuth } from '../auth/context/AuthContext';
import { apiClient } from '../../services/api/client';
import { env } from '../../config/env';
import { useAppearance } from '../../theme/AppearanceProvider';
import { fonts } from '../../theme/tokens';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { AppIcon } from '../../components/app/AppIcon';
const bannerSchema=z.array(z.object({id:z.string().uuid(),title:z.string(),alt:z.string(),route:z.string().nullable(),updatedAt:z.string()}));
const weatherSchema=z.discriminatedUnion('available',[z.object({available:z.literal(false),city:z.string().nullable(),reason:z.string().optional()}),z.object({available:z.literal(true),city:z.string(),temperature:z.number(),condition:z.string(),observedAt:z.string(),forecast:z.boolean().optional()})]);
export function useHomeContent(){
 const {user}=useAuth(),[banners,setBanners]=useState<z.infer<typeof bannerSchema>>([]),[weather,setWeather]=useState<z.infer<typeof weatherSchema>>({available:false,city:null});
 const alive=useRef(true),revision=useRef(0);
 const city=typeof user?.profileSetup?.location==='string'?user.profileSetup.location:'';
 const refresh=useCallback(async()=>{
   if(!user?.id)return;
   const turn=++revision.current;
   const result=await Promise.allSettled([apiClient.request({path:'/home/banners'}),apiClient.request({path:'/home/weather'})]);
   if(!alive.current||turn!==revision.current)return;
   const banner=result[0],forecast=result[1];
   if(banner.status==='fulfilled'){const parsed=bannerSchema.safeParse(banner.value);if(parsed.success)setBanners(parsed.data);}
   if(forecast.status==='fulfilled'){const parsed=weatherSchema.safeParse(forecast.value);if(parsed.success)setWeather(parsed.data);}
   else setWeather({available:false,city:city||null});
 },[user?.id,city]);
 useEffect(()=>{alive.current=true;revision.current+=1;const initial=setTimeout(()=>{setWeather({available:false,city:city||null});void refresh();},0);const timer=setInterval(()=>{if(AppState.currentState==='active')void refresh();},5*60000);const app=AppState.addEventListener('change',state=>{if(state==='active')void refresh();});return()=>{alive.current=false;clearTimeout(initial);clearInterval(timer);app.remove();};},[refresh,city]);
 return {banners,weather,refresh};
}
export function WeatherTile({weather}:{weather:z.infer<typeof weatherSchema>}){
 const {colors}=useAppearance();
 return <TouchTarget accessibilityRole="button" accessibilityLabel={weather.available?`${weather.temperature} degrees Celsius in ${weather.city}. ${weather.condition}${weather.forecast?' forecast':''}. Open profile to change city.`:weather.city?'Weather unavailable. Pull down to retry. Open profile to check city.':'Weather unavailable. Open profile to enter your city.'} onPress={()=>router.push('/edit-profile')} style={{flexDirection:'row',alignItems:'center',gap:8,padding:12,borderRadius:16,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,minWidth:114}}><AppIcon name={weather.available&&weather.condition==='Clear'?'sun':'cloud'} size={26} color={weather.available?'#E3B441':colors.muted}/><View style={{flexShrink:1}}><Text style={{fontFamily:fonts.semibold,fontSize:18,lineHeight:25,color:colors.ink}}>{weather.available?`${weather.temperature}°C`:'--°C'}</Text><Text style={{fontFamily:fonts.regular,fontSize:11,lineHeight:17,color:colors.muted}}>{weather.city||'Add city'}</Text><Text style={{fontFamily:fonts.regular,fontSize:11,lineHeight:17,color:colors.muted}}>{weather.available?`${weather.condition}${weather.forecast?' forecast':''}`:!weather.city?'Set city in profile':weather.reason==='provider-not-configured'?'Weather service offline':weather.reason==='city-not-found'?'Check city in profile':weather.reason==='daily-limit'?'Daily weather limit reached':'Unavailable ? pull to retry'}</Text></View></TouchTarget>;
}
export function HomeBanner({banners}:{banners:z.infer<typeof bannerSchema>}){
 const [failed,setFailed]=useState<string|null>(null),[index,setIndex]=useState(0);
 const selected=banners[index%banners.length];
 const allowed=['/home','/water','/medicines','/cycle','/activity','/health','/explore','/profile','/connected-health'] as const;
 const route=selected&&allowed.find(path=>path===selected.route);
 const art=<View style={{borderRadius:18,overflow:'hidden',backgroundColor:'#D9E8CA'}}>{selected&&failed!==selected.id?<Image source={{uri:`${env.apiUrl}/home/banners/${selected.id}/image`}} accessibilityLabel={selected.alt} style={{width:'100%',aspectRatio:2.8}} resizeMode="cover" onError={()=>setFailed(selected.id)}/>:<ImageBackground source={require('../../../assets/home/reference-v2/wellness-banner.png')} resizeMode="cover" style={{minHeight:128,padding:14,justifyContent:'center'}}><Text style={{fontFamily:fonts.bold,fontSize:17,lineHeight:20,color:'#073A27',width:'53%'}}>Your health today builds a brighter you tomorrow.</Text><Text style={{fontFamily:fonts.regular,fontSize:10,lineHeight:14,color:'#154A31',width:'47%',marginTop:8}}>Stay consistent. Stay healthier.</Text></ImageBackground>}</View>;
 return <View style={{marginBottom:16}}>{route?<TouchTarget accessibilityRole="button" accessibilityLabel={selected.alt} onPress={()=>router.push(route)}>{art}</TouchTarget>:art}{banners.length>1&&<View style={{flexDirection:'row',gap:8,justifyContent:'center',paddingTop:6}}>{banners.map((banner,i)=><TouchTarget key={banner.id} accessibilityRole="button" accessibilityLabel={`Banner ${i+1}: ${banner.title}`} accessibilityState={{selected:i===index%banners.length}} onPress={()=>{setFailed(null);setIndex(i);}} style={{minWidth:32,minHeight:32,alignItems:'center',justifyContent:'center'}}><View style={{width:i===index%banners.length?18:6,height:6,borderRadius:3,backgroundColor:i===index%banners.length?'#79CDA8':'#72988A'}}/></TouchTarget>)}</View>}</View>;
}
