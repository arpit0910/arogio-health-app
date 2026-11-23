/* global __dirname */
// Actual app components with synthetic API fixtures; no accounts or app database access.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
globalThis.__DEV__=false;
const root=path.resolve(__dirname,'..'),resolve=Module._resolveFilename,load=Module._load;
const width=Number(process.argv[2]||390),mode=process.argv[3]||'doctor-detail',kind=mode.startsWith('hospital')?'hospital':'doctor';
Module._resolveFilename=function(request,parent,...rest){if(request==='react-native')request='react-native-web';if(request==='react-native-svg')request=path.join(root,'node_modules/react-native-svg/lib/commonjs/ReactNativeSVG.web.js');if(parent?.filename.includes('react-native-svg')&&(request==='./elements'||request==='../elements'))request+='.web';return resolve.call(this,request,parent,...rest);};
for(const extension of ['.ts','.tsx'])Module._extensions[extension]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
for(const extension of ['.png','.jpg'])Module._extensions[extension]=(module,file)=>{module.exports={uri:'data:image/'+(extension==='.jpg'?'jpeg':'png')+';base64,'+fs.readFileSync(file).toString('base64')};};
const React=require('react'),ReactDOM=require('react-dom/server'),{View,Text,AppRegistry,Dimensions}=require('react-native-web');
Dimensions.set({window:{width,height:844,scale:1,fontScale:1},screen:{width,height:844,scale:1,fontScale:1}});
const {colors,fonts}=require('../src/theme/tokens.ts');
Module._load=function(request,parent,...rest){
 // Static preview only: represent the native Image with a browser img because RN Web Image waits for client effects.
 if(request==='react-native') {const native=load.call(this,request,parent,...rest);return {...native,Image:props=>React.createElement('img',{src:props.source?.uri,alt:props.accessibilityLabel||'',onError:props.onError,style:{...native.StyleSheet.flatten(props.style),width:'100%',height:'100%',objectFit:props.resizeMode==='contain'?'contain':'cover'}})};}

 if(request==='expo-secure-store')return {};
 if(request.endsWith('/FigmaAsset'))return {FigmaAsset:()=>null};
 if(request.endsWith('/authentication/context/AuthContext'))return {useAuth:()=>({user:{id:'preview'},isAuthenticated:true})};
 if(request.endsWith('/api/client'))return {apiClient:{}};
 if(request.endsWith('/LanguageProvider'))return {useTranslation:()=>({t:text=>text,language:'en',locale:'en-IN'})};
 if(request.endsWith('/AppearanceProvider'))return {usePalette:()=>colors,useAppTheme:()=>({...colors,teal:colors.primary,white:colors.surface,fonts})};
 if(request.endsWith('/configuration/environment'))return {env:{apiUrl:'https://preview.invalid/api/v1'}};
 if(request==='expo-router')return {useRouter:()=>({push(){},setParams(){}}),useLocalSearchParams:()=>({id:kind==='doctor'?doctorId:hospitalId})};
 if(request==='react-native-safe-area-context')return {useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})};
 if(request==='@tanstack/react-query')return {useInfiniteQuery:()=>({data:{pages:[{items:[kind==='doctor'?doctor:hospital]}]},isPending:false,isError:false,isRefetching:false,refetch(){}}),useQuery:options=>({data:options.queryKey[0]==='medical-departments'?[department]:kind==='doctor'?{...doctor,affiliations:[hospital]}:{...hospital,affiliations:[doctor]},isPending:false,isError:false,isRefetching:false,refetch(){}})};
 if(request.endsWith('/AppScreen'))return {AppScreen:({children,title})=>React.createElement(View,{style:{width,paddingBottom:24,backgroundColor:colors.background}},React.createElement(View,{style:{padding:16,backgroundColor:colors.surface}},React.createElement(Text,{style:{fontFamily:fonts.semibold,color:colors.ink,fontSize:18}},title||'Find Care'),React.createElement(Text,{style:{fontFamily:fonts.regular,color:colors.muted,fontSize:12}},'Synthetic image and API preview')),React.createElement(View,{style:mode.endsWith('detail')?{padding:16}:{}},children))};
 return load.call(this,request,parent,...rest);
};
const doctorId='11111111-1111-4111-8111-111111111111',hospitalId='22222222-2222-4222-8222-222222222222';
const department={id:'33333333-3333-4333-8333-333333333333',source_key:'sample:department',name_en:'Cardiology',name_hi:''};
const base={id:doctorId,name_en:'Dr. Sample Sharma',name_hi:'',city:'Delhi',state:'Delhi',address_line1:'Illustrative address only',address_line2:'',landmark:'',address_hi:'',pincode:'',country_code_1:'+91',phone_1:'9000000000',source_url:'https://example.test/source',latitude:null,longitude:null,summary_en:'Synthetic profile for UI verification only.',summary_hi:'',image_url:`/api/v1/public/doctors/${doctorId}/image?v=sample`,image_alt:'Sample uploaded photo',reviewedAt:'2026-11-15T00:00:00Z',updated_at:'2026-11-15T00:00:00Z'};
const {adaptProvider}=require('../src/features/care-directory/providerCatalog.ts');
const doctor=adaptProvider('doctor',{...base,qualifications:['MBBS','MD'],registration_number:'SAMPLE-001',medical_council:'Sample medical council',languages:['Hindi','English'],experience_years:10,consultation_fee:600,departments:[department],affiliations:[{hospital_id:hospitalId,name_en:'Sample Community Hospital',days_of_week:[1,3,5],start_time:'09:00',end_time:'13:00',consultation_mode:'in_person',availability:'Call to confirm',consultation_fee:700}]});
const hospital=adaptProvider('hospital',{...base,id:hospitalId,name_en:'Sample Community Hospital',hospital_type:'Government',specialties:['Cardiology','General medicine'],nabh_accredited:true,accepts_ayushman:true,image_url:`/api/v1/public/hospitals/${hospitalId}/image?v=sample`});
const {CareSearchScreen}=require('../src/features/care-directory/CareSearchScreen.tsx'),{CareDetailScreen}=require('../src/features/care-directory/CareDetailScreen.tsx'),{HomeCareDiscovery}=require('../src/features/home-dashboard/HomeDiscovery.tsx');
const Component=()=>mode==='home'?React.createElement(View,{style:{padding:16,width}},React.createElement(Text,{style:{color:colors.muted,fontFamily:fonts.regular,fontSize:12,marginBottom:16}},'Synthetic image and API preview'),React.createElement(HomeCareDiscovery,{data:{hospitals:{status:'available',items:[hospital]},doctors:{status:'available',items:[doctor]}},pending:false,error:false,retry(){}})):React.createElement(mode.endsWith('detail')?CareDetailScreen:CareSearchScreen,{fixedKind:kind});
AppRegistry.registerComponent('ProviderPreview',()=>Component);
const {element,getStyleElement}=AppRegistry.getApplication('ProviderPreview');
let markup=ReactDOM.renderToStaticMarkup(element);
// Inline local reference artwork only in this standalone mock HTML; production uses API image URLs.
const photo=(file)=>'data:image/'+(file.endsWith('.jpg')?'jpeg':'png')+';base64,'+fs.readFileSync(path.join(root,file)).toString('base64');
markup=markup.replaceAll(`https://preview.invalid${doctor.imageUrl}`,photo('assets/home/avatar.png')).replaceAll(`https://preview.invalid${hospital.imageUrl}`,photo('assets/homepage/reference-1.jpg'));
const css=ReactDOM.renderToStaticMarkup(getStyleElement());
const fontCSS=[['dm-sans','DMSans','400Regular'],['dm-sans','DMSans','500Medium'],['plus-jakarta-sans','PlusJakartaSans','600SemiBold'],['plus-jakarta-sans','PlusJakartaSans','700Bold'],['inter','Inter','400Regular'],['inter','Inter','600SemiBold']].map(([pkg,family,weight])=>`@font-face{font-family:${family}_${weight};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root,`node_modules/@expo-google-fonts/${pkg}/${weight}/${family}_${weight}.ttf`)).toString('base64')})}`).join('');
const out=path.join(root,'.tmp/provider-catalog-preview');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,`${mode}-${width}.html`),`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}<style>${fontCSS}html,body{width:${width}px;max-width:${width}px}body{margin:0;background:${colors.background}}</style></head><body>${markup}</body></html>`);
console.log('Rendered '+mode+' at '+width+' using synthetic API fixtures.');
