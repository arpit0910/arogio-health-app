const fs = require('node:fs');
const dir = '.impeccable/mocks/decision';
fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync('.impeccable/questions', { recursive: true });
const worlds = JSON.parse(fs.readFileSync('.impeccable/questions/roll.json', 'utf8')).worlds;
const grounded = [
  ['Daily care journal', 'A familiar personal record connects everyday habits and medical details.', 'White, forest teal, restrained apricot; readable sans; one daily focus above a useful index.'],
  ['Community health wayfinding', 'Clear public-service graphics make mixed health tasks approachable.', 'White, cobalt and green; humanist sans; strong destination bands.'],
  ['Movement club', 'Local activity-club membership balances personal identity and shared wellbeing.', 'Chalk white, bottle green and chartreuse; compact sans; membership-style health identity.'],
  ['Public garden information program', 'A welcoming public garden identity makes a broad health companion feel coherent and human.', 'Pale mineral green, forest ink and lilac; open sans; a continuous focus strip links goals and the next action.'],
  ['Pharmacy identity program', 'Clear medication-packaging hierarchy translates into precise health information.', 'White, navy and cyan; highly readable sans; aligned label/value pairs.'],
  ['Family calendar', 'Shared household planning gives appointments and personal choices an easy rhythm.', 'White, petrol blue and marigold; plain sans; one dated next action.'],
  ['Community centre identity', 'A public wellbeing centre balances useful services and personal warmth.', 'White, indigo and soft orange; bold sans; distinct task bands rather than equal tiles.'],
];
fs.writeFileSync('.impeccable/questions/redesign-reasoning.md', `# Arogio redesign\n\nUser confirmed health management and wellness equally; layouts and artwork may change; name and logo remain.\n\nProduct mechanism: one personal profile anchors health management and wellness preferences; additional services are currently placeholders. Audience: people checking health on a phone during an ordinary day, often hurried or concerned. Home must make the available next action obvious.\n\nAvoid the pastel illustration/card wall and its predictable opposite, a cold clinical dashboard.\n\n${grounded.map((x,i)=>`${i+1}. **${x[0]}** — ${x[1]} ${x[2]}`).join('\n\n')}\n\nSeed: seed:e6073cd8d511dd7a. Assigned index 4.\n\nAll catalog alternatives were fused through type, palette, density and a single functional move. None beats the garden program on both audience identification and task clarity. The botanical folio competes on audience identification; its stage-based comparison has less product clarity without longitudinal data. It remains a full alternate using progressive disclosure of existing information, not invented growth metrics. Other alternatives are demoted with their retained discipline recorded in the payload.\n`);
const assigned = {
  id: 'garden', kind: 'assigned', label: 'Arogio Field Guide', kicker: 'THE ROLL', lineage: 'Contemporary public garden information programs',
  thesis: 'A clear personal health index with one meaningful focus and a calmer path into the app.',
  palette: ['#F1F5EF', '#123C35', '#D7E9B8', '#E6E1F1', '#FFFFFF'], materials: ['flat mineral surfaces', 'open humanist typography'],
  viewport: 'A familiar mobile header, your saved goals in a continuous focus strip, two useful account actions, then an honest upcoming-services list.',
  risk: 'Needs precise typography and spacing to feel distinctive without decorative plants.',
  raised: [
    {from:'Boarding pass and gate board',raise:'Keep a changed or saved choice visible in place rather than making users search for it.'},
    {from:'Dark working surface',raise:'Give destructive account actions their own quiet space and separate areas without stacked shadows.'},
    {from:'Airport wayfinding',raise:'Show one clear next decision per onboarding step, with a truthful step count.'},
    {from:'Streaming catalog',raise:'Reveal secondary information only when the user enters its section.'},
    {from:'Type specimen',raise:'Make the type hierarchy carry the screen before adding containers or illustration.'},
  ], html:`${dir}/garden.html`, htmlFrame:'390x844', comp:`${dir}/garden.png`,
};
const pick = {id:'journal',kind:'pick',label:'Daily Care',kicker:'IMPECCABLE’S PICK',lineage:'Personal care journals',thesis:'An immediately familiar daily check-in, with a compact health overview and a single profile editor.',palette:['#FFFFFF','#124E49','#F5E9DF','#DFEEEC'],materials:['white surfaces','quiet dividers'],viewport:'A dated daily focus, profile summary and a short list of actions, followed by wellness goals.',risk:'Familiar and easy to use, but closer to conventional wellness products.',html:`${dir}/journal.html`,htmlFrame:'390x844',comp:`${dir}/journal.png`};
const details = [
  ['Boarding pass and gate board','declined','Departures become saved health choices, but travel-document density weakens recognition and adds scanning work.','Persistent acknowledgement of saved changes.',['#FFFFFF','#171B20','#E9BA55']],
  ['Dark working surface','declined','Panel divisions translate to account sections, but a dense graphite environment makes ordinary health tasks feel technical.','Isolation of destructive actions and disciplined separation.',['#20242A','#D4DCE2','#57C9B7']],
  ['Growing well','competitive','A botanical progression lends warmth and progressive disclosure; it is less direct for medical information.','Existing sections unfold without introducing growth scores.',['#F5F1E7','#214F3D','#7B3D45']],
  ['Clear wayfinding','declined','Destination bands clarify the next task, but yellow-dominant urgency competes with health status and everyday reassurance.','One decision per step and explicit destinations.',['#F9DA23','#161A1D','#FFFFFF']],
  ['Streaming catalog','declined','Health resources become a browsing catalog, but poster rails hide the next task and imply available content that does not exist.','Secondary detail appears only in its own section.',['#17191E','#FFFFFF','#8ACBB5']],
  ['Type specimen','declined','Large health labels improve hierarchy, but specimen-style scale leaves too little room for real mobile controls.','A complete hierarchy before adding decoration.',['#FAFAF7','#171C1B','#1B7768']],
];
const challengers = worlds.map((world,i)=>({id:`challenger-${i}`,kind:'challenger',catalogId:world.id,label:details[i][0],verdict:details[i][1],thesis:i===2?'A softer personal health companion using staged disclosure and botanical color.':'An alternate visual grammar translated to ordinary mobile health tasks.',lineage:details[i][0],case:details[i][2],kept:details[i][3],palette:details[i][4],materials:['flat surfaces','structured typography'],viewport:i===2?'A compact profile-led home, followed by selectable wellness priorities and the next available task.':'Standard navigation and health/account sections with the source palette and density.',risk:i===2?'Can lean too soft for medical information; no invented growth or progress metrics.':details[i][2],board:world.board,hero:world.hero,...(i===2?{html:`${dir}/botanical.html`,htmlFrame:'390x844',comp:`${dir}/botanical.png`}:{})}));
const canon = {kind:'canon',label:'The familiar health app',thesis:'A conventional health dashboard executed with consistent typography and fewer steps.',palette:['#FFFFFF','#102C36','#087B73'],materials:['standard mobile lists','subtle grouped surfaces'],viewport:'A greeting, health summary, grouped shortcuts and a standard tab bar.',risk:'Easy to recognize, but intentionally less distinctive.',html:`${dir}/canon.html`,htmlFrame:'390x844',comp:`${dir}/canon.png`};
fs.writeFileSync('.impeccable/questions/redesign-options.json',JSON.stringify({title:'A clearer Arogio',question:'Choose the visual direction. Every option includes three onboarding steps, one profile editor, and honest feature availability.',options:[assigned,pick,...challengers],reroll:{registers:['safer','bolder']},buildPath:{value:'code',toggle:true},canon:true,canonCard:canon,steer:true},null,2));
console.log('Direction payload prepared. Sketches are written after serving.');
