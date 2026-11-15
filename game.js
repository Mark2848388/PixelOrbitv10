'use strict';
/* Pixel Orbit v10 Complete — chests + companions, no Merge, 10 worlds */
const cv=document.getElementById('c'),g=cv.getContext('2d');let H=960,S=1;
function rs(){const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=r.width*d;cv.height=r.height*d;S=cv.width/540;H=cv.height/S;g.setTransform(S,0,0,S,0,0)}
addEventListener('resize',rs);rs();

/* ===== PNG sprites (crisp, no blur) ===== */
const SPR={};
const SPR_LIST=['ship','enemy0','enemy1','enemy2','enemy3','enemy4','enemy5','boss','d56','spark','nova','aegis','bg_stars','ico_play','ico_tower','ico_chest','ico_shop','ico_event','ico_clan','ico_friend','ico_set','ico_arena','ico_endless','ico_season','ico_online'];
function loadSpr(n){
  const i=new Image();
  i.decoding='async';
  // github.io: support both /sprites/x.png and /x.png (flat upload)
  const paths=['sprites/'+n+'.png', n+'.png', './sprites/'+n+'.png'];
  let p=0;i.onerror=()=>{p++;if(p<paths.length)i.src=paths[p]};
  i.src=paths[0];
  SPR[n]=i;
}
SPR_LIST.forEach(loadSpr);
function drawIcoSpr(name,x,y,sc){
  try{return drawSpr('ico_'+name,x,y,sc||1)}catch(e){return false}
}
function drawSpr(name,x,y,sc){
  try{
    const im=SPR[name];if(!im||!im.complete||!im.naturalWidth)return false;
    sc=sc||1;
    const w=im.naturalWidth*sc,h=im.naturalHeight*sc;
    g.imageSmoothingEnabled=false;
    g.drawImage(im,x-w/2,y-h/2,w,h);
    return true;
  }catch(e){return false}
}

/* ===== 10 WORLDS ===== */
const STAGES_PER_WORLD=25;
const WN=['Древняя Система','Кристальные Пещеры','Огненные Земли','Ледяной Фронт','Тёмные Врата','Сердце Титана','Небесный Архипелаг','Плазма-Шторм','Бездна Нуля','Колыбель Звёзд'];
const WC=['#5a7aff','#3ad8e8','#ff7a3a','#8ad8ff','#c04aff','#ff3a4a','#7dffb0','#ff5ad0','#9aa0ff','#ffd34a'];
const BN=['Мега-Уничтожитель','Кристальный Страж','Огненный Колосс','Ледяной Левиафан','Страж Врат','Космический Титан','Небесный Архонт','Плазменный Король','Повелитель Бездны','Звёздный Император'];

/* ===== EVENTS ===== */
const EVENT_CYCLE_SEC = 3600; // 1 hour cycle

const SEASON_DAYS=30;
const SEASON_TIERS=[
  {xp:0,free:{coins:50},prem:{gems:5}},
  {xp:40,free:{coins:80},prem:{gems:5,chests:1}},
  {xp:90,free:{coins:100},prem:{gems:8}},
  {xp:150,free:{coins:120,chests:1},prem:{gems:10}},
  {xp:220,free:{coins:150},prem:{gems:10,chests:1}},
  {xp:300,free:{module:1},prem:{gems:15}},
  {xp:400,free:{coins:200},prem:{gems:15,chests:1}},
  {xp:520,free:{coins:250},prem:{gems:20}},
  {xp:660,free:{chests:1},prem:{gems:20,hero:1}},
  {xp:820,free:{coins:300},prem:{gems:25}},
  {xp:1000,free:{coins:350},prem:{gems:25,chests:2}},
  {xp:1200,free:{gems:5},prem:{gems:30}},
  {xp:1450,free:{coins:400},prem:{gems:30,chests:1}},
  {xp:1750,free:{coins:450},prem:{gems:35}},
  {xp:2100,free:{chests:1},prem:{gems:40,hero:1}},
  {xp:2500,free:{coins:500},prem:{gems:40}},
  {xp:2950,free:{coins:550},prem:{gems:45,chests:2}},
  {xp:3450,free:{gems:8},prem:{gems:50}},
  {xp:4000,free:{coins:600},prem:{gems:50,chests:2}},
  {xp:4600,free:{coins:700},prem:{gems:60,hero:1}},
  {xp:5300,free:{chests:2},prem:{gems:70}},
  {xp:6100,free:{coins:800},prem:{gems:80,chests:2}},
  {xp:7000,free:{gems:10},prem:{gems:90}},
  {xp:8000,free:{coins:1000},prem:{gems:100,chests:3}},
  {xp:9200,free:{chests:2},prem:{gems:120,hero:1}},
  {xp:10500,free:{coins:1200},prem:{gems:140}},
  {xp:12000,free:{gems:15},prem:{gems:160,chests:3}},
  {xp:13800,free:{coins:1500},prem:{gems:180}},
  {xp:15800,free:{chests:3},prem:{gems:200,hero:1}},
  {xp:18000,free:{coins:2000,gems:20,d56:1},prem:{gems:250,chests:5,d56:1}}
];
const MODULE_SYNERGY=[
  {a:'m_dmg2',b:'m_fire2',bonus:{dmg:0.08,fire:0.08},name:'Скорострельный луч'},
  {a:'m_dmg3',b:'m_sk2',bonus:{dmg:0.12,skill:0.1},name:'Нейро-призма'},
  {a:'m_hp2',b:'m_sk1',bonus:{hp:0.12,skill:0.08},name:'Живой щит'},
  {a:'m_fire3',b:'m_coin',bonus:{fire:0.1,coin:0.1},name:'Золотая очередь'},
  {a:'m_all',b:'m_dmg3',bonus:{dmg:0.15,hp:0.08},name:'Ядро разрушения'},
  {a:'m_dmg1',b:'m_fire1',bonus:{dmg:0.05,fire:0.05},name:'Базовый фокус'}
];
const EVENT_SHOP=[
  {id:'es_chest',name:'Ивент-сундук',desc:'+2 сундука',price:40,give:{chests:2}},
  {id:'es_gems',name:'Кристаллы',desc:'+15 гемов',price:60,give:{gems:15}},
  {id:'es_coins',name:'Монеты',desc:'+500 монет',price:30,give:{coins:500}},
  {id:'es_mod',name:'Случайный модуль',desc:'Модуль оружия',price:80,give:{module:1}},
  {id:'es_hero',name:'Фрагмент героя',desc:'Случайный компаньон',price:100,give:{hero:1}},
  {id:'es_keys',name:'Ключ рейда',desc:'+1 ключ сегодня',price:50,give:{keys:1}},
  {id:'es_sk',name:'Набор навыков',desc:'+2 к каждому навыку',price:45,give:{skills:2}},
  {id:'es_prest',name:'Звезда ранга',desc:'+1% престиж-бонус',price:200,give:{prest:0.01}}
];
const EVENT_LIST = [
  {id:'archon',name:'Прибытие Архонта',em:'',desc:'Мини-босс ивента. Победи 2 раза. Награда: сундук + гемы.',diff:1.4,reward:{coins:500,gems:25,chests:2},goal:2,track:'boss'},
  {id:'meteor',name:'Метеоритный дождь',em:'',desc:'Быстрые волны. x2.5 монеты. Пройди 4 уровня.',diff:1.2,reward:{coins:450,gems:15,chests:1},goal:4,track:'stages',coinMul:2.5},
  {id:'void',name:'Разлом Бездны',em:'',desc:'Враги жёстче. Убей ивент-босса. Шанс редкого героя.',diff:1.55,reward:{gems:35,chests:2},goal:1,track:'boss'},
  {id:'harvest',name:'Звёздный урожай',em:'',desc:'+XP и монеты. 6 побед в любых режимах.',diff:1.1,reward:{coins:350,gems:20,chests:1},goal:6,track:'stages',xpMul:1.8,coinMul:1.5},
  {id:'siege',name:'Осада Титана',em:'',desc:'Выживи 5 волн бесконечного. Толстые враги.',diff:1.3,reward:{coins:600,gems:30,chests:2},goal:5,track:'stages'},
  {id:'lottery',name:'Космическая лотерея',em:'',desc:'Любые 3 босса. Гарантированный премиум-сундук.',diff:1.25,reward:{chests:3,gems:10},goal:3,track:'boss'}
];
function eventNow(){
  const slot = Math.floor(Date.now()/1000/EVENT_CYCLE_SEC);
  const ev = EVENT_LIST[slot % EVENT_LIST.length];
  const ends = (slot+1)*EVENT_CYCLE_SEC*1000;
  const left = Math.max(0, Math.floor((ends - Date.now())/1000));
  return {ev, slot, left, ends};
}
function refreshRaidKeys(){
  const day=new Date().toDateString();
  if(!D.eventRaid)D.eventRaid={keys:3,keyDay:'',bossHp:500000,bossMax:500000,totalDmg:0,phase:1};
  if(D.eventRaid.keyDay!==day){D.eventRaid.keyDay=day;D.eventRaid.keys=3;save()}
}
function ensureEventState(){
  if(!D.event) D.event = {slot:-1, prog:0, claimed:false};
  const {slot} = eventNow();
  if(D.event.slot !== slot){
    D.event = {slot, prog:0, claimed:false};
    save();
  }
  return D.event;
}

/* ===== CHARACTERS (from chests) ===== */
const CHARS=[
  {id:'spark',name:'Спарк',role:'dps',rarity:1,col:'#ffd34a',bonus:{dmg:0.06,fire:0.05},skill:{id:'spark_shot',name:'Искра',cd:12,desc:'Залп искр'},desc:'Искры урона'},
  {id:'bulb',name:'Балб',role:'tank',rarity:1,col:'#8ad8ff',bonus:{hp:0.10},skill:{id:'ice_shield',name:'Щит',cd:14,desc:'Щит 3с'},desc:'Ледяной щит'},
  {id:'ember',name:'Эмбер',role:'dps',rarity:1,col:'#ff7a3a',bonus:{dmg:0.08},skill:{id:'fire_wave',name:'Волна',cd:13,desc:'Огненная волна'},desc:'Огонь'},
  {id:'mint',name:'Минт',role:'support',rarity:1,col:'#7dffb0',bonus:{hp:0.05,coin:0.04},skill:{id:'heal',name:'Лечение',cd:15,desc:'+25% HP'},desc:'Поддержка'},
  {id:'shade',name:'Шейд',role:'dps',rarity:2,col:'#c04aff',bonus:{dmg:0.12,coin:0.05},skill:{id:'shadow',name:'Тень',cd:11,desc:'Крит-залп'},desc:'Тень'},
  {id:'pulse',name:'Пульс',role:'support',rarity:2,col:'#5ff6ff',bonus:{hp:0.10,skill:0.12},skill:{id:'pulse_cd',name:'Импульс',cd:16,desc:'Сброс CD навыков'},desc:'Импульс'},
  {id:'orbit',name:'Орбит',role:'utility',rarity:2,col:'#9ec9ff',bonus:{dmg:0.08,hp:0.08,fire:0.06},skill:{id:'orbit_ring',name:'Кольцо',cd:14,desc:'Кольцо урона'},desc:'Баланс'},
  {id:'comet',name:'Комета',role:'dps',rarity:2,col:'#cfe8ff',bonus:{dmg:0.10,fire:0.08},skill:{id:'comet',name:'Комета',cd:12,desc:'Мощный снаряд'},desc:'Скорость'},
  {id:'nova',name:'Нова',role:'dps',rarity:3,col:'#ffd34a',bonus:{dmg:0.16,fire:0.10},skill:{id:'nova',name:'Нова',cd:18,desc:'Взрыв вокруг'},desc:'Вспышка'},
  {id:'aegis',name:'Эгида',role:'tank',rarity:3,col:'#8ad8ff',bonus:{hp:0.22,skill:0.08},skill:{id:'fortify',name:'Бастион',cd:16,desc:'Щит 5с + броня'},desc:'Бастион'},
  {id:'eclipse',name:'Затмение',role:'dps',rarity:3,col:'#ff5ad0',bonus:{dmg:0.18,coin:0.08},skill:{id:'eclipse',name:'Затмение',cd:15,desc:'Сильный урон боссу'},desc:'Крит'},
  {id:'wisp',name:'Висп',role:'support',rarity:3,col:'#e0b0ff',bonus:{hp:0.12,fire:0.08,skill:0.15},skill:{id:'slow',name:'Замедление',cd:14,desc:'Враги медленнее 4с'},desc:'Дух'},
  {id:'boulder',name:'Боулдер',role:'tank',rarity:3,col:'#9aa0ff',bonus:{hp:0.18,dmg:0.06},skill:{id:'quake',name:'Тряска',cd:13,desc:'Стан врагов'},desc:'Камень'},
  {id:'fenix',name:'Феникс',role:'dps',rarity:4,col:'#ff9a4a',bonus:{dmg:0.20,fire:0.12,hp:0.08},skill:{id:'rebirth',name:'Возрождение',cd:30,desc:'Один раз: не умереть'},desc:'Возрождение'},
  {id:'starlord',name:'Звёздный Лорд',role:'utility',rarity:4,col:'#ffd34a',bonus:{dmg:0.22,hp:0.15,coin:0.12,fire:0.10,skill:0.1},skill:{id:'starfall',name:'Звездопад',cd:20,desc:'Дождь снарядов'},desc:'Легенда'},
  {id:'d56',name:'Д-56',role:'utility',rarity:4,col:'#7fd0ff',bonus:{dmg:0.25,hp:0.18,fire:0.12,skill:0.15,coin:0.1},skill:{id:'d56_core',name:'Ядро Д-56',cd:18,desc:'Мощный импульс + щит'},desc:'Сезонный прототип'}
];

const MODULES=[
  {id:'m_dmg1',name:'Линза урона',slot:'dmg',bonus:{dmg:0.08},cost:120,rarity:1},
  {id:'m_dmg2',name:'Призма',slot:'dmg',bonus:{dmg:0.15},cost:280,rarity:2},
  {id:'m_dmg3',name:'Квантовый луч',slot:'dmg',bonus:{dmg:0.25},cost:0,gems:40,rarity:3},
  {id:'m_fire1',name:'Ускоритель',slot:'fire',bonus:{fire:0.08},cost:120,rarity:1},
  {id:'m_fire2',name:'Турбо',slot:'fire',bonus:{fire:0.16},cost:280,rarity:2},
  {id:'m_fire3',name:'Гиперстрельба',slot:'fire',bonus:{fire:0.25},cost:0,gems:40,rarity:3},
  {id:'m_sk1',name:'Чип навыков',slot:'skill',bonus:{skill:0.1},cost:150,rarity:1},
  {id:'m_sk2',name:'Нейролинк',slot:'skill',bonus:{skill:0.2,hp:0.05},cost:320,rarity:2},
  {id:'m_hp1',name:'Бронеплита',slot:'hp',bonus:{hp:0.1},cost:140,rarity:1},
  {id:'m_hp2',name:'Реактор щита',slot:'hp',bonus:{hp:0.18},cost:300,rarity:2},
  {id:'m_coin',name:'Магнит монет',slot:'util',bonus:{coin:0.12},cost:200,rarity:2},
  {id:'m_all',name:'Ядро Орбиты',slot:'util',bonus:{dmg:0.1,hp:0.1,fire:0.08},cost:0,gems:60,rarity:3}
];
const ROLE_NAME={dps:'Атака',tank:'Защита',support:'Поддержка',utility:'Универсал'};
const RARITY_NAME=['','Обычный','Редкий','Эпический','Легендарный'];
const RARITY_COL=['','#9ec9ff','#5ff6ff','#c04aff','#ffd34a'];
const CHEST_COST={coins:120,gems:15}; // basic / premium
const DROP_TABLE=[ // weighted
  {r:1,w:55},{r:2,w:28},{r:3,w:14},{r:4,w:3}
];

/* ===== BUILDINGS ===== */
const BLD=[
  {id:'gen',n:'Кузница',max:5,c:80,prod:['coins',10],d:'Оффлайн-кредиты'},
  {id:'fac',n:'Мастерская',max:3,c:120,prod:['gems',1.2],d:'Оффлайн-гемы'},
  {id:'lab',n:'Башня магов',max:3,c:150,d:'+10% XP'},
  {id:'tur',n:'Стражевая',max:5,c:60,d:'+авто-урон'},
  {id:'dome',n:'Щит замка',max:2,c:200,d:'+20 HP корпуса'},
  {id:'dock',n:'Лазарет',max:2,c:140,d:'+реген HP'},
  {id:'beacon',n:'Святилище',max:4,c:160,d:'+5% монет и XP'},
  {id:'miner',n:'Глубинная шахта',max:3,c:220,prod:['coins',18],d:'Сильный оффлайн'},
  {id:'chest',n:'Хранилище сундуков',max:3,c:250,d:'+1 сундук при открытии мира'},
  {id:'reactor',n:'Сердце станции',max:1,c:500,d:'×1.25 ко всем бонусам'}
];

/* ===== SKINS (pilot look) ===== */
const SKINS=[
  {id:'A1-06',name:'A1-06',col:'#9ec9ff'},
  {id:'neon',name:'Neon',col:'#5ff6ff'},
  {id:'crimson',name:'Crimson',col:'#ff4a6a'},
  {id:'gold',name:'Gold',col:'#ffd34a'},
  {id:'void',name:'Void',col:'#c04aff'},
  {id:'ice',name:'Ice',col:'#8ad8ff'},
  {id:'forest',name:'Forest',col:'#7dffb0'},
  {id:'solar',name:'Solar',col:'#ff9a4a'}
];

/* ===== SAVE ===== */
const DEF={
  coins:100,gems:50,xp:0,lv:1,prog:{},sk:{m:5,n:3,s:3,b:2},ud:0,uh:0,best:0,snd:1,mus:1,
  kills:0,bosses:0,q:{d:'',k:0,s:0,b:0,c:[0,0,0]},
  bld:{},
  chars:{}, // id -> count (duplicates as fragments / stars)
  equip:[null,null], // two companion slots
  chests:2, // free starter chests
  contracts:{daily:[],weekly:[],monthly:[],claimed:{},lastD:'',lastW:'',lastM:''},
  cosmetic:{skin:'A1-06',owned:['A1-06','neon']},
  prof:{name:'Пилот',title:0,uid:'',avatar:''},
  st:{built:0,loginDays:1,lastLogin:'',opened:0},
  lastOnline:Date.now(),
  dailyClaimed:false,
  event:{slot:-1,prog:0,claimed:false},
  base:[],
  modules:{owned:{},equip:{dmg:null,fire:null,skill:null}},
  prestige:{level:0,bonus:0},
  tower:{floor:0,best:0,day:''},
  gifts:{},
  fenixUsed:false,
  eventRaid:{keys:3,keyDay:'',bossHp:500000,bossMax:500000,totalDmg:0,phase:1},
  eventCur:0, // event currency
  eventShopBought:{},
  season:{id:1,xp:0,prem:false,claimedFree:{},claimedPrem:{},start:0},
  clan:{code:'',name:'',role:'none',raidHp:200000,raidMax:200000,raidDmg:0},
  baseDef:{turrets:1,lastRaid:0},
  weeklyBoss:{week:'',top:[]},
  playlist:[]
};
let D=JSON.parse(JSON.stringify(DEF));
try{Object.assign(D,JSON.parse(localStorage.getItem('po10')||'{}'))}catch(e){}
if(!D.bld)D.bld={};if(!D.chars)D.chars={};if(!D.equip)D.equip=[null,null];
if(D.chests==null)D.chests=2;
if(!D.contracts)D.contracts={daily:[],weekly:[],monthly:[],claimed:{},lastD:'',lastW:'',lastM:''};
if(!D.cosmetic)D.cosmetic={skin:'A1-06',owned:['A1-06','neon']};
if(!D.prof)D.prof={name:'Пилот',title:0};
if(!D.st)D.st={built:0,loginDays:1,lastLogin:'',opened:0};
if(!D.sk.b)D.sk.b=2;
if(!D.lastOnline)D.lastOnline=Date.now();
if(!D.base)D.base=[];
if(!D.bld.reactor)D.bld.reactor=1;
if(!D.modules)D.modules={owned:{},equip:{dmg:null,fire:null,skill:null}};
if(!D.modules.equip)D.modules.equip={dmg:null,fire:null,skill:null};
if(!D.prestige)D.prestige={level:0,bonus:0};
if(!D.tower)D.tower={floor:0,best:0,day:''};
if(!D.gifts)D.gifts={};
if(!D.eventRaid)D.eventRaid={keys:3,keyDay:'',bossHp:500000,bossMax:500000,totalDmg:0,phase:1};
if(D.eventCur==null)D.eventCur=0;
if(!D.eventShopBought)D.eventShopBought={};
if(!D.dailyBox)D.dailyBox={day:'',streak:0,claimed:false};
if(D.arenaBest==null)D.arenaBest=0;
if(!D.season)D.season={id:1,xp:0,prem:false,claimedFree:{},claimedPrem:{},start:Date.now()};
if(!D.season.start)D.season.start=Date.now();
if(!D.clan)D.clan={code:'',name:'',role:'none',raidHp:200000,raidMax:200000,raidDmg:0};
if(!D.baseDef)D.baseDef={turrets:1,lastRaid:0};
if(!D.weeklyBoss)D.weeklyBoss={week:'',top:[]};
if(!D.playlist)D.playlist=[];if(!D.prof)D.prof={name:'Пилот',title:0,uid:'',avatar:''};if(D.prof.avatar==null)D.prof.avatar='';
// clean old merge data if any
delete D.units;
const save=()=>{try{localStorage.setItem('po10',JSON.stringify(D))}catch(e){}};
window.PO_SAVE=D;window.PO_SAVE_FN=save;
if(!D.prof.uid){D.prof.uid='PO-'+Math.random().toString(36).slice(2,8).toUpperCase();save();}

/* ===== STATE ===== */
let scr='home',wd=0,sel=0,btns=[],toastT=0,toastS='',T=0,B=null,P,bl=[],eb=[],en=[],pk=[],fx=[],shake=0;
let chestAnim=null; // {t, char, rarity}
const toast=s=>{toastS=s;toastT=2.4};
let ac;const beep=(f,d,v=.05)=>{if(!D.snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),a=ac.createGain();o.type='square';o.frequency.value=f;a.gain.value=v;a.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(a);a.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}};

/* ===== HELPERS ===== */
const stars=D.prog,key=(w,s)=>w+'_'+s;
const unlocked=(w,s)=>s?!!stars[key(w,s-1)]:(w==0||!!stars[key(w-1,STAGES_PER_WORLD-1)]);
function bldLvl(id){return D.bld[id]||0}

function companionBonus(){
  const b={dmg:0,hp:0,fire:0,coin:0,skill:0};
  (D.equip||[]).forEach(id=>{
    if(!id)return;
    const c=CHARS.find(x=>x.id===id);if(!c||!c.bonus)return;
    const stars=Math.min(5,D.chars[id]||1);
    const mul=1+(stars-1)*0.15;
    Object.keys(c.bonus).forEach(k=>b[k]=(b[k]||0)+c.bonus[k]*mul);
  });
  // modules
  const eq=(D.modules&&D.modules.equip)||{};
  Object.values(eq).forEach(mid=>{
    if(!mid)return;
    const m=MODULES.find(x=>x.id===mid);if(!m||!m.bonus)return;
    Object.keys(m.bonus).forEach(k=>b[k]=(b[k]||0)+m.bonus[k]);
  });
  // synergies
  const ownedEq=Object.values(eq).filter(Boolean);
  MODULE_SYNERGY.forEach(s=>{
    if(ownedEq.includes(s.a)&&ownedEq.includes(s.b)){
      Object.keys(s.bonus).forEach(k=>b[k]=(b[k]||0)+s.bonus[k]);
    }
  });
  // prestige permanent
  const pb=(D.prestige&&D.prestige.bonus)||0;
  if(pb){b.dmg+=pb;b.hp+=pb*0.5;b.coin+=pb*0.3}
  if(bldLvl('reactor'))Object.keys(b).forEach(k=>b[k]*=1.25);
  return b;
}
function charStars(id){return Math.min(5,D.chars[id]||0)}


/* Offline + daily */
(function(){
  const now=Date.now(),sec=Math.min(10*3600,(now-(D.lastOnline||now))/1000);
  if(sec>60){
    let coins=0,gems=0;
    BLD.forEach(b=>{const lv=bldLvl(b.id);if(lv&&b.prod){const rate=b.prod[1]*lv*(bldLvl('reactor')?1.25:1);if(b.prod[0]==='coins')coins+=rate*(sec/60);if(b.prod[0]==='gems')gems+=rate*(sec/500)}});
    coins*=(1+0.05*bldLvl('beacon'));coins=Math.floor(coins);gems=Math.floor(gems);
    if(coins||gems){D.coins+=coins;D.gems+=gems;toast('Оффлайн +'+coins+''+(gems?' +'+gems+'G':''))}
  }
  const today=new Date().toDateString();
  if(D.st.lastLogin!==today){
    D.st.lastLogin=today;D.st.loginDays=(D.st.loginDays||0)+1;D.dailyClaimed=false;
    const bonus=35+D.st.loginDays*6;D.coins+=bonus;
    if(D.st.loginDays%3===0){D.chests=(D.chests||0)+1;toast('Ежедневный бонус +'+bonus+' и сундук!')}
    else toast('Ежедневный бонус +'+bonus+'');
  }
  D.lastOnline=now;save();
})();

/* Contracts */
const CPOOL={
  daily:[
    {id:'d_kills',n:'Убей 50 врагов',t:50,track:'kills',r:{coins:150}},
    {id:'d_stages',n:'Пройди 3 уровня',t:3,track:'stages',r:{gems:10}},
    {id:'d_boss',n:'Победи босса',t:1,track:'boss',r:{gems:18,chests:1}},
    {id:'d_chest',n:'Открой 2 сундука',t:2,track:'chest',r:{coins:100}},
    {id:'d_build',n:'Улучши здание',t:1,track:'build',r:{coins:90}}
  ],
  weekly:[
    {id:'w_kills',n:'Убей 400 врагов',t:400,track:'kills',r:{coins:800,gems:30}},
    {id:'w_boss',n:'Победи 6 боссов',t:6,track:'boss',r:{gems:50,chests:2}},
    {id:'w_chest',n:'Открой 10 сундуков',t:10,track:'chest',r:{coins:400,chests:1}}
  ],
  monthly:[
    {id:'m_kills',n:'Убей 2000 врагов',t:2000,track:'kills',r:{coins:2500,gems:120}},
    {id:'m_stars',n:'Собери 50 звёзд',t:50,track:'stars',r:{gems:100,chests:3}}
  ]
};
function refreshContracts(){
  const now=new Date(),day=now.toDateString();
  const week=now.getFullYear()+'-W'+Math.ceil((((now-new Date(now.getFullYear(),0,1))/86400000)+1)/7);
  const month=now.getFullYear()+'-'+now.getMonth();
  const C=D.contracts;
  if(C.lastD!==day){C.daily=CPOOL.daily.sort(()=>Math.random()-.5).slice(0,3).map(q=>({...q,p:0,done:0}));C.lastD=day;C.claimed={}}
  if(C.lastW!==week){C.weekly=CPOOL.weekly.map(q=>({...q,p:0,done:0}));C.lastW=week}
  if(C.lastM!==month){C.monthly=CPOOL.monthly.map(q=>({...q,p:0,done:0}));C.lastM=month}
}
function track(kind,n=1){
  refreshContracts();
  const C=D.contracts;
  ['daily','weekly','monthly'].forEach(g=>{(C[g]||[]).forEach(q=>{if(q.track===kind&&!q.done){q.p=Math.min(q.t,(q.p||0)+n);if(q.p>=q.t)q.done=1}})});
  if(kind==='kills')D.q.k=(D.q.k||0)+n;
  if(kind==='stages')D.q.s=(D.q.s||0)+n;
  if(kind==='boss')D.q.b=(D.q.b||0)+n;
  save();
}
refreshContracts();

/* Chest open */
function rollChar(premium){
  let table=DROP_TABLE.slice();
  if(premium){table=[{r:1,w:25},{r:2,w:40},{r:3,w:28},{r:4,w:7}]}
  const total=table.reduce((a,x)=>a+x.w,0);
  let r=Math.random()*total,rar=1;
  for(const t of table){r-=t.w;if(r<=0){rar=t.r;break}}
  const pool=CHARS.filter(c=>c.rarity===rar);
  return pool[Math.floor(Math.random()*pool.length)];
}
function openChest(premium){
  if(chestAnim)return;
  if(premium){
    if(D.gems<CHEST_COST.gems){toast('Нужно '+CHEST_COST.gems+'G');return}
    D.gems-=CHEST_COST.gems;
  }else{
    if((D.chests||0)<1){
      if(D.coins<CHEST_COST.coins){toast('Нужен сундук или '+CHEST_COST.coins+'');return}
      D.coins-=CHEST_COST.coins;
    }else D.chests--;
  }
  const ch=rollChar(premium);
  D.chars[ch.id]=(D.chars[ch.id]||0)+1;
  D.st.opened=(D.st.opened||0)+1;
  track('chest');
  // multi-phase anim: 0 shake, 1 burst, 2 reveal, 3 hold
  chestAnim={t:0,phase:0,char:ch,rarity:ch.rarity,dur:3.2};
  beep(180,.15,.06);
  save();
}


/* Draw helpers */
function rr(x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r)}
function panel(x,y,w,h,c,f='rgba(8,14,52,.86)'){rr(x,y,w,h,14);g.shadowColor=c;g.shadowBlur=12;g.fillStyle=f;g.fill();g.shadowBlur=0;g.strokeStyle=c;g.lineWidth=2.5;g.stroke()}
function tx(s,x,y,z=22,c='#fff',a='left'){g.font='bold '+z+'px system-ui,sans-serif';g.textAlign=a;g.textBaseline='middle';g.lineWidth=z/5;g.strokeStyle='#050818';g.lineJoin='round';g.strokeText(s,x,y);g.fillStyle=c;g.fillText(s,x,y)}

function cardBtn(x,y,w,h,ico,title,sub,col,fn){
  // frosted card with colored left accent + icon circle
  rr(x,y,w,h,16);
  g.fillStyle='rgba(12,20,48,0.92)';g.fill();
  g.strokeStyle=col;g.lineWidth=2;g.shadowColor=col;g.shadowBlur=10;g.stroke();g.shadowBlur=0;
  // accent bar
  g.fillStyle=col;g.fillRect(x+2,y+8,4,h-16);
  // icon circle
  const ix=x+28,iy=y+h/2;
  g.fillStyle=col;g.globalAlpha=0.25;g.beginPath();g.arc(ix,iy,16,0,7);g.fill();g.globalAlpha=1;
  g.strokeStyle=col;g.lineWidth=1.5;g.beginPath();g.arc(ix,iy,16,0,7);g.stroke();
  g.fillStyle='#fff';g.font='bold 14px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText(ico||'•',ix,iy+1);
  // text
  g.textAlign='left';
  g.fillStyle='#fff';g.font='bold 15px system-ui,sans-serif';g.fillText(title,x+52,y+h/2-(sub?8:0));
  if(sub){g.fillStyle='rgba(200,220,255,0.7)';g.font='11px system-ui,sans-serif';g.fillText(sub,x+52,y+h/2+10)}
  btns.push({x,y,w,h,fn});
}
function chipBtn(x,y,w,h,ico,label,col,fn){
  rr(x,y,w,h,14);
  g.fillStyle='rgba(10,18,40,0.9)';g.fill();
  g.strokeStyle=col;g.lineWidth=2;g.shadowColor=col;g.shadowBlur=8;g.stroke();g.shadowBlur=0;
  g.fillStyle=col;g.globalAlpha=0.2;g.beginPath();g.arc(x+22,y+h/2,12,0,7);g.fill();g.globalAlpha=1;
  g.fillStyle='#fff';g.font='bold 13px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText(ico||'•',x+22,y+h/2+1);
  g.fillStyle='#e8f0ff';g.font='bold 13px system-ui,sans-serif';
  g.fillText(label,x+w/2+8,y+h/2+1);
  btns.push({x,y,w,h,fn});
}
function btn(x,y,w,h,label,c,fn,z=22,f){panel(x,y,w,h,c,f);tx(label,x+w/2,y+h/2+1,z,'#fff','center');btns.push({x,y,w,h,fn})}
function hit(x,y,w,h,fn){btns.push({x,y,w,h,fn})}
function bar(x,y,w,h,v,c){rr(x,y,w,h,h/2);g.fillStyle='#0a1030';g.fill();if(v>0){rr(x,y,Math.max(h,w*Math.min(1,v)),h,h/2);g.fillStyle=c;g.fill()}rr(x,y,w,h,h/2);g.strokeStyle='#8ab0ff';g.lineWidth=1.5;g.stroke()}
function pill(x,y,ic,v){panel(x,y,104,34,'#6a8aff');tx(ic,x+18,y+18,20);tx(''+v,x+66,y+18,19,'#fff','center')}
const SP=[];for(let i=0;i<80;i++)SP.push([Math.random()*540,Math.random()*1600,.3+Math.random()*.7]);
function bg(w,sp=20){const c=WC[w%10],gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#050818');gr.addColorStop(1,'#0c0a2e');g.fillStyle=gr;g.fillRect(0,0,540,H);
for(const[x,y,r]of[[100,.2,260],[460,.55,300],[200,.9,280]]){const q=g.createRadialGradient(x,y*H,0,x,y*H,r);q.addColorStop(0,c+'55');q.addColorStop(1,c+'00');g.fillStyle=q;g.fillRect(0,0,540,H)}
for(const s of SP){const y=(s[1]+T*sp*s[2])%(H+20);g.fillStyle='rgba(200,220,255,'+(.35+s[2]*.55)+')';g.fillRect(s[0],y,s[2]>.8?3:2,s[2]>.8?3:2)}}
function spr(m,pal,cx,cy,z){const w=m[0].length*z,h=m.length*z;for(let j=0;j<m.length;j++)for(let i=0;i<m[j].length;i++){const k=m[j][i];if(k!='.'){g.fillStyle=pal[k];g.fillRect(Math.round(cx-w/2+i*z),Math.round(cy-h/2+j*z),z,z)}}}
const SHIP=['......w......','......a......','.....aba.....','.....akb.....','....aakbb....','...caakbbc...','..ccaabbbcc..','.ccdabbbbdcc.','ccdd.bbb.ddcc','cdd..bbb..ddc','rd...bbb...dr','r....dbd....r','.....e.e.....'];
const SPAL={w:'#fff',a:'#cfe8ff',b:'#7fb7ff',c:'#4a6fe0',d:'#2a3f93',k:'#5ff6ff',r:'#ff4a6a',e:'#ffb04a'};
const EM=[
['..a.a..','.ababa.','abkbkba','.abkba.','..aba..','...b...','..r.r..'],
['.a...a.','aab.baa','abbbbba','.bkkkb.','..bbb..','..b.b..','..r.r..'],
['.aaaaa.','abbbbba','abkkkba','abbbbba','abbbbba','.abbba.','..rrr..'],
['..g.g..','.ggggg.','gkwkwkg','.ggggg.','..gkg..','...g...','..y.y..'],
['..u.u..','.uuuuu.','ukukuku','.uuuuu.','..uku..','.u...u.','u.....u'],
['.p.p.p.','ppppppp','pkpkpkp','ppppppp','.pkpkp.','..ppp..','..e.e..']
];
const EP=[
{a:'#ff6a5a',b:'#b83a4a',k:'#ffe04a',r:'#ff3040'},
{a:'#b07aff',b:'#6a3ad0',k:'#ff5ad0',r:'#c04aff'},
{a:'#ffb04a',b:'#c0602a',k:'#fff',r:'#ff6020'},
{a:'#5affb0',b:'#1a8050',k:'#c0ffd0',y:'#ffd34a',g:'#3ad86a',r:'#ff5a7a'},
{a:'#5ad0ff',b:'#2060a0',k:'#dff',u:'#8ad8ff',r:'#4a9aff'},
{a:'#ff5ad0',b:'#801050',k:'#ffc0e0',p:'#e0b0ff',e:'#ff8ad0',r:'#ff3a8a'}
];
const ROB=['..r..','.ccc.','cbkbc','.ccc.','dcccd','d.c.d'];let RP={r:'#ff4a6a',c:'#9ec9ff',b:'#1a2a6a',k:'#5ff6ff',d:'#4a6fe0'};

/* ===== PIXEL SPRITES (companions, chest, buildings) ===== */
const CPAL={
  k:'#1a1a2e',w:'#ffffff',a:'#cfe8ff',b:'#7fb7ff',c:'#4a6fe0',d:'#2a3f93',
  r:'#ff4a6a',o:'#ff9a4a',y:'#ffd34a',g:'#7dffb0',p:'#c04aff',u:'#5ff6ff',e:'#ff5ad0',n:'#3ad86a',s:'#8ad8ff'
};
// 11x11 companion frames (simple robots/aliens)
const CSPR={
  spark:['...yyy...','..ywwwy..','.ywkkwy.','.ywkkwy.','..ywwy..','...bb...','..bbbb..','.b.bb.b.','b..bb..b','.bb..bb.','........'],
  bulb:['...sss...','..swwws..','.swkkws.','.swwwws.','..swws..','...cc...','..cccc..','.c.cccc.','.cc..cc.','..c..c..','........'],
  ember:['...ooo...','..owwwo..','.owkkwo.','.owwwwo.','..owwo..','...rr...','..rrrr..','.r.rr.r.','r..rr..r','.rr..rr.','........'],
  mint:['...ggg...','..gwwwg..','.gwkwgw.','.gwwwwg.','..gwwg..','...nn...','..nnnn..','.n.nn.n.','n..nn..n','.nn..nn.','........'],
  shade:['...ppp...','..pwwwp..','.pwkkwp.','.pwwwwp.','..pwwp..','...dd...','..dddd..','.d.dd.d.','d..dd..d','.dd..dd.','........'],
  pulse:['...uuu...','..uwwwu..','.uwkwuw.','.uwwwwu.','..uwwu..','...bb...','..bbbb..','.b.bb.b.','b..bb..b','.bb..bb.','........'],
  orbit:['...aaa...','..awwwa..','.awkkwa.','.awwwwa.','..awwa..','...cc...','..cccc..','.c.cc.c.','c..cc..c','.cc..cc.','........'],
  nova:['...yyy...','..ywwwy..','.ywywyw.','.ywwwwy.','..yyyy..','...oo...','..oooo..','o.oooo.o','o..oo..o','.oo..oo.','........'],
  aegis:['...sss...','..swwws..','.swwwwws','.sbbbbbs','..sbbbs..','...bb...','..bbbb..','.bbbbbb.','bb.bb.bb','.bb..bb.','........'],
  eclipse:['...eee...','..ewwwe..','.ewkkwe.','.ewwwwe.','..ewwe..','...pp...','..pppp..','.p.pp.p.','p..pp..p','.pp..pp.','........'],
  wisp:['...uuu...','..uwwwu..','.uwuwuw.','.uwwwwu.','..uuuu..','...aa...','..aaaa..','.a.aa.a.','a..aa..a','.aa..aa.','........'],
  starlord:['...yyy...','..ywywy..','.ywwwwwy','.yybbbyy','..ybbby..','...bb...','..bbbb..','b.bbbb.b','by.bb.yb','.bb..bb.','........'],
  comet:['...aaa...','..awwwa..','.awkkwa.','..awwa..','...uu...','..uuuu..','.u.uu.u.','u..uu..u','.uu..uu.','..u..u..','........'],
  boulder:['...ddd...','..dwwwd..','.dwkkwd.','.dwwwwd.','..dddd..','...dd...','..dddd..','.dddddd.','dd.dd.dd','.dd..dd.','........'],
  fenix:['...ooo...','..owowo..','.owwwwo.','.oorrro.','..oooo..','...rr...','..rrrr..','.r.rr.r.','r..rr..r','.rr..rr.','........'],
  d56:['...kkkkk...','..kkkkkkk..','.kkkkkkkkk.','.kwwkwwkww.','.kwkwwwkwk.','.kwwwwwkwk.','.kkwwwwwkk.','..kwwwwwk..','...bbbbb...','..bbddbbb..','.bddwwwddb.','.bdwdwdwdb.','..bbdbdbb..','...b...b...','..kk...kk..']
};
const CHEST_SP=[
  ['..yyyy..','.yooooy.','yowwwwoy','yowkkwoy','yowwwwoy','.yooooy.','..yyyy..','........'],
  ['..yyyy..','.yooooy.','yo....oy','yo.kk.oy','yo....oy','.yooooy.','..yyyy..','..yyyy..'] // open
];
const BLD_SP={
  reactor:['.....w.....','....www....','...wkwkw...','..wwwwwww..','.wwbbbbbww.','wwbbuuubbww','wbbuuuuubbw','.wbbubuubw.','..wwbbbww..','...wbbbbw..','...ssssss...','..s......s..'],
  gen:['...yyyyyy...','..yoooooy..','.yo....oy.','.yowwwwoy.','.yobbbboy.','.yowrrwoy.','.yoooooy..','..yyyyyy...','...y..y....','..ss..ss...','.s......s..','ss......ss'],
  fac:['.sssssssss.','sswwwwwwwss','swbbbbbbbws','swbwwwwwbws','swbbbbbbbws','swbwwwwwbws','sswwwwwwwss','.sssssssss.','..s.s.s.s..','..s.....s..','.ss.....ss.','s.........s'],
  lab:['.....u.....','....uuu....','...uwwwu...','..uwwwwwu..','.uwwubuwwu.','uwwbbbbbwwu','.uwbbbbbwu.','..uwwwwwu..','...ssssss...','...s....s...','..ss....ss..','.s........s.'],
  tur:['......r.....','.....rrr....','....rwwwr...','...rrbbbrr...','...rbbbbbr...','....bbbbb....','....bbbbb....','.....bbb.....','.....sss.....','....s...s....','...ss...ss...','..s.......s..'],
  dome:['....sss....','...swwws...','..swwwwws..','.swwbbwws.','.swbbbbws.','.swbbbbws.','..swbbws..','...swws...','....sss....','....s.s....','...s...s...','..s.....s..'],
  dock:['.ggggggggg.','gwwwwwwwwwg','gwbbbbbbbwg','gwbwwwwwbwg','gwbbbbbbbwg','gwwwwwwwwwg','ggggggggggg','..g.....g..','..g.....g..','.gg.....gg.','g.........g','...........'],
  beacon:['.....y.....','....yuy....','...ywwwy...','..ywwwwwy..','.ywwubuwwy.','.ybbbbbbby.','..ybbbbby..','...ybbby...','....sss....','....s.s....','...ss.ss...','..s.....s..'],
  miner:['.ddddddddd.','dowowoowwod','dowwwwwwwod','dowooboowod','dowbbbbbwod','dowwwwwwwod','ddddddddddd','..d.....d..','..d.....d..','d.d.....d.d','.d.......d.','...........'],
  chest:['..yyyyyyy..','.yoooooooy.','yo.......oy','yowwwwwwwy','yooooooooy','yoyyyyyyoy','.yoooooy..','..yyyyyy...','...........','...........','...........','...........']
};

function drawPix(map,pal,cx,cy,z){
  if(!map||!map.length)return;
  const h=map.length,w=map[0].length;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const ch=map[j][i];if(!ch||ch==='.')continue;
    g.fillStyle=pal[ch]||CPAL[ch]||'#fff';
    g.fillRect(Math.round(cx-w*z/2+i*z),Math.round(cy-h*z/2+j*z),z,z);
  }
}

/* ===== UI ICONS (no emoji) ===== */
const ICO={
  coin:['.yyyy.','.ywwy.','.ywyy.','.ywwy.','.yyyy.','.y..y.'],
  gem:['..u..','.uwu.','uwwwu','.uwu.','..u..','.....'],
  world:['.bbbb.','.bwwb.','bwwwwb','bwwwwb','.bwwb.','.bbbb.'],
  star:['..y..','.ywy.','ywwwwy','.ywy.','y.y.y','.....'],
  sword:['...ww.','.w.w..','..w...','..w...','..o...','.o.o..'],
  tower:['..ccc..','.cwcwc.','cwwwwwc','.ccccc.','cc.c.cc','c..c..c'],
  swirl:['.u.u.u','u.uuu.u','.uuuuu.','.uuuuu.','u.uuu.u','.u.u.u'],
  shop:['.yyyyy.','.ywwwy.','yyyyyyy','y.y.y.y','y.y.y.y','y.....y'],
  chest:['.yyyyy.','yoooooy','yowwwoy','yoooooy','.yyyyy.','.......'],
  base:['.sssss.','swwwws','sbbbbs','swwwws','s.s.s.s','s.....s'],
  gear:['.w.w.w.','wwwwwww','.wwwww.','wwwwwww','.w.w.w.','.......'],
  scroll:['.aaaaa.','awwwwa','awawawa','awwwwa','.aaaaa.','.......'],
  online:['..gg..','.g..g.','g....g','.gggg.','......','......'],
  offline:['..rr..','.r..r.','r....r','.rrr..','......','......'],
  home:['..ww..','.wwww.','wwwwww','w.ww.w','w.ww.w','w....w'],
  rocket:['..ww..','.wbw.','wwwwww','.o..o.','o....o','......'],
  boom:['.y.y.y','yyyyyyy','.yoyoy.','yyyyyyy','.y.y.y','......'],
  shield:['.sssss.','swwwws','swwwws','.swws.','..ss..','......'],
  bomb:['..yy..','.kkkk.','kwwwwk','kwwwwk','.kkkk.','......'],
  pause:['.w..w.','.w..w.','.w..w.','.w..w.','.w..w.','......'],
  play:['.w....','www...','wwww..','www...','w.....','......'],
  friend:['..ww..','.wwww.','wwwwww','..ww..','.w..w.','w....w'],
  gift:['.ryryr.','yyyyyyy','ywwwwwy','yyyyyyy','.y...y.','......'],
  prest:['..yy..','.yppy.','yppppy','.yppy.','y....y','......'],
  event:['.p.p.p','ppppppp','.ppppp.','ppppppp','.p.p.p','......'],
  rank:['.yyyy.','ywwwwy','.yyyy.','..yy..','..yy..','..yy..'],
  set:['.cccc.','.cwwc.','ccwwcc','.cwwc.','.cccc.','......'],
  map:['.gggg.','.gwwg.','gwgwgw','.gwwg.','.gggg.','......'],
  sk:['.uuuu.','uwwwwu','uwuwuw','uwwwwu','.uuuu.','......'],
  module:['.oooo.','.owwo.','owowowo','.owwo.','.oooo.','......'],
  boss:['..rr..','.rwwr.','rwbbwr','rwwwwr','.rrrr.','r....r'],
  key:['..yy..','.ywwy.','..yy..','..y...','..y...','..yy..'],
  zoom:['.wwww.','.w..w.','w....w','.w..w.','.wwww.','......'],
  daily:['.yyyy.','.ywwy.','ywyywy','.ywwy.','.yyyy.','......'],
  arena:['.rrrr.','.rwwr.','rwbbwr','.rwwr.','.rrrr.','......']
};
function drawIco(name,cx,cy,z,pal){
  const m=ICO[name];if(!m)return;
  drawPix(m,pal||CPAL,cx,cy,z);
}
function iconBtn(x,y,w,h,ico,label,col,fn,zIco){
  panel(x,y,w,h,col);
  const hasLab=!!(label&&label.length);
  const cy=hasLab?y+h*0.38:y+h/2;
  drawIcon2D(ico,x+w/2,cy,1.2);
  if(hasLab)tx(label,x+w/2,y+h-14,Math.min(14,h*0.22),'#e8f0ff','center');
  hit(x,y,w,h,fn);
}
function currencyPill(x,y,ico,v){
  panel(x,y,110,34,'#6a8aff');
  drawIcon2D(ico,x+18,y+17,0.9);
  tx(''+v,x+68,y+18,17,'#fff','center');
}



function drawShipR(x,y,col){
  g.save();g.translate(x,y);
  const c=col||'#6ec8ff';
  // engine trail
  g.globalAlpha=0.35+Math.sin(T*12)*0.15;
  const trail=g.createLinearGradient(0,20,0,55);
  trail.addColorStop(0,'#ff9a40');trail.addColorStop(1,'rgba(255,80,0,0)');
  g.fillStyle=trail;g.beginPath();g.moveTo(-10,18);g.lineTo(0,55);g.lineTo(10,18);g.closePath();g.fill();
  g.globalAlpha=1;
  // shadow under
  g.fillStyle='rgba(0,0,0,0.25)';g.beginPath();g.ellipse(0,34,22,6,0,0,7);g.fill();
  // main hull
  g.shadowColor=c;g.shadowBlur=20;
  const hull=g.createLinearGradient(-20,0,20,0);
  hull.addColorStop(0,'#1a3a70');hull.addColorStop(0.5,c);hull.addColorStop(1,'#1a3a70');
  g.fillStyle=hull;
  g.beginPath();
  g.moveTo(0,-36);g.bezierCurveTo(14,-28,20,-10,18,8);
  g.lineTo(12,26);g.lineTo(0,32);g.lineTo(-12,26);g.lineTo(-18,8);
  g.bezierCurveTo(-20,-10,-14,-28,0,-36);g.closePath();g.fill();
  g.shadowBlur=0;
  // armor lines
  g.strokeStyle='rgba(255,255,255,0.25)';g.lineWidth=1.5;
  g.beginPath();g.moveTo(0,-30);g.lineTo(0,24);g.stroke();
  // cockpit glass
  const glass=g.createRadialGradient(-2,-12,1,0,-8,12);
  glass.addColorStop(0,'#ffffff');glass.addColorStop(0.4,'#a8f0ff');glass.addColorStop(1,'#2080c0');
  g.fillStyle=glass;g.beginPath();g.ellipse(0,-10,9,13,0,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,0.5)';g.lineWidth=1;g.stroke();
  // wings
  const wing=g.createLinearGradient(0,0,40,10);
  wing.addColorStop(0,c);wing.addColorStop(1,'#0a2048');
  g.fillStyle=wing;
  g.beginPath();g.moveTo(10,0);g.lineTo(42,22);g.lineTo(38,28);g.lineTo(12,16);g.closePath();g.fill();
  g.beginPath();g.moveTo(-10,0);g.lineTo(-42,22);g.lineTo(-38,28);g.lineTo(-12,16);g.closePath();g.fill();
  // wing glow edge
  g.strokeStyle='rgba(180,230,255,0.4)';g.lineWidth=1;
  g.beginPath();g.moveTo(10,0);g.lineTo(42,22);g.stroke();
  g.beginPath();g.moveTo(-10,0);g.lineTo(-42,22);g.stroke();
  // engines
  g.shadowColor='#ff5500';g.shadowBlur=16;
  const eng=g.createRadialGradient(0,0,1,0,0,8);
  eng.addColorStop(0,'#fff');eng.addColorStop(0.4,'#ffd080');eng.addColorStop(1,'#ff4020');
  g.fillStyle=eng;
  g.beginPath();g.ellipse(-8,28,6,10,0,0,7);g.fill();
  g.beginPath();g.ellipse(8,28,6,10,0,0,7);g.fill();
  g.shadowBlur=0;
  g.restore();
}
function drawEnemyR(x,y,ty,col,t){
  g.save();g.translate(x,y);const c=col||'#ff6a5a';const tt=t||0;
  g.shadowColor=c;g.shadowBlur=12;
  if(ty===0){ // scout
    const gr=g.createRadialGradient(-4,-6,2,0,0,18);
    gr.addColorStop(0,'#fff');gr.addColorStop(0.4,c);gr.addColorStop(1,'#400810');
    g.fillStyle=gr;g.beginPath();g.moveTo(0,-18);g.quadraticCurveTo(18,0,0,18);g.quadraticCurveTo(-18,0,0,-18);g.fill();
    g.fillStyle='rgba(255,255,255,0.8)';g.beginPath();g.arc(0,-4,3,0,7);g.fill();
  }else if(ty===1){ // fighter
    const gr=g.createLinearGradient(0,-20,0,16);
    gr.addColorStop(0,'#ffe0c0');gr.addColorStop(0.5,c);gr.addColorStop(1,'#501000');
    g.fillStyle=gr;g.beginPath();g.moveTo(0,-22);g.lineTo(16,-4);g.lineTo(20,14);g.lineTo(0,10);g.lineTo(-20,14);g.lineTo(-16,-4);g.closePath();g.fill();
    g.fillStyle='#ffe040';g.shadowColor='#ff0';g.shadowBlur=8;g.beginPath();g.arc(0,-2,4,0,7);g.fill();
  }else if(ty===2){ // tank
    g.fillStyle='#2a1010';g.beginPath();g.ellipse(0,4,26,16,0,0,7);g.fill();
    const gr=g.createRadialGradient(-6,-4,2,0,0,24);
    gr.addColorStop(0,'#ffb090');gr.addColorStop(0.5,c);gr.addColorStop(1,'#300');
    g.fillStyle=gr;g.beginPath();g.ellipse(0,0,22,15,0,0,7);g.fill();
    g.strokeStyle='rgba(255,220,180,0.45)';g.lineWidth=2;g.stroke();
    g.fillStyle='#ff4020';g.beginPath();g.arc(0,0,5,0,7);g.fill();
  }else if(ty===3){ // serpent
    for(let i=3;i>=0;i--){
      g.globalAlpha=0.95-i*0.15;
      const gr=g.createRadialGradient(0,0,1,0,0,10);
      gr.addColorStop(0,'#dff');gr.addColorStop(1,c);
      g.fillStyle=gr;
      g.beginPath();g.arc(Math.sin(tt*3.5+i*0.9)*7,i*8-14,10-i*1.4,0,7);g.fill();
    }
    g.globalAlpha=1;
  }else if(ty===4){ // drone
    const gr=g.createRadialGradient(-2,-2,1,0,0,14);
    gr.addColorStop(0,'#fff');gr.addColorStop(0.5,c);gr.addColorStop(1,'#102040');
    g.fillStyle=gr;g.beginPath();g.arc(0,0,12,0,7);g.fill();
    g.rotate(tt*2.5);
    g.strokeStyle='rgba(255,255,255,0.7)';g.lineWidth=2.5;
    g.beginPath();g.moveTo(-20,0);g.lineTo(20,0);g.moveTo(0,-20);g.lineTo(0,20);g.stroke();
    g.strokeStyle=c;g.lineWidth=1.5;
    g.beginPath();g.arc(0,0,17,0,7);g.stroke();
  }else{ // elite
    const gr=g.createRadialGradient(-4,-8,2,0,0,24);
    gr.addColorStop(0,'#fff0ff');gr.addColorStop(0.35,c);gr.addColorStop(1,'#200030');
    g.fillStyle=gr;
    g.beginPath();g.moveTo(0,-24);g.lineTo(16,-8);g.lineTo(20,12);g.lineTo(8,22);g.lineTo(-8,22);g.lineTo(-20,12);g.lineTo(-16,-8);g.closePath();g.fill();
    g.strokeStyle='rgba(255,200,255,0.5)';g.lineWidth=1.5;g.stroke();
    g.fillStyle='#ffe040';g.shadowBlur=10;g.beginPath();g.arc(0,0,6,0,7);g.fill();
  }
  g.shadowBlur=0;g.restore();
}
function drawBossR(x,y,t,c,type){
  g.save();g.translate(x,y);const s=1.55;const ty=type|0;const tt=t||0;const col=c||'#ff5a7a';
  g.shadowColor=col;g.shadowBlur=28;
  const core=g.createRadialGradient(-12,-12,4,0,0,70*s);
  core.addColorStop(0,'#ffffff');core.addColorStop(0.2,col);core.addColorStop(0.7,'#180820');core.addColorStop(1,'#000');
  g.fillStyle=core;g.strokeStyle=col;g.lineWidth=2.5;
  if(ty===1){
    for(let i=0;i<6;i++){const a=i*Math.PI/3+tt*.35;
      const cg=g.createLinearGradient(0,0,Math.cos(a)*80*s,Math.sin(a)*80*s);
      cg.addColorStop(0,'#fff');cg.addColorStop(1,col);g.fillStyle=cg;
      g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*78*s,Math.sin(a)*78*s);g.lineTo(Math.cos(a+.5)*42*s,Math.sin(a+.5)*42*s);g.closePath();g.fill();g.stroke()}
  }else if(ty===2){
    g.beginPath();g.ellipse(0,10*s,78*s,50*s,0,0,7);g.fill();g.stroke();
    for(const m of[-1,1]){g.beginPath();g.moveTo(m*30*s,-20*s);g.quadraticCurveTo(m*100*s,-60*s,m*70*s,24*s);g.closePath();g.fill();g.stroke()}
    // fire particles
    for(let i=0;i<5;i++){g.fillStyle='rgba(255,180,40,0.5)';g.beginPath();g.arc((Math.random()-0.5)*40*s,40*s+Math.random()*20,4,0,7);g.fill()}
  }else if(ty===3){
    g.beginPath();g.moveTo(0,-68*s);g.lineTo(58*s,22*s);g.lineTo(28*s,58*s);g.lineTo(-28*s,58*s);g.lineTo(-58*s,22*s);g.closePath();g.fill();g.stroke();
    g.strokeStyle='rgba(200,240,255,0.6)';g.lineWidth=1;g.beginPath();g.moveTo(0,-40*s);g.lineTo(0,40*s);g.stroke();
  }else if(ty===4){
    g.beginPath();g.arc(0,0,62*s,0,7);g.fill();g.stroke();
    g.globalCompositeOperation='destination-out';g.beginPath();g.arc(0,0,28*s,0,7);g.fill();
    g.globalCompositeOperation='source-over';
    g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(0,0,28*s,0,7);g.stroke();
  }else if(ty===5){
    g.beginPath();g.ellipse(0,22*s,52*s,36*s,0,0,7);g.fill();
    for(const ox of[-42,0,42]){
      g.beginPath();g.ellipse(ox*s,-42*s,18*s,30*s,0,0,7);g.fill();g.stroke();
      g.fillStyle='#fff';g.beginPath();g.arc(ox*s,-50*s,5,0,7);g.fill();g.fillStyle=core;
    }
  }else if(ty===6){
    g.beginPath();g.moveTo(0,-72*s);g.lineTo(52*s,0);g.lineTo(0,72*s);g.lineTo(-52*s,0);g.closePath();g.fill();g.stroke();
    g.strokeStyle='rgba(255,255,255,0.3)';g.beginPath();g.moveTo(0,-50*s);g.lineTo(0,50*s);g.moveTo(-36*s,0);g.lineTo(36*s,0);g.stroke();
  }else if(ty===7){
    g.fillRect(-62*s,-42*s,124*s,84*s);g.strokeRect(-62*s,-42*s,124*s,84*s);
    g.beginPath();g.arc(0,-42*s,26*s,Math.PI,0);g.fill();g.stroke();
    for(const ox of[-30,30]){g.fillStyle='rgba(255,40,40,0.8)';g.beginPath();g.arc(ox*s,0,8,0,7);g.fill()}
  }else if(ty===8){
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5+tt*0.8;
      g.beginPath();g.ellipse(Math.cos(a)*48*s,Math.sin(a)*48*s,22*s,14*s,a,0,7);g.fill();g.stroke()}
  }else{
    g.beginPath();g.arc(0,0,56*s,0,7);g.fill();g.stroke();
    for(let i=0;i<8;i++){const a=i*Math.PI/4+tt*.45;
      g.beginPath();g.ellipse(Math.cos(a)*72*s,Math.sin(a)*72*s,13*s,8*s,a,0,7);g.fill()}
  }
  // eye
  g.shadowBlur=0;
  g.fillStyle='#fff';g.beginPath();g.arc(0,0,11,0,7);g.fill();
  g.fillStyle='#ff1020';g.beginPath();g.arc(2,1,5,0,7);g.fill();
  g.fillStyle='#000';g.beginPath();g.arc(3,1,2,0,7);g.fill();
  g.restore();
}

function drawBuilding2D(id,x,y,sc){
  sc=sc||1;g.save();g.translate(x,y);g.scale(sc,sc);
  g.fillStyle='rgba(0,0,0,0.25)';g.beginPath();g.ellipse(0,28,26,8,0,0,7);g.fill();
  const styles={
    reactor:['#6a8aff','#c0d8ff'],gen:['#ff9a40','#ffe0a0'],fac:['#8a9aaa','#d0d8e0'],
    lab:['#b070ff','#e0c0ff'],tur:['#ff5a6a','#ffb0b8'],dome:['#5ad0ff','#c0f0ff'],
    dock:['#3ad86a','#b0ffc0'],beacon:['#ffd34a','#fff0b0'],miner:['#a08060','#e0d0b0'],chest:['#ffc030','#fff0a0']
  };
  const col=styles[id]||styles.gen;
  const gr=g.createLinearGradient(-20,-30,20,30);
  gr.addColorStop(0,col[1]);gr.addColorStop(1,col[0]);
  g.fillStyle=gr;g.strokeStyle='rgba(255,255,255,0.35)';g.lineWidth=1.5;
  if(id==='reactor'||id==='lab'||id==='beacon'){
    g.beginPath();g.moveTo(0,-36);g.lineTo(22,-8);g.lineTo(16,24);g.lineTo(-16,24);g.lineTo(-22,-8);g.closePath();g.fill();g.stroke();
    g.fillStyle='rgba(255,255,255,0.7)';g.beginPath();g.arc(0,-8,6,0,7);g.fill();
  }else if(id==='tur'){
    g.fillRect(-14,-8,28,28);g.strokeRect(-14,-8,28,28);
    g.beginPath();g.moveTo(-4,-8);g.lineTo(0,-32);g.lineTo(4,-8);g.closePath();g.fill();
  }else if(id==='dome'){
    g.beginPath();g.arc(0,8,26,Math.PI,0);g.lineTo(26,24);g.lineTo(-26,24);g.closePath();g.fill();g.stroke();
  }else if(id==='chest'){
    g.fillRect(-20,-12,40,28);g.strokeRect(-20,-12,40,28);
    g.fillStyle='#ffd34a';g.fillRect(-4,-4,8,12);
  }else{
    g.fillRect(-22,-20,44,40);g.strokeRect(-22,-20,44,40);
    g.fillStyle='rgba(0,0,0,0.2)';g.fillRect(-14,-12,12,10);g.fillRect(4,-12,12,10);
  }
  g.restore();
}
function drawIcon2D(name,x,y,sc){
  sc=sc||1;g.save();g.translate(x,y);g.scale(sc,sc);
  g.shadowColor='rgba(100,180,255,0.5)';g.shadowBlur=8;
  const map={
    world:'#4a9aff',star:'#ffd34a',sword:'#ff8a3a',tower:'#b070ff',swirl:'#c04aff',
    shop:'#3ad86a',chest:'#ffc030',module:'#ff8a3a',event:'#e0b0ff',friend:'#6ec8ff',
    boss:'#ff3a5a',daily:'#ffd34a',arena:'#ff5a7a',prest:'#ffd34a',sk:'#8ad0ff',rank:'#ffd34a',
    online:'#3ad86a',offline:'#889',home:'#4a7aff'
  };
  const c=map[name]||'#8ad0ff';
  const gr=g.createRadialGradient(-3,-3,1,0,0,14);
  gr.addColorStop(0,'#fff');gr.addColorStop(0.5,c);gr.addColorStop(1,'#102040');
  g.fillStyle=gr;g.beginPath();g.arc(0,0,13,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,0.45)';g.lineWidth=1.5;g.stroke();
  g.shadowBlur=0;
  // simple symbol
  g.fillStyle='#fff';g.font='bold 11px sans-serif';g.textAlign='center';g.textBaseline='middle';
  const sym={world:'W',star:'*',sword:'S',tower:'T',shop:'$',chest:'C',module:'M',event:'E',friend:'F',boss:'B',daily:'D',arena:'A',prest:'P',sk:'N',rank:'R',online:'•',offline:'○',home:'H',swirl:'~'}[name]||'•';
  g.fillText(sym,0,1);
  g.restore();
}


function drawBossPixel(x,y,t,c,type){
  g.save();g.translate(x,y);
  const s=4,col=c||'#ff5a7a';
  g.fillStyle=col;
  // body block
  g.fillRect(-12*s,-10*s,24*s,20*s);
  g.fillStyle='#1a1030';g.fillRect(-6*s,-4*s,12*s,8*s);
  g.fillStyle='#fff';g.fillRect(-3*s,-2*s,6*s,4*s);
  g.fillStyle='#ff2030';g.fillRect(-1*s,-1*s,3*s,2*s);
  // arms / crystals rotate by type
  g.fillStyle=col;
  const a=(t||0)*2;
  for(let i=0;i<4;i++){
    const ang=a+i*Math.PI/2;
    const bx=Math.cos(ang)*16*s,by=Math.sin(ang)*16*s;
    g.fillRect(bx-3*s,by-3*s,6*s,6*s);
  }
  // type accent
  g.fillStyle='#ffd34a';
  if((type|0)%3===0)g.fillRect(-2*s,-14*s,4*s,4*s);
  if((type|0)%3===1){g.fillRect(-14*s,-2*s,4*s,4*s);g.fillRect(10*s,-2*s,4*s,4*s)}
  g.restore();
}
function boss(x,y,t,c,type){
  if(drawSpr('boss',x,y,1.4+0.05*Math.sin((t||0)*2)))return;
  drawBossPixel(x,y,t,c,type);return;
  drawBossR(x,y,t,c,type);return;
  g.save();g.translate(x,y);const s=1.45;const ty=type|0;
  g.fillStyle='#12163a';g.strokeStyle=c;g.lineWidth=3;g.shadowColor=c;g.shadowBlur=14;
  if(ty===1){ // crystal
    for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.4;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*70*s,Math.sin(a)*70*s);g.lineTo(Math.cos(a+.4)*40*s,Math.sin(a+.4)*40*s);g.closePath();g.fill();g.stroke()}
  }else if(ty===2){ // fire colossus - bulkier
    g.beginPath();g.ellipse(0,10*s,70*s,45*s,0,0,7);g.fill();g.stroke();
    for(const m of[-1,1]){g.beginPath();g.moveTo(m*30*s,-20*s);g.lineTo(m*90*s,-50*s);g.lineTo(m*70*s,20*s);g.closePath();g.fill();g.stroke()}
  }else if(ty===3){ // ice
    g.beginPath();g.moveTo(0,-60*s);g.lineTo(55*s,20*s);g.lineTo(25*s,55*s);g.lineTo(-25*s,55*s);g.lineTo(-55*s,20*s);g.closePath();g.fill();g.stroke();
  }else if(ty===6){ // archon - diamond
    g.beginPath();g.moveTo(0,-65*s);g.lineTo(55*s,0);g.lineTo(0,65*s);g.lineTo(-55*s,0);g.closePath();g.fill();g.stroke();
    g.beginPath();g.arc(0,0,22*s,0,7);g.stroke();
  }else if(ty===7){ // plasma ring
    g.beginPath();g.arc(0,0,55*s,0,7);g.fill();g.stroke();
    for(let i=0;i<5;i++){const a=t*2+i*1.25;g.beginPath();g.arc(Math.cos(a)*40*s,Math.sin(a)*40*s,10*s,0,7);g.fill()}
  }else if(ty===8){ // abyss void
    g.beginPath();g.arc(0,0,60*s,0,7);g.fill();g.stroke();
    g.fillStyle='#050818';g.beginPath();g.arc(0,0,28*s,0,7);g.fill();
  }else{ // default winged
    for(const m of[-1,1]){g.beginPath();g.moveTo(m*40*s,-20*s);g.lineTo(m*110*s,-35*s);g.lineTo(m*95*s,25*s);g.lineTo(m*50*s,40*s);g.closePath();g.fill();g.stroke()}
    g.beginPath();g.moveTo(-50*s,-30*s);g.lineTo(50*s,-30*s);g.lineTo(60*s,20*s);g.lineTo(0,55*s);g.lineTo(-60*s,20*s);g.closePath();g.fill();g.stroke();
  }
  g.shadowBlur=0;
  const p=.55+.45*Math.sin(t*5),q=g.createRadialGradient(0,0,0,0,0,26*s);
  q.addColorStop(0,'#fff');q.addColorStop(.4,c);q.addColorStop(1,'rgba(0,0,0,0)');
  g.globalAlpha=p;g.fillStyle=q;g.beginPath();g.arc(0,0,28*s,0,7);g.fill();g.globalAlpha=1;
  // type label hint
  if(ty===4){g.strokeStyle='#fff';g.globalAlpha=.35;g.beginPath();g.arc(0,0,75*s,0,7);g.stroke();g.globalAlpha=1}
  g.restore();
}


function pickAvatar(){
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
  inp.onchange=()=>{
    const f=inp.files&&inp.files[0];if(!f)return;
    if(f.size>2.5e6){toast('Файл слишком большой');return}
    const rd=new FileReader();
    rd.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const sz=128,c=document.createElement('canvas');c.width=sz;c.height=sz;
        const x=c.getContext('2d');
        const sc=Math.max(sz/img.width,sz/img.height);
        const w=img.width*sc,h=img.height*sc;
        x.drawImage(img,(sz-w)/2,(sz-h)/2,w,h);
        D.prof.avatar=c.toDataURL('image/jpeg',0.7);save();toast('Фото установлено');beep(700,.1);
      };
      img.src=rd.result;
    };
    rd.readAsDataURL(f);
  };
  inp.click();
}
const avatarImg=new Image();let avatarReady=false;
function loadAvatar(){
  if(D.prof&&D.prof.avatar){avatarImg.onload=()=>{avatarReady=true};avatarImg.src=D.prof.avatar;avatarReady=false}
  else avatarReady=false;
}
loadAvatar();
function drawAvatar(cx,cy,r){
  g.save();
  g.beginPath();g.arc(cx,cy,r,0,7);g.closePath();g.clip();
  if(avatarReady&&D.prof.avatar){g.drawImage(avatarImg,cx-r,cy-r,r*2,r*2)}
  else{g.fillStyle='#0a1a50';g.fillRect(cx-r,cy-r,r*2,r*2);spr(ROB,RP,cx,cy,Math.max(4,r/6))}
  g.restore();
  g.beginPath();g.arc(cx,cy,r,0,7);g.strokeStyle='#6a8aff';g.lineWidth=2.5;g.stroke();
}

function back(){panel(10,10,70,60,'#4a7aff');if(typeof drawIco==='function')drawIco('home',45,40,5);else drawIcon2D('home',45,40,1.4);hit(10,10,70,60,()=>scr='home')}

/* ===== SCREENS ===== */

function drawCoinIcon(x,y,s){
  s=s||1;g.save();g.translate(x,y);g.scale(s,s);
  g.fillStyle='#c09020';g.beginPath();g.arc(0,0,9,0,7);g.fill();
  g.fillStyle='#ffd34a';g.beginPath();g.arc(0,0,7,0,7);g.fill();
  g.fillStyle='#fff8c0';g.fillRect(-2,-4,4,8);
  g.restore();
}
function drawGemIcon(x,y,s){
  s=s||1;g.save();g.translate(x,y);g.scale(s,s);
  g.fillStyle='#2a80c0';
  g.beginPath();g.moveTo(0,-9);g.lineTo(8,-2);g.lineTo(5,8);g.lineTo(-5,8);g.lineTo(-8,-2);g.closePath();g.fill();
  g.fillStyle='#7fd0ff';g.beginPath();g.moveTo(0,-7);g.lineTo(5,-1);g.lineTo(0,2);g.closePath();g.fill();
  g.fillStyle='#e0f8ff';g.fillRect(-1,-3,2,3);
  g.restore();
}

// QoL helpers
function qolDailyCode(){
  const day=new Date().toDateString();
  if(D.codeDay===day){toast('Код уже введён сегодня');return}
  const code=(prompt('Промокод')||'').trim().toUpperCase();
  const codes={ORBIT:()=>{D.coins+=500;D.gems+=10},PIXEL:()=>{D.chests=(D.chests||0)+3},D56:()=>{D.chars.d56=(D.chars.d56||0)+1},SEASON:()=>{D.season.xp=(D.season.xp||0)+500},RAID:()=>{refreshRaidKeys();D.eventRaid.keys=3}};
  if(!codes[code]){toast('Неверный код');return}
  codes[code]();D.codeDay=day;save();toast('Код принят: '+code);
}
function home(){
  refreshRaidKeys();
  if(D.banned){bg(0,0);tx('Аккаунт заблокирован',270,H/2,22,'#ff5a7a','center');return}
  try{claimAdminGrants(true)}catch(e){}
  bg(0,10);
  try{if(SPR.bg_stars&&SPR.bg_stars.complete&&SPR.bg_stars.naturalWidth){g.globalAlpha=0.3;g.imageSmoothingEnabled=false;for(let yy=0;yy<H;yy+=256)for(let xx=0;xx<540;xx+=256)g.drawImage(SPR.bg_stars,xx,yy);g.globalAlpha=1}}catch(e){}

  // header
  panel(16,12,508,72,'#4a7aff');
  if(!drawSpr('ship',52,48,0.55))spr(SHIP,SPAL,52,48,2.5);
  tx('PIXEL ORBIT',200,38,22,'#ffd34a','center');
  tx('10 миров · 25 уровней',200,58,12,'#9ec9ff','center');
  drawCoinIcon(360,36,1.15);tx(fmtN(D.coins),400,40,14,'#ffd34a','center');
  drawGemIcon(440,36,1.15);tx(fmtN(D.gems),480,40,14,'#7fd0ff','center');

  // profile row
  panel(16,96,508,56,'#2a5080');
  drawAvatar(48,124,22);hit(16,96,64,56,()=>scr='profile');
  tx(D.prof.name||'Пилот',90,116,16);
  tx('Ур.'+D.lv+' · XP '+(D.xp|0),90,136,12,'#ffd34a');
  const O=window.POOnline,on=!!(O&&O.session);
  if(!drawIcoSpr('online',500,124,0.9)){g.fillStyle=on?'#3ad86a':'#667';g.beginPath();g.arc(500,124,7,0,7);g.fill()}
  hit(470,100,50,48,()=>scr='online');

  // === FEWER BUTTONS ===
  // 1 big play
  bigCard(20,168,500,88,'play','ИГРАТЬ','Кампания · продолжить путь','#4a9aff',()=>scr='map');

  // 2 modes row
  medCard(20,270,160,78,'endless','Режимы','∞ Башня Арена','#ff8a3a',()=>scr='modes');
  medCard(190,270,160,78,'chest','Герои','сундуки · слоты','#3ad86a',()=>scr='chests');
  medCard(360,270,160,78,'event','Ивент','рейд · лавка','#c04aff',()=>scr='event');

  // 3 social / progress
  medCard(20,362,160,78,'season','Сезон','пропуск · Д-56','#ffd34a',()=>scr='season');
  medCard(190,362,160,78,'clan','Социальное','клан · друзья','#5ad0ff',()=>scr='social');
  medCard(360,362,160,78,'set','Ещё','база · магазин · …','#8a9aaa',()=>scr='more');

  // bottom status only
  panel(16,H-78,508,56,'#1a3050');
  tx('🔑 '+(D.eventRaid&&D.eventRaid.keys|0)+'/3   ·   ✦ '+(D.eventCur|0)+'   ·   📦 '+(D.chests|0)+'   ·   серия '+(D.dailyBox&&D.dailyBox.streak||0),270,H-48,13,'#cfe0ff','center');
}
function bigCard(x,y,w,h,ico,title,sub,col,fn){
  rr(x,y,w,h,18);
  g.fillStyle='rgba(12,22,50,0.95)';g.fill();
  g.strokeStyle=col;g.lineWidth=2.5;g.shadowColor=col;g.shadowBlur=14;g.stroke();g.shadowBlur=0;
  g.fillStyle=col;g.globalAlpha=0.15;g.fillRect(x+2,y+2,w-4,h-4);g.globalAlpha=1;
  if(!drawIcoSpr(ico,x+48,y+h/2,1.4)){g.fillStyle=col;g.beginPath();g.arc(x+48,y+h/2,22,0,7);g.fill()}
  g.textAlign='left';g.textBaseline='middle';
  g.fillStyle='#fff';g.font='bold 22px system-ui,sans-serif';g.fillText(title,x+90,y+h/2-10);
  g.fillStyle='rgba(200,220,255,0.75)';g.font='13px system-ui,sans-serif';g.fillText(sub,x+90,y+h/2+14);
  btns.push({x,y,w,h,fn});
}
function medCard(x,y,w,h,ico,title,sub,col,fn){
  rr(x,y,w,h,16);
  g.fillStyle='rgba(10,18,42,0.94)';g.fill();
  g.strokeStyle=col;g.lineWidth=2;g.shadowColor=col;g.shadowBlur=10;g.stroke();g.shadowBlur=0;
  if(!drawIcoSpr(ico,x+w/2,y+28,1.1)){g.fillStyle=col;g.beginPath();g.arc(x+w/2,y+26,14,0,7);g.fill()}
  g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#fff';g.font='bold 14px system-ui,sans-serif';g.fillText(title,x+w/2,y+h-28);
  g.fillStyle='rgba(180,200,230,0.7)';g.font='10px system-ui,sans-serif';g.fillText(sub,x+w/2,y+h-12);
  btns.push({x,y,w,h,fn});
}
function modes(){
  bg(2,8);back();tx('Режимы',270,40,26,'#fff','center');
  bigCard(30,120,480,80,'endless','Бесконечный','выживание без конца','#ff8a3a',()=>go(0,0,1));
  bigCard(30,220,480,80,'tower','Башня','10 этажей · ежедневно','#b070ff',()=>scr='tower');
  bigCard(30,320,480,80,'arena','Арена','5 жёстких волн','#ff5a7a',()=>scr='arena');
  bigCard(30,420,480,80,'play','Кампания','10×25 уровней','#4a9aff',()=>scr='map');
}
function social(){
  bg(1,8);back();tx('Социальное',270,40,26,'#fff','center');
  bigCard(30,120,480,80,'friend','Друзья / Онлайн','вход · заявки · профиль','#7fb7ff',()=>{const O=window.POOnline;scr=(O&&O.session)?'friends':'online'});
  bigCard(30,220,480,80,'clan','Клан','код · рейд-босс','#5ad0ff',()=>scr='clan');
  bigCard(30,320,480,80,'online','Рейд базы','атака по коду','#ff8a3a',()=>scr='baseRaid');
  bigCard(30,420,480,80,'season','Топ недели','мировой босс','#ffd34a',()=>scr='weeklyBoss');
}
function more(){
  bg(3,8);back();tx('Ещё',270,40,26,'#fff','center');
  bigCard(30,100,480,72,'shop','Магазин','монеты · гемы · навыки','#4a7aff',()=>scr='shop');
  bigCard(30,186,480,72,'set','Модули','синергии оружия','#ff8a3a',()=>scr='modules');
  bigCard(30,272,480,72,'tower','База / Королевство','здания острова','#6a8aff',()=>scr='station');
  bigCard(30,358,480,72,'chest','Ежедневки','награды · серия','#ffc030',()=>scr='daily');
  bigCard(30,444,480,72,'event','Музыка','свой плейлист','#b070ff',()=>scr='music');
  bigCard(30,530,480,72,'set','Настройки','админ · промокод','#889',()=>scr='set');
}
function fmtN(n){n=n|0;return n>9999?(Math.floor(n/1000)+'k'):(''+n)}
let hubNode=null;let stationZoom=1.15;
const NP=()=>{
  const a=[];
  // vertical scrollable path: 5 columns x 5 rows
  for(let i=0;i<STAGES_PER_WORLD;i++){
    const row=Math.floor(i/5),col=i%5;
    const x=70+col*100+(row%2?20:0);
    const y=140+row*95;
    a.push([x,y]);
  }
  return a;
};
function map(){
  bg(wd%10,6);back();
  panel(90,8,440,52,'#4a7aff');tx('Кампания · 10 миров × 25 ур.',270,32,16,'#fff','center');
  panel(20,68,500,44,'#4a7aff');
  tx('◀',50,90,22,'#fff','center');tx('▶',490,90,22,'#fff','center');
  tx('Мир '+(wd+1)+'/10: '+WN[wd],270,90,17,'#fff','center');
  hit(20,68,100,44,()=>{wd=(wd+9)%10;sel=0});hit(420,68,100,44,()=>{wd=(wd+1)%10;sel=0});

  // path lines
  const nodes=NP();
  g.strokeStyle='rgba(120,180,255,0.35)';g.lineWidth=3;
  for(let i=0;i<nodes.length-1;i++){
    g.beginPath();g.moveTo(nodes[i][0],nodes[i][1]);g.lineTo(nodes[i+1][0],nodes[i+1][1]);g.stroke();
  }
  nodes.forEach((p,i)=>{
    const ok=unlocked(wd,i),st=stars[key(wd,i)]||0;
    const isBoss=(i===STAGES_PER_WORLD-1)||((i+1)%5===0);
    const isMini=(i+1)%5===0 && i!==STAGES_PER_WORLD-1;
    // realistic node
    const r=isBoss?28:22;
    g.save();
    g.shadowColor=ok?(isBoss?'#ff5a7a':'#4a9aff'):'#000';g.shadowBlur=ok?12:0;
    const grd=g.createRadialGradient(p[0]-4,p[1]-4,2,p[0],p[1],r);
    if(!ok){grd.addColorStop(0,'#3a3a50');grd.addColorStop(1,'#1a1a28')}
    else if(isBoss){grd.addColorStop(0,'#ff8a9a');grd.addColorStop(1,'#a02040')}
    else if(isMini){grd.addColorStop(0,'#ffd34a');grd.addColorStop(1,'#c08020')}
    else{grd.addColorStop(0,'#8ad0ff');grd.addColorStop(1,'#2a5aaa')}
    g.fillStyle=grd;g.beginPath();g.arc(p[0],p[1],r,0,7);g.fill();
    g.shadowBlur=0;g.strokeStyle='rgba(255,255,255,0.4)';g.lineWidth=2;g.stroke();
    g.restore();
    tx(''+(i+1),p[0],p[1]-2,isBoss?14:13,'#fff','center');
    if(st)tx('★'.repeat(st),p[0],p[1]+16,10,'#ffd34a','center');
    if(ok)hit(p[0]-r,p[1]-r,r*2,r*2,()=>{sel=i;go(wd,i,0,0)});
  });
  // legend
  panel(20,H-70,500,50,'#2a4070');
  tx('Синий: уровень  ·  Жёлтый: мини-босс  ·  Красный: босс мира',270,H-42,12,'#cfe0ff','center');
}

function shop(){
  bg(1,6);back();tx('Магазин',270,40,28,'#fff','center');tx(''+D.coins+'  *'+D.gems,520,90,18,'#fff','right');
  const rows=[
    ['Урон','Ур.'+D.ud,60+D.ud*55,()=>D.ud++],
    ['Корпус','Ур.'+D.uh,60+D.uh*55,()=>D.uh++],
    ['Ракеты +3','x'+D.sk.m,55,()=>D.sk.m+=3],
    ['Нова +3','x'+D.sk.n,65,()=>D.sk.n+=3],
    ['Щит +3','x'+D.sk.s,65,()=>D.sk.s+=3],
    ['Бомба +2','x'+D.sk.b,90,()=>D.sk.b+=2]
  ];
  rows.forEach((r,i)=>{
    const y=115+i*90;
    panel(20,y,500,78,'#4a7aff');tx(r[0],40,y+24,22);tx(r[1],40,y+52,16,'#9ec9ff');
    btn(350,y+12,150,54,''+r[2],'#ffc030',()=>{if(D.coins>=r[2]){D.coins-=r[2];r[3]();save();beep(700,.1)}else toast('Не хватает монет')},18);
  });
}

/* ===== CHESTS + CHARACTERS ===== */
function openChest(premium){
  if(chestAnim)return;
  if(premium){
    if(D.gems<CHEST_COST.gems){toast('Нужно '+CHEST_COST.gems+'G');return}
    D.gems-=CHEST_COST.gems;
  }else{
    if((D.chests||0)<1){
      if(D.coins<CHEST_COST.coins){toast('Нужен сундук или '+CHEST_COST.coins+'');return}
      D.coins-=CHEST_COST.coins;
    }else D.chests--;
  }
  const ch=rollChar(premium);
  D.chars[ch.id]=(D.chars[ch.id]||0)+1;
  D.st.opened=(D.st.opened||0)+1;
  track('chest');
  // slot reel of all char ids then land on winner
  const reel=CHARS.map(c=>c.id);
  for(let i=0;i<12;i++)reel.push(CHARS[Math.floor(Math.random()*CHARS.length)].id);
  reel.push(ch.id,ch.id,ch.id);
  chestAnim={t:0,phase:'spin',char:ch,reel,idx:0,speed:0.08,dur:3.5};
  beep(200,.12,.05);save();
}

function chests(){
  bg(2,6);back();tx('Герои и сундуки',270,38,24,'#ffd34a','center');
  tx(''+(D.chests||0)+'  '+D.coins+'  *'+D.gems,270,68,14,'#9ec9ff','center');

  // pixel chests buttons
  panel(40,90,200,90,'#4a7aff');
  drawPix(CHEST_SP[0],CPAL,140,125,5);
  tx('Обычный',140,165,14,'#fff','center');
  hit(40,90,200,90,()=>openChest(false));
  panel(300,90,200,90,'#b070ff');
  drawPix(CHEST_SP[0],CPAL,400,125,5);
  tx('Премиум *'+CHEST_COST.gems,400,165,13,'#fff','center');
  hit(300,90,200,90,()=>openChest(true));

  tx('Компаньоны:',30,200,14,'#ffd34a');
  for(let i=0;i<2;i++){
    const id=D.equip[i],c=id?CHARS.find(x=>x.id===id):null,x=30+i*255;
    panel(x,215,240,70,c?RARITY_COL[c.rarity]:'#334');
    if(c&&CSPR[c.id])drawPix(CSPR[c.id],CPAL,x+36,250,3.5);
    if(c){tx(c.name,x+90,240,15);tx(ROLE_NAME[c.role]+' ★'+charStars(c.id),x+90,265,12,'#cfe0ff')}
    else tx('Нет героя',x+120,250,13,'#556','center');
    hit(x,215,240,70,()=>{if(c){D.equip[i]=null;save()}});
  }
  btn(30,300,480,44,'Авто-лучшие','#3ad86a',()=>{
    const ranked=CHARS.filter(c=>(D.chars[c.id]||0)>0).map(c=>{
      const b=c.bonus||{},st=charStars(c.id);
      return {id:c.id,score:(b.dmg||0)*2+(b.hp||0)*1.5+(b.fire||0)+(b.skill||0)+st*.1};
    }).sort((a,b)=>b.score-a.score);
    D.equip=[ranked[0]?ranked[0].id:null,ranked[1]?ranked[1].id:null];save();toast('Готово');
  },16);

  let y=360,col=0;
  CHARS.forEach(ch=>{
    const owned=D.chars[ch.id]||0,x=22+col*172;
    panel(x,y,162,78,owned?RARITY_COL[ch.rarity]:'#222a44');
    if(owned){if(!(SPR[ch.id]&&drawSpr(ch.id,x+36,y+38,0.85))&&CSPR[ch.id])drawPix(CSPR[ch.id],CPAL,x+36,y+38,4)}
    else if(!owned){g.globalAlpha=.35;drawPix(CSPR[ch.id]||CSPR.spark,CPAL,x+36,y+38,4);g.globalAlpha=1}
    tx(owned?ch.name:'???',x+95,y+28,12,owned?'#fff':'#556','center');
    if(owned)tx('*'+charStars(ch.id),x+95,y+52,12,RARITY_COL[ch.rarity],'center');
    if(owned)hit(x,y,162,78,()=>{
      if(D.equip.includes(ch.id)){toast('Уже экип.');return}
      let s=D.equip.indexOf(null);if(s<0)s=0;D.equip[s]=ch.id;save();toast(ch.name);
    });
    col++;if(col>=3){col=0;y+=86}
  });

  // SLOT MACHINE OVERLAY
  if(chestAnim){
    chestAnim.t+=0.016;
    const t=chestAnim.t,ch=chestAnim.char;
    g.fillStyle='rgba(2,4,18,.9)';g.fillRect(0,0,540,H);
    // chest
    drawPix(t>1.2?CHEST_SP[1]:CHEST_SP[0],CPAL,270,H/2-120,8);
    if(chestAnim.phase==='spin'||t<2.4){
      // spinning silhouettes
      chestAnim.idx+=chestAnim.speed*(1+t*2);
      const ids=chestAnim.reel;
      const center=Math.floor(chestAnim.idx)%ids.length;
      for(let k=-2;k<=2;k++){
        const id=ids[(center+k+ids.length*10)%ids.length];
        const yy=H/2-20+k*70;
        const alpha=k===0?1:0.35;
        g.globalAlpha=alpha;
        if(k===0&&t>2.0){
          drawPix(CSPR[ch.id]||CSPR.spark,CPAL,270,yy,6);
        }else{
          // silhouette black
          const map=CSPR[id]||CSPR.spark;
          for(let j=0;j<map.length;j++)for(let i=0;i<map[j].length;i++){
            if(map[j][i]!=='.'){g.fillStyle='#0a0a12';g.fillRect(270-map[j].length*2.5+i*5,yy-map.length*2.5+j*5,5,5)}
          }
        }
        g.globalAlpha=1;
      }
      // window frame
      panel(140,H/2-55,260,110,'#ffd34a','rgba(10,14,40,.3)');
      if(t>0.1&&(t*15|0)!==((t-0.016)*15|0))beep(80+center*3,.02,.03);
      if(t>2.4){chestAnim.phase='show';beep(600,.2,.08);if(ch.rarity>=3)beep(900,.25,.06)}
    }
    if(t>=2.4){
      tx(RARITY_NAME[ch.rarity],270,H/2+90,20,RARITY_COL[ch.rarity],'center');
      tx(ch.name,270,H/2+120,26,'#fff','center');
      tx(ROLE_NAME[ch.role]+' *'+charStars(ch.id),270,H/2+148,14,'#cfe0ff','center');
      tx(ch.desc,270,H/2+172,13,'#9ec9ff','center');
      if(t>3.0){tx('нажми',270,H/2+200,14,'#667','center');hit(0,0,540,H,()=>{chestAnim=null})}
    }
    if(t>chestAnim.dur+0.5)chestAnim=null;
  }
}

function station(){
  // Kingdom-style pixel island map
  const gr=g.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,'#5ec8ff');gr.addColorStop(0.45,'#7ec8ff');gr.addColorStop(1,'#1a3a6a');
  g.fillStyle=gr;g.fillRect(0,0,540,H);
  // clouds
  g.globalAlpha=0.35;
  for(const c of[[80,60,50],[400,40,60],[200,100,40],[480,120,45]]){
    g.fillStyle='#fff';g.beginPath();g.ellipse(c[0]+stationCam.x*0.2,c[1],c[2],c[2]*0.45,0,0,7);g.fill();
  }
  g.globalAlpha=1;

  const cx=270+(stationCam.x||0), cy=380+(stationCam.y||0);

  // floating island layers (pixel steps)
  function island(ox,oy,rx,ry,col){
    g.fillStyle=col;
    g.beginPath();g.ellipse(ox,oy,rx,ry,0,0,7);g.fill();
  }
  island(cx,cy+70,210,50,'#3d6b2e');
  island(cx,cy+55,200,48,'#4a8a3a');
  island(cx,cy+40,190,45,'#5aad48');
  // dirt cliff under
  g.fillStyle='#6b4a2e';
  g.beginPath();g.moveTo(cx-180,cy+45);g.lineTo(cx-160,cy+140);g.lineTo(cx+160,cy+140);g.lineTo(cx+180,cy+45);g.closePath();g.fill();
  g.fillStyle='#4a3218';
  g.beginPath();g.moveTo(cx-150,cy+140);g.lineTo(cx-100,cy+200);g.lineTo(cx+100,cy+200);g.lineTo(cx+150,cy+140);g.closePath();g.fill();
  // waterfall
  g.fillStyle='#7fd0ff';g.globalAlpha=0.55;
  for(let i=0;i<4;i++)g.fillRect(cx-170+Math.sin(T+i)*3,cy+50+i*30,12,32);
  g.globalAlpha=1;

  // paths (stone)
  g.strokeStyle='#c4b49a';g.lineWidth=6;g.lineCap='round';
  g.beginPath();g.moveTo(cx,cy-20);g.lineTo(cx-90,cy+10);g.lineTo(cx-120,cy+50);g.stroke();
  g.beginPath();g.moveTo(cx,cy-20);g.lineTo(cx+100,cy+5);g.lineTo(cx+130,cy+55);g.stroke();
  g.beginPath();g.moveTo(cx,cy-20);g.lineTo(cx,cy+80);g.stroke();

  // trees
  function tree(tx,ty){
    g.fillStyle='#2d5a1e';g.fillRect(tx-2,ty,5,12);
    g.fillStyle='#3d8a2e';g.beginPath();g.arc(tx,ty-4,10,0,7);g.fill();
    g.fillStyle='#4aaa3a';g.beginPath();g.arc(tx-4,ty-8,7,0,7);g.fill();
  }
  [[-150,20],[-160,60],[150,30],[160,70],[-40,90],[50,95],[-130,-10],[140,-5]].forEach(t=>tree(cx+t[0],cy+t[1]));

  // building layout on island (fixed positions relative to center)
  const layout=[
    {id:'reactor',x:0,y:-90,label:'Цитадель',key:true},
    {id:'gen',x:-110,y:-20,label:'Кузница'},
    {id:'fac',x:110,y:-15,label:'Мастерская'},
    {id:'lab',x:-100,y:50,label:'Башня магов'},
    {id:'tur',x:105,y:55,label:'Стражевая'},
    {id:'dome',x:-40,y:20,label:'Щит'},
    {id:'dock',x:45,y:25,label:'Лазарет'},
    {id:'beacon',x:-55,y:-50,label:'Святилище'},
    {id:'miner',x:60,y:-55,label:'Шахта'},
    {id:'chest',x:0,y:70,label:'Хранилище'}
  ];

  // draw buildings back-to-front by y
  const sorted=layout.slice().sort((a,b)=>a.y-b.y);
  sorted.forEach((b,idx)=>{
    const lv=bldLvl(b.id);
    const unlocked=lv>0||b.key;
    const px=cx+b.x, py=cy+b.y;
    const bob=Math.sin(T*2+idx)*2;
    // shadow
    g.fillStyle='rgba(0,0,0,0.25)';g.beginPath();g.ellipse(px,py+22,22,8,0,0,7);g.fill();
    if(unlocked){
      const sp=BLD_SP[b.id]||BLD_SP.gen;
      drawPix(sp,CPAL,px,py+bob,6);
      // level badge
      panel(px-18,py+18,36,16,'#ffd34a','rgba(20,30,50,.9)');
      tx((b.key?'HQ':'Lv')+(lv||1),px,py+27,11,'#fff','center');
    }else{
      // locked silhouette
      g.globalAlpha=0.45;
      const sp=BLD_SP[b.id]||BLD_SP.gen;
      drawPix(BLD_SP[b.id]||BLD_SP.gen,CPAL,px,py,5);
      g.globalAlpha=1;
      // lock
      g.fillStyle='#1a1a2e';g.fillRect(px-8,py-6,16,14);
      g.fillStyle='#ffd34a';g.fillRect(px-5,py-10,10,6);
      g.fillStyle='#5a5a7a';g.fillRect(px-3,py-2,6,6);
    }
    // label plate
    const lab=b.label;
    panel(px-48,py+36,96,20,unlocked?'#4a7aff':'#445','rgba(10,20,40,.85)');
    tx(lab,px,py+47,11,unlocked?'#fff':'#99a','center');
    hit(px-40,py-30,80,70,()=>{
      stationSel=layout.indexOf(b);
      stationBuild=null;
      if(!unlocked){
        const def=BLD.find(x=>x.id===b.id);
        if(def&&D.coins>=def.c){
          // offer build
          stationBuild=b.id;
          toast('Построить: '+def.n+' за '+def.c);
        }else toast('Нужно '+((BLD.find(x=>x.id===b.id)||{}).c||'?')+' монет');
      }else toast(b.label+(lv?(' Lv'+lv):''));
    });
  });

  // top UI
  panel(10,8,70,54,'#4a7aff');if(typeof drawIco==='function')drawIco('home',45,35,5);else drawIcon2D('home',45,35,1.4);hit(10,8,70,54,()=>scr='home');
  panel(90,8,360,54,'#4a7aff');tx('Королевство Орбиты',270,28,18,'#fff','center');tx('Свайп — карта  ·  тап — здание',270,48,12,'#9ec9ff','center');
  currencyPill(420,12,'coin',D.coins);

  // bottom action for selected
  const sel=stationSel>=0?layout[stationSel]:null;
  if(sel){
    const def=BLD.find(x=>x.id===sel.id);const lv=bldLvl(sel.id);
    const cost=Math.floor((def?def.c:100)*(1+lv*0.65));
    panel(20,H-120,500,100,'#4a7aff');
    tx(sel.label+(lv?('  Ур.'+lv):'  (не построено)'),40,H-95,16);
    tx(def?def.d:'',40,H-72,13,'#9ec9ff');
    if(lv>0&&lv<(def?def.max:1)){
      btn(300,H-100,200,55,'Улучшить '+cost,'#ffc030',()=>{
        if(D.coins<cost){toast('Мало монет');return}
        D.coins-=cost;D.bld[sel.id]=(D.bld[sel.id]||0)+1;D.st.built=(D.st.built||0)+1;track('build');save();beep(700,.12);toast('Улучшено');
      },15);
    }else if(lv===0){
      btn(300,H-100,200,55,'Построить '+ (def?def.c:0),'#3ad86a',()=>{
        const c=def.c;if(D.coins<c){toast('Мало монет');return}
        D.coins-=c;D.bld[sel.id]=1;
        if(!D.base.some(b=>b.id===sel.id))D.base.push({id:sel.id,x:0,y:0});
        D.st.built=(D.st.built||0)+1;track('build');save();beep(660,.1);toast('Построено');
      },15);
    }else tx('Макс. уровень',400,H-72,14,'#3ad86a','center');
  }else{
    panel(20,H-80,500,60,'#4a7aff');
    tx('Выбери здание на острове',270,H-50,15,'#cfe0ff','center');
  }
}
let stationCam={x:0,y:0},stationBuild=null,stationSel=-1;

function contracts(){
  bg(2,6);back();tx('Контракты',270,40,26,'#fff','center');
  refreshContracts();
  btn(360,15,160,40,'Все','#ffc030',()=>{
    const C=D.contracts;let n=0;
    ['daily','weekly','monthly'].forEach(g=>{(C[g]||[]).forEach(q=>{if(q.done&&!C.claimed[q.id]){C.claimed[q.id]=1;if(q.r.coins)D.coins+=q.r.coins;if(q.r.gems)D.gems+=q.r.gems;if(q.r.chests)D.chests=(D.chests||0)+q.r.chests;n++}})});
    if(n){save();beep(900,.2);toast('Наград: '+n)}else toast('Нечего забирать');
  },14);const C=D.contracts;let y=85;
  [['Ежедневные',C.daily],['Еженедельные',C.weekly],['Ежемесячные',C.monthly]].forEach(([title,list])=>{
    tx(title,28,y,18,'#ffd34a');y+=26;
    (list||[]).forEach(q=>{
      const ok=q.done,cl=!!C.claimed[q.id];
      panel(18,y,504,66,'#4a7aff');
      tx(q.n,36,y+20,16);bar(36,y+40,210,12,(q.p||0)/q.t,'#3ad86a');tx((q.p||0)+'/'+q.t,145,y+47,12,'#fff','center');
      let reward='';
      if(q.r.coins)reward+=''+q.r.coins+' ';
      if(q.r.gems)reward+='G'+q.r.gems+' ';
      if(q.r.chests)reward+=''+q.r.chests;
      btn(340,y+10,165,46,cl?'✔':(ok?reward.trim():'...'),cl?'#445':ok?'#ffc030':'#445',()=>{
        if(ok&&!cl){C.claimed[q.id]=1;if(q.r.coins)D.coins+=q.r.coins;if(q.r.gems)D.gems+=q.r.gems;if(q.r.chests)D.chests=(D.chests||0)+q.r.chests;save();beep(900,.2);toast('Награда получена!')}
      },15);
      y+=74;
    });y+=8;
  });
}

function profile(){
  bg(4,6);back();tx('Профиль',270,40,28,'#fff','center');
  panel(40,90,460,300,'#4a7aff');
  drawAvatar(120,180,50);
  hit(70,130,100,100,()=>{pickAvatar();setTimeout(loadAvatar,300)});
  tx('',120,240,14,'#9ec9ff','center');
  tx(D.prof.name||'Пилот',250,130,26);tx('Уровень '+D.lv,250,168,18,'#ffd34a');
  tx('Код: '+(D.prof.uid||'—'),250,200,15,'#9ec9ff');
  tx('Убито: '+D.kills+'  Боссов: '+D.bosses,250,235,15);
  tx('Сундуков: '+(D.st.opened||0)+'  Звёзд: '+Object.values(stars).reduce((a,b)=>a+b,0),250,265,15);
  tx('Дней входа: '+(D.st.loginDays||1),250,295,15,'#9ec9ff');
  tx('Нажми на аватар — сменить фото',270,360,13,'#667','center');
  btn(90,390,360,48,'Скины','#b070ff',()=>scr='skins');
  btn(90,445,360,48,'Престиж (ранг '+(D.prestige&&D.prestige.level||0)+')','#ffc030',()=>scr='prestige');
  btn(90,465,360,52,'✏️ Сменить имя','#4a7aff',()=>{const n=prompt('Имя пилота',D.prof.name||'Пилот');if(n&&n.trim()){D.prof.name=n.trim().slice(0,14);save()}});
  btn(90,530,170,50,'Экспорт','#6a8aff',()=>{prompt('Сохранение:',JSON.stringify(D))},16);
  btn(280,530,170,50,'Импорт','#6a8aff',()=>{
    const t=prompt('Вставь JSON сохранения');
    if(!t)return;
    try{const n=JSON.parse(t);Object.assign(D,n);save();loadAvatar();toast('Импорт OK');location.reload()}catch(e){toast('Ошибка JSON')}
  },16);
}

function skins(){
  bg(5,6);back();tx('Скины пилота',270,40,28,'#fff','center');
  SKINS.forEach((s,i)=>{
    const owned=D.cosmetic.owned.includes(s.id),y=95+i*78;
    panel(36,y,468,70,D.cosmetic.skin===s.id?'#ffd34a':'#4a7aff');
    RP.c=s.col;spr(ROB,RP,85,y+35,9);tx(s.name,160,y+36,22);
    if(owned)btn(340,y+12,145,46,D.cosmetic.skin===s.id?'Выбран':'Выбрать','#3ad86a',()=>{D.cosmetic.skin=s.id;save();beep(700,.1)},16);
    else btn(340,y+12,145,46,'* 25','#ffc030',()=>{if(D.gems>=25){D.gems-=25;D.cosmetic.owned.push(s.id);D.cosmetic.skin=s.id;save();beep(900,.15);toast('Скин получен!')}else toast('Нужно 25 гемов')},16);
  });
}

function rank(){
  bg(4,6);back();tx('Рейтинг',270,40,28,'#fff','center');
  panel(40,85,460,160,'#ffc030');
  const totalStars=Object.values(stars).reduce((a,b)=>a+b,0);
  [['Волны',D.best],['☠ Убито',D.kills],['Боссы',D.bosses],['Звёзды',totalStars]].forEach((r,i)=>{
    const x=60+(i%2)*220,y=115+((i/2)|0)*40;
    tx(r[0]+'  '+r[1],x,y,16);
  });
  tx('Глобальный топ',270,270,20,'#9ec9ff','center');
  const O=window.POOnline;
  const board=(O&&O.board)||[];
  if(!(O&&O.session)){
    tx('Войди в онлайн, чтобы видеть общий топ',270,320,14,'#ff8a9a','center');
    btn(120,360,300,50,'Войти','#4a7aff',()=>scr='online',18);
  }else if(!board.length){
    tx('Пока пусто — отправь свой счёт',270,320,14,'#667','center');
    btn(120,360,300,50,'Отправить счёт','#3ad86a',async()=>{
      const r=await O.submitScore();toast(r.ok?('Счёт '+r.score):(r.error||'Ошибка'));
      if(O.loadLeaderboard)await O.loadLeaderboard();
    },16);
  }else{
    board.slice(0,10).forEach((r,i)=>{
      const y=300+i*28;
      const me=D.prof&&r.pilot_code===D.prof.uid;
      tx((i+1)+'. '+(r.display_name||r.pilot_code||'?'),50,y,14,me?'#ffd34a':'#fff');
      tx(String(r.score||0),480,y,14,'#ffd34a','right');
    });
  }
  btn(100,H-90,340,55,'Онлайн-меню','#4a7aff',()=>scr='online',18);
}


function eventScreen(){
  refreshRaidKeys();
  bg(6,6);back();
  const {ev,left}=eventNow();const es=ensureEventState();
  const mm=left/60|0,ss=left%60|0;
  // banner
  panel(20,70,500,100,'#c04aff','rgba(40,10,60,.9)');
  tx('ИВЕНТ: '+ev.name,270,100,22,'#ffd34a','center');
  tx(ev.desc,270,130,13,'#e0b0ff','center');
  tx('До смены: '+mm+':'+('0'+ss).slice(-2)+'  ·  Валюта: '+D.eventCur,270,155,14,'#fff','center');

  // progress of small event goals
  const need=ev.goal||1;const done=(es.prog||0)>=need;
  panel(20,185,500,70,'#4a7aff');
  tx('Цель: '+(es.prog||0)+'/'+need,270,210,16,'#fff','center');
  bar(60,230,420,14,Math.min(1,(es.prog||0)/need),'#3ad86a');

  // main actions
  btn(30,280,240,70,'Лавка ивента','#ffc030',()=>scr='eventShop',18);
  btn(270,280,240,70,'РЕЙД-БОСС','#ff3a5a',()=>scr='eventBoss',18);
  btn(30,370,240,60,'Обычный ивент-бой','#b070ff',()=>{go(Math.min(9,wd||3),4,0,1,ev)},15);
  btn(270,370,240,60,'Волны ивента','#6a8aff',()=>{go(Math.min(9,wd||3),0,1,0,ev)},15);

  if(es.claimed)tx('Награда цели получена',270,460,15,'#3ad86a','center');
  else if(done)btn(90,450,360,55,'Забрать награду цели','#ffc030',()=>{
    const r=ev.reward||{};
    if(r.coins)D.coins+=r.coins;if(r.gems)D.gems+=r.gems;if(r.chests)D.chests=(D.chests||0)+r.chests;
    D.eventCur=(D.eventCur||0)+25;es.claimed=true;save();toast('Награда + ивент-валюта');
  },18);

  panel(20,H-100,500,70,'#2a1840');
  tx('Ключи рейда: '+(D.eventRaid.keys|0)+'/3  (обновление раз в сутки)',270,H-65,14,'#e0b0ff','center');
}

function eventShop(){
  bg(5,6);back();tx('Лавка ивента',270,40,26,'#ffd34a','center');
  tx('Ивент-валюта: '+D.eventCur,270,72,16,'#e0b0ff','center');
  let y=100;
  EVENT_SHOP.forEach(it=>{
    const bought=!!D.eventShopBought[it.id];
    panel(24,y,492,70,'#6a3a8a','rgba(30,12,50,.92)');
    tx(it.name,44,y+22,16,'#ffd34a');
    tx(it.desc,44,y+48,13,'#cfe0ff');
    if(bought&&it.id==='es_prest'){tx('Куплено',420,y+35,14,'#3ad86a','center')}
    else btn(360,y+12,140,48,it.price+' ★','#ffc030',()=>{
      if((D.eventCur||0)<it.price){toast('Мало валюты');return}
      D.eventCur-=it.price;
      const g=it.give||{};
      if(g.chests)D.chests=(D.chests||0)+g.chests;
      if(g.gems)D.gems+=g.gems;
      if(g.coins)D.coins+=g.coins;
      if(g.keys){refreshRaidKeys();D.eventRaid.keys=Math.min(5,(D.eventRaid.keys|0)+g.keys)}
      if(g.skills){D.sk.m+=g.skills;D.sk.n+=g.skills;D.sk.s+=g.skills;D.sk.b+=g.skills}
      if(g.prest){D.prestige.bonus=(D.prestige.bonus||0)+g.prest}
      if(g.module){
        const pool=MODULES.filter(m=>!D.modules.owned[m.id]);
        if(pool.length){const m=pool[Math.random()*pool.length|0];D.modules.owned[m.id]=1;toast('Модуль: '+m.name)}
        else toast('Все модули уже есть');
      }
      if(g.hero){
        const ch=CHARS[Math.random()*CHARS.length|0];
        D.chars[ch.id]=(D.chars[ch.id]||0)+1;toast('Герой: '+ch.name);
      }
      if(it.id==='es_prest')D.eventShopBought[it.id]=1;
      save();beep(800,.15);toast('Куплено!');
    },14);
    y+=78;
  });
}

function eventBoss(){
  refreshRaidKeys();
  bg(8,4);back();tx('РЕЙД-БОСС',270,40,28,'#ff5a7a','center');
  const er=D.eventRaid;
  const hp=Math.max(0,er.bossHp|0),max=Math.max(1,er.bossMax|0);
  // huge boss visual
  g.save();g.translate(270,280);g.scale(2.2,2.2);
  boss(0,0,T,'#ff3a5a',9);g.restore();
  panel(30,90,480,50,'#4a1030');
  tx('ЗВЁЗДНЫЙ ИМПЕРАТОР — фаза '+(er.phase||1),270,115,16,'#ffd34a','center');
  bar(50,430,440,28,hp/max,'#ff2a3a');
  tx(hp.toLocaleString('ru-RU')+' / '+max.toLocaleString('ru-RU'),270,445,14,'#fff','center');
  tx('Твой суммарный урон: '+(er.totalDmg|0).toLocaleString('ru-RU'),270,480,14,'#9ec9ff','center');
  tx('Ключи сегодня: '+(er.keys|0)+'/3',270,510,16,'#ffd34a','center');
  if(hp<=0){
    tx('БОСС ПОВЕРЖЕН!',270,560,22,'#3ad86a','center');
    btn(90,600,360,55,'Награда за победу','#ffc030',()=>{
      D.eventCur=(D.eventCur||0)+100;D.gems+=30;D.chests=(D.chests||0)+3;
      er.bossMax=Math.floor(er.bossMax*1.35);er.bossHp=er.bossMax;er.phase=(er.phase||1)+1;er.totalDmg=0;
      save();toast('Фаза '+(er.phase)+'! +валюта');
    },18);
  }else{
    btn(60,550,200,65,'АТАКА (−1 ключ)','#ff3a5a',()=>{
      if((er.keys|0)<1){toast('Нет ключей — приходи завтра');return}
      er.keys--;save();
      // enter special battle vs huge boss
      go(9,5,0,1,{id:'raidboss',name:'Рейд-босс',diff:1.8,coinMul:2,track:'boss'},0);
      B.raidBoss=true;B.eventMode={id:'raidboss',track:'boss'};
      // override enemy to mega boss
      en.length=0;B.q.length=0;B.wave=1;B.waves=1;B.boss=true;
      const h=Math.min(er.bossHp, 8000+D.lv*200);
      en.push({boss:1,btype:9,x:270,y:-100,hp:h,mhp:h,r:100,t:0,sc:1,col:'#ff3a5a',raid:1});
      B.bn='ЗВЁЗДНЫЙ ИМПЕРАТОР';
      toast('Ключ использован!');
    },15);
    btn(280,550,200,65,'Лавка','#ffc030',()=>scr='eventShop',16);
  }
  tx('Каждая атака — бой. Урон снимает HP мирового босса.',270,H-40,12,'#9ec9ff','center');
}


function daily(){
  bg(2,6);back();tx('Ежедневные награды',270,40,24,'#ffd34a','center');
  const day=new Date().toDateString();
  if(!D.dailyBox)D.dailyBox={day:'',streak:0,claimed:false};
  if(D.dailyBox.day!==day){ /* new day keep streak if yesterday */ 
    const yest=new Date(Date.now()-864e5).toDateString();
    if(D.dailyBox.day!==yest)D.dailyBox.streak=0;
    D.dailyBox.day=day;D.dailyBox.claimed=false;save();
  }
  panel(40,100,460,280,'#4a7aff');
  tx('Серия входов: '+(D.dailyBox.streak||0)+' дней',270,140,18,'#fff','center');
  const rewards=[
    {d:1,c:50,g:2},{d:2,c:80,g:3},{d:3,c:120,g:5,ch:1},
    {d:4,c:150,g:5},{d:5,c:200,g:8,ch:1},{d:6,c:250,g:10},
    {d:7,c:400,g:20,ch:2}
  ];
  const dayN=Math.min(7,((D.dailyBox.streak||0)%7)+1);
  rewards.forEach((r,i)=>{
    const x=50+i*65,y=200;
    panel(x,y,58,90,i+1===dayN?'#ffd34a':'#334');
    tx('День '+(i+1),x+29,y+18,11,'#fff','center');
    tx(r.c+'',x+29,y+42,12,'#ffd34a','center');
    tx(r.g+'G',x+29,y+62,11,'#9ec9ff','center');
  });
  if(D.dailyBox.claimed)tx('Уже получено сегодня',270,340,16,'#3ad86a','center');
  else btn(90,330,360,55,'Забрать день '+dayN,'#ffc030',()=>{
    const r=rewards[dayN-1];
    D.coins+=r.c;D.gems+=r.g;if(r.ch)D.chests=(D.chests||0)+r.ch;
    D.dailyBox.claimed=true;D.dailyBox.streak=(D.dailyBox.streak||0)+1;save();
    toast('Ежедневка получена!');beep(900,.2);
  },18);
}

function arena(){
  bg(4,6);back();tx('Арена волн',270,40,26,'#ff5a7a','center');
  panel(40,100,460,200,'#4a1030');
  tx('5 жёстких волн подряд',270,140,18,'#fff','center');
  tx('Без лечения между волнами',270,175,14,'#e0b0ff','center');
  tx('Рекорд: '+(D.arenaBest||0),270,210,16,'#ffd34a','center');
  tx('Награда: монеты, гемы, ивент-валюта',270,245,14,'#9ec9ff','center');
  btn(90,340,360,70,'В бой!','#ff3a5a',()=>{
    go(Math.min(9,5+(D.arenaBest||0)/5|0),3,0,1,{id:'arena',diff:1.4,coinMul:2,track:'stages'});
    B.arena=true;B.waves=5;B.wave=0;nextWave();
  },22);
  btn(90,430,360,55,'Таблица (локально)','#6a8aff',()=>{
    toast('Рекорд арены: '+(D.arenaBest||0));
  },16);
}


function seasonPass(){
  bg(3,5);back();
  panel(80,12,380,50,'#ffd34a','rgba(20,30,60,.9)');
  tx('БОЕВОЙ ПРОПУСК',270,38,22,'#1a1040','center');
  if(!D.season)D.season={id:1,xp:0,prem:false,claimedFree:{},claimedPrem:{},start:Date.now()};
  if(!D.season.start)D.season.start=Date.now();
  if(!D.season.claimedFree)D.season.claimedFree={};
  if(!D.season.claimedPrem)D.season.claimedPrem={};
  if(typeof window._ss!=='number')window._ss=0;

  const left=Math.max(0,SEASON_DAYS*864e5-(Date.now()-D.season.start));
  const days=left/864e5|0,hrs=(left%864e5)/36e5|0;
  let cur=0;
  for(let i=0;i<SEASON_TIERS.length;i++)if((D.season.xp|0)>=SEASON_TIERS[i].xp)cur=i;
  const nextXp=SEASON_TIERS[Math.min(SEASON_TIERS.length-1,cur+(cur<SEASON_TIERS.length-1?1:0))].xp;
  const prevXp=SEASON_TIERS[cur].xp;
  const prog=nextXp>prevXp?Math.min(1,((D.season.xp|0)-prevXp)/(nextXp-prevXp)):1;

  panel(20,70,500,78,'#4a7aff');
  tx('Сезон #'+(D.season.id||1)+' · '+days+'д '+hrs+'ч',30,92,13,'#cfe0ff');
  tx('Ур. '+(cur+1)+' / 30   XP '+(D.season.xp|0),30,120,15,'#ffd34a');
  bar(200,112,180,14,prog,'#ffd34a');
  if(!D.season.prem){
    btn(390,82,120,50,'PREMIUM\n80G','#b070ff',()=>{
      if(D.gems<80){toast('Нужно 80 гемов');return}
      D.gems-=80;D.season.prem=true;save();toast('Premium!');
    },13);
  }else{panel(390,82,120,50,'#3ad86a');tx('PREMIUM',450,107,14,'#fff','center')}

  // scroll controls — big hit areas
  const maxScroll=Math.max(0,(SEASON_TIERS.length-4)*100);
  btn(20,160,100,44,'◄ Назад','#6a8aff',()=>{window._ss=Math.max(0,window._ss-100)},14);
  btn(130,160,100,44,'Вперёд ►','#6a8aff',()=>{window._ss=Math.min(maxScroll,window._ss+100)},14);
  btn(240,160,120,44,'К уровню','#ffc030',()=>{window._ss=Math.min(maxScroll,Math.max(0,cur*100-100))},13);
  tx('Стр. уровни '+(1+Math.floor(window._ss/100))+'+',420,182,12,'#9ec9ff','center');

  // 4 visible cards
  const start=Math.floor(window._ss/100);
  for(let k=0;k<4;k++){
    const i=start+k;
    if(i>=SEASON_TIERS.length)break;
    const t=SEASON_TIERS[i];
    const unlocked=(D.season.xp|0)>=t.xp;
    const x=20+k*130;
    // level header
    panel(x,215,122,36,i===cur?'#ffd34a':(unlocked?'#4a7aff':'#334'));
    tx('Ур.'+(i+1),x+61,233,15,i===cur?'#1a1040':'#fff','center');
    // free
    panel(x,255,122,100,unlocked?'#2a5080':'#1a2030');
    tx('FREE',x+61,272,11,'#9ec9ff','center');
    tx(rewardLabel(t.free),x+61,295,12,unlocked?'#fff':'#556','center');
    if(t.free&&t.free.d56)tx('Д-56',x+61,315,13,'#7fd0ff','center');
    if(unlocked&&!D.season.claimedFree[i]){
      btn(x+8,330,106,22,'Забрать','#3ad86a',((ii)=>{return()=>{
        grantReward(SEASON_TIERS[ii].free);D.season.claimedFree[ii]=1;save();toast('Забрано Free ур.'+(ii+1));
      }})(i),12);
    }else if(D.season.claimedFree[i])tx('✓',x+61,340,14,'#3ad86a','center');
    else if(!unlocked)tx('🔒',x+61,340,12,'#556','center');
    // premium
    panel(x,365,122,110,unlocked&&D.season.prem?'#5a3080':'#2a2040');
    tx('PREM',x+61,382,11,'#e0b0ff','center');
    tx(rewardLabel(t.prem),x+61,405,12,unlocked?'#e0b0ff':'#556','center');
    if(t.prem&&t.prem.d56)tx('Д-56',x+61,425,13,'#7fd0ff','center');
    if(unlocked&&D.season.prem&&!D.season.claimedPrem[i]){
      btn(x+8,445,106,22,'Забрать','#ffc030',((ii)=>{return()=>{
        grantReward(SEASON_TIERS[ii].prem);D.season.claimedPrem[ii]=1;save();toast('Забрано Prem ур.'+(ii+1));
      }})(i),12);
    }else if(D.season.claimedPrem[i])tx('✓',x+61,455,14,'#3ad86a','center');
    else if(!D.season.prem)tx('premium',x+61,455,11,'#556','center');
    else if(!unlocked)tx('🔒',x+61,455,12,'#556','center');
  }
  btn(20,H-70,240,48,'Забрать все Free','#3ad86a',()=>{
    let n=0;SEASON_TIERS.forEach((t,i)=>{if((D.season.xp|0)>=t.xp&&!D.season.claimedFree[i]){grantReward(t.free);D.season.claimedFree[i]=1;n++}});
    if(D.season.prem)SEASON_TIERS.forEach((t,i)=>{if((D.season.xp|0)>=t.xp&&!D.season.claimedPrem[i]){grantReward(t.prem);D.season.claimedPrem[i]=1;n++}});
    save();toast(n?('Забрано: '+n):'Нечего');
  },14);
  tx('30 ур. · Д-56 на 30',400,H-46,12,'#9ec9ff','center');
}
function rewardLabel(o){
  if(!o)return'—';
  if(o.d56)return'Д-56';
  if(o.hero)return'Герой';
  if(o.module)return'Модуль';
  if(o.chests&&o.coins)return o.coins+' +'+o.chests+'📦';
  if(o.chests)return 'x'+o.chests+' сундук';
  if(o.gems&&o.coins)return o.coins+'/'+o.gems+'G';
  if(o.gems)return o.gems+' G';
  if(o.coins)return o.coins+'';
  return Object.keys(o)[0]||'—';
}
let seasonScroll=0;
function grantReward(o){
  if(!o)return;
  if(o.coins)D.coins+=o.coins;if(o.gems)D.gems+=o.gems;if(o.chests)D.chests=(D.chests||0)+o.chests;
  if(o.hero){const ch=CHARS[Math.random()*CHARS.length|0];D.chars[ch.id]=(D.chars[ch.id]||0)+1}
  if(o.module){const pool=MODULES.filter(m=>!D.modules.owned[m.id]);if(pool.length){const m=pool[Math.random()*pool.length|0];D.modules.owned[m.id]=1}}
  if(o.d56){D.chars['d56']=(D.chars['d56']||0)+1;toast('Получен Д-56!')}
}

function clanScreen(){
  bg(1,6);back();tx('Клан / Эскадрилья',270,40,24,'#fff','center');
  const c=D.clan;
  if(!c.code){
    panel(40,120,460,200,'#4a7aff');
    tx('Ты не в клане',270,170,18,'#fff','center');
    btn(90,220,360,55,'Создать клан (50G)','#ffc030',()=>{
      if(D.gems<50){toast('Нужно 50 гемов');return}
      D.gems-=50;
      const code='CL-'+Math.random().toString(36).slice(2,7).toUpperCase();
      D.clan={code,name:'Клан '+code.slice(3),role:'leader',raidHp:200000,raidMax:200000,raidDmg:0};
      save();toast('Клан создан: '+code);
    },16);
    btn(90,290,360,55,'Вступить по коду','#3ad86a',()=>{
      const code=(prompt('Код клана CL-XXXXX')||'').trim().toUpperCase();
      if(!code)return;
      D.clan={code,name:'Клан '+code.replace('CL-',''),role:'member',raidHp:200000,raidMax:200000,raidDmg:0};
      save();toast('Вступили в '+code);
    },16);
    return;
  }
  panel(30,90,480,120,'#4a7aff');
  tx(c.name,270,120,22,'#ffd34a','center');
  tx('Код: '+c.code+'  ·  '+c.role,270,155,14,'#cfe0ff','center');
  tx('Скопируй код друзьям для вступления',270,185,12,'#9ec9ff','center');
  // clan raid
  panel(30,230,480,160,'#4a1030');
  tx('Клановый рейд-босс',270,260,18,'#ff5a7a','center');
  bar(60,290,420,20,Math.max(0,c.raidHp)/Math.max(1,c.raidMax),'#ff2a3a');
  tx((c.raidHp|0).toLocaleString('ru-RU')+' / '+(c.raidMax|0).toLocaleString('ru-RU'),270,320,13,'#fff','center');
  tx('Твой вклад: '+(c.raidDmg|0),270,345,13,'#9ec9ff','center');
  btn(60,410,200,55,'Ударить','#ff3a5a',()=>{
    refreshRaidKeys();
    if((D.eventRaid.keys|0)<1){toast('Нужен ключ рейда');return}
    D.eventRaid.keys--;
    const dmg=800+D.lv*40+Math.random()*400|0;
    c.raidHp=Math.max(0,c.raidHp-dmg);c.raidDmg=(c.raidDmg|0)+dmg;
    D.eventCur=(D.eventCur||0)+8;D.season.xp=(D.season.xp|0)+15;
    if(c.raidHp<=0){D.gems+=25;D.chests=(D.chests||0)+2;c.raidMax=Math.floor(c.raidMax*1.25);c.raidHp=c.raidMax;c.raidDmg=0;toast('Клановый босс повержен!')}
    else toast('Урон клану: '+dmg);
    save();
  },16);
  btn(280,410,200,55,'Покинуть','#445',()=>{
    if(confirm('Покинуть клан?')){D.clan={code:'',name:'',role:'none',raidHp:200000,raidMax:200000,raidDmg:0};save()}
  },16);
}

function baseRaid(){
  bg(5,6);back();tx('Рейд на базу',270,40,24,'#ff8a3a','center');
  panel(40,100,460,220,'#4a7aff');
  tx('Асинхронная атака',270,140,18,'#fff','center');
  tx('Цель — база друга или тренировочная.',270,175,14,'#cfe0ff','center');
  tx('Защита зависит от Стражевой и зданий.',270,205,14,'#9ec9ff','center');
  const defPower=10+(bldLvl('tur')||0)*15+(bldLvl('dome')||0)*10+(bldLvl('reactor')||0)*5;
  tx('Сила твоей защиты: '+defPower,270,245,15,'#ffd34a','center');
  btn(90,350,360,60,'Тренировочный рейд','#ff8a3a',()=>{
    const enemyDef=40+Math.random()*80|0;
    const atk=50+D.lv*8+(D.ud||0)*5;
    const win=atk+Math.random()*30>enemyDef;
    if(win){const r=100+enemyDef*2|0;D.coins+=r;D.season.xp=(D.season.xp|0)+25;D.eventCur=(D.eventCur||0)+5;toast('Победа! +'+r+' монет')}
    else toast('Оборона устояла…');
    save();
  },18);
  btn(90,430,360,55,'Атака по коду друга','#b070ff',()=>{
    const code=(prompt('Код пилота друга PO-XXXX')||'').trim();
    if(!code)return;
    // simulated based on code hash
    let h=0;for(let i=0;i<code.length;i++)h=(h*31+code.charCodeAt(i))|0;
    const enemyDef=50+Math.abs(h%120);
    const atk=50+D.lv*8+(D.ud||0)*5+(bldLvl('tur')||0)*5;
    const win=atk+Math.random()*40>enemyDef;
    if(win){const r=150+enemyDef|0;D.coins+=r;D.gems+=2;D.season.xp=(D.season.xp|0)+35;toast('База '+code+' ограблена! +'+r)}
    else toast('Защита '+code+' отбила атаку');
    save();
  },16);
}

function weeklyBoss(){
  bg(8,4);back();tx('Недельный босс',270,40,24,'#ff5a7a','center');
  const week=weekId();
  if(D.weeklyBoss.week!==week){D.weeklyBoss.week=week;D.weeklyBoss.top=[];/* keep event raid hp as weekly */D.eventRaid.bossHp=D.eventRaid.bossMax;D.eventRaid.totalDmg=0;save()}
  const er=D.eventRaid;
  panel(30,90,480,80,'#4a1030');
  tx('Мировой босс недели #'+week,270,120,16,'#ffd34a','center');
  tx('Урон за неделю: '+(er.totalDmg|0).toLocaleString('ru-RU'),270,150,14,'#fff','center');
  btn(90,200,360,55,'К рейд-боссу','#ff3a5a',()=>scr='eventBoss',18);
  tx('Локальный топ урона (сессия)',270,280,14,'#9ec9ff','center');
  // store self in top
  const me={name:D.prof.name||'Пилот',dmg:er.totalDmg|0};
  let top=D.weeklyBoss.top||[];
  top=top.filter(t=>t.name!==me.name);top.push(me);top.sort((a,b)=>b.dmg-a.dmg);top=top.slice(0,10);
  D.weeklyBoss.top=top;save();
  top.forEach((t,i)=>{
    tx((i+1)+'. '+t.name+'  —  '+t.dmg,80,310+i*28,14,i===0?'#ffd34a':'#fff');
  });
}
function weekId(){
  const d=new Date();const one=new Date(d.getFullYear(),0,1);
  return d.getFullYear()+'-W'+(Math.ceil((((d-one)/864e5)+one.getDay()+1)/7));
}


function musicScreen(){
  bg(2,6);back();tx('Плейлист',270,40,26,'#ffd34a','center');
  if(!D.playlist)D.playlist=[];
  if(D.mus==null)D.mus=1;
  panel(30,80,480,60,'#4a7aff');
  tx(D.mus?'Музыка: ВКЛ':'Музыка: ВЫКЛ',160,110,16);
  btn(320,90,170,40,D.mus?'Выкл':'Вкл','#3ad86a',()=>{D.mus^=1;save();if(!D.mus)stopUserMusic();else playUserMusic()},14);

  tx('Треки: '+D.playlist.length,40,165,15,'#9ec9ff');
  btn(200,150,150,40,'+ URL','#b070ff',()=>{
    const url=(prompt('Ссылка на mp3/ogg (https://...)')||'').trim();
    if(!url)return;
    const name=(prompt('Название трека')||'Трек').slice(0,40);
    D.playlist.push({name,url});save();toast('Добавлено');
  },14);
  btn(360,150,150,40,'+ Файл','#6a8aff',()=>{
    const inp=document.createElement('input');inp.type='file';inp.accept='audio/*';
    inp.onchange=()=>{
      const f=inp.files&&inp.files[0];if(!f)return;
      const url=URL.createObjectURL(f);
      D.playlist.push({name:(f.name||'Файл').slice(0,40),url,blob:true});
      save();toast('Файл в плейлисте (до перезагрузки)');
      playUserMusic();
    };
    inp.click();
  },14);

  let y=210;
  D.playlist.forEach((t,i)=>{
    panel(30,y,480,56,musicIdx===i?'#3ad86a':'#334');
    tx((i+1)+'. '+t.name,50,y+28,14,'#fff');
    hit(30,y,360,56,()=>{musicIdx=i;playUserMusic();toast('▶ '+t.name)});
    btn(400,y+8,90,40,'X','#ff5a7a',()=>{
      D.playlist.splice(i,1);if(musicIdx>=D.playlist.length)musicIdx=0;save();stopUserMusic();
    },14);
    y+=62;
  });
  if(!D.playlist.length)tx('Добавь URL или файл — будет играть в меню',270,300,14,'#9ec9ff','center');
  btn(90,H-90,360,55,musicPlaying?'⏸ Пауза':'▶ Играть','#ffc030',()=>{
    if(musicPlaying)stopUserMusic();else playUserMusic();
  },18);
}
let musicIdx=0,musicPlaying=false,userAudio=null;
function playUserMusic(){
  if(!D.mus||!D.playlist||!D.playlist.length)return;
  stopUserMusic();
  try{
    userAudio=new Audio(D.playlist[musicIdx%D.playlist.length].url);
    userAudio.loop=false;
    userAudio.volume=0.45;
    userAudio.play().catch(()=>{});
    musicPlaying=true;
    userAudio.onended=()=>{musicIdx=(musicIdx+1)%D.playlist.length;playUserMusic()};
  }catch(e){toast('Не удалось воспроизвести')}
}
function stopUserMusic(){
  musicPlaying=false;
  if(userAudio){try{userAudio.pause()}catch(e){}userAudio=null}
}


const ADMIN_EMAIL='admin1@po.game';
const ADMIN_PASS='mark156';
function isAdmin(){
  const O=window.POOnline;
  if(D&&D.admin)return true;
  if(O&&O.session&&O.session.user){
    const e=(O.session.user.email||'').toLowerCase();
    if(e===ADMIN_EMAIL||e.startsWith('admin1'))return true;
  }
  return !!(D&&D.admin);
}
function adminPanel(){
  bg(0,6);back();tx('Админ-панель',270,36,26,'#ff5a7a','center');
  if(!isAdmin()){
    tx('Нет доступа',270,200,20,'#ff8a9a','center');
    btn(90,280,360,55,'Вход admin1 / mark156','#b070ff',async()=>{
      const O=window.POOnline;
      if(O&&O.signInEmail){
        let r=await O.signInEmail(ADMIN_EMAIL,ADMIN_PASS,false);
        if(!r.ok)r=await O.signInEmail(ADMIN_EMAIL,ADMIN_PASS,true);
        if(r.ok){D.admin=true;save();toast('Админ OK')}
        else{
          // offline admin by password
          const p=prompt('Пароль админа');
          if(p===ADMIN_PASS){D.admin=true;save();toast('Локальный админ')}
          else toast(r.error||'Ошибка');
        }
      }else{
        const p=prompt('Пароль админа');
        if(p===ADMIN_PASS){D.admin=true;save();toast('Локальный админ')}
      }
    },16);
    return;
  }
  tx('Режим администратора',270,70,14,'#3ad86a','center');
  const gifts=[
    ['+10K монет',()=>{D.coins+=10000}],
    ['+500 гемов',()=>{D.gems+=500}],
    ['+20 сундуков',()=>{D.chests=(D.chests||0)+20}],
    ['+5000 season XP',()=>{D.season.xp=(D.season.xp||0)+5000}],
    ['Макс сезон XP',()=>{D.season.xp=20000}],
    ['Premium сезон',()=>{D.season.prem=true}],
    ['Все модули',()=>{MODULES.forEach(m=>D.modules.owned[m.id]=1)}],
    ['Все герои',()=>{CHARS.forEach(c=>D.chars[c.id]=(D.chars[c.id]||0)+5)}],
    ['Д-56 +5',()=>{D.chars.d56=(D.chars.d56||0)+5}],
    ['Ключи x3',()=>{refreshRaidKeys();D.eventRaid.keys=3}],
    ['+200 ивент$',()=>{D.eventCur=(D.eventCur||0)+200}],
    ['Ур. 50',()=>{D.lv=50;D.xp=0}],
  ];
  gifts.forEach((g,i)=>{
    const x=30+(i%2)*250,y=100+Math.floor(i/2)*52;
    btn(x,y,240,46,g[0],'#4a7aff',()=>{g[1]();save();toast(g[0]);},14);
  });
  btn(30,H-200,480,50,'Выдать игроку по коду PO-','#ffc030',()=>{
    const code=(prompt('Код пилота PO-XXXXXX')||'').trim().toUpperCase();
    if(!code)return;
    const what=prompt('Что выдать? coins / gems / chests / ban / unban','gems');
    const amt=parseInt(prompt('Количество','100')||'0',10);
    // store pending grants in localStorage mailbox by pilot code
    try{
      const key='po_admin_grants';
      const box=JSON.parse(localStorage.getItem(key)||'{}');
      box[code]=box[code]||[];
      box[code].push({what,amt,at:Date.now()});
      localStorage.setItem(key,JSON.stringify(box));
      toast('Грант для '+code+' сохранён');
    }catch(e){toast('Ошибка')}
  },16);
  btn(30,H-140,480,50,'Забрать админ-почту (для себя)','#3ad86a',()=>{
    claimAdminGrants();
  },16);
  btn(30,H-80,480,45,'Снять админ-флаг','#445',()=>{D.admin=false;save();toast('Админ выкл')},14);
}
function claimAdminGrants(silent){
  try{
    const key='po_admin_grants';
    const code=(D.prof&&D.prof.uid||'').toUpperCase();
    const box=JSON.parse(localStorage.getItem(key)||'{}');
    const list=box[code]||[];
    if(!list.length){if(!silent)toast('Нет выдач');return}
    list.forEach(g=>{
      if(g.what==='coins')D.coins+=g.amt|0;
      else if(g.what==='gems')D.gems+=g.amt|0;
      else if(g.what==='chests')D.chests=(D.chests||0)+(g.amt|0);
      else if(g.what==='ban'){D.banned=true;toast('Вы забанены админом')}
      else if(g.what==='unban'){D.banned=false}
    });
    delete box[code];
    localStorage.setItem(key,JSON.stringify(box));
    save();toast('Получено выдач: '+list.length);
  }catch(e){toast('Ошибка почты')}
}

function online(){
  bg(0,8);back();
  tx('ОНЛАЙН',270,36,26,'#ffd34a','center');
  const O=window.POOnline;
  const sess=O&&O.session;
  const on=!!sess;
  // status card
  rr(30,70,480,80,18);
  g.fillStyle=on?'rgba(20,60,40,0.9)':'rgba(60,20,30,0.9)';g.fill();
  g.strokeStyle=on?'#3ad86a':'#ff5a7a';g.lineWidth=2;g.stroke();
  g.fillStyle=on?'#3ad86a':'#ff5a7a';g.beginPath();g.arc(60,110,10,0,7);g.fill();
  tx(on?'В сети':'Не в сети',100,100,20,'#fff');
  tx(on?(sess.user.email||'аккаунт'):'Нужен вход для топа и друзей',100,122,12,'#cfe0ff');
  if(O&&O.lastError)tx(String(O.lastError).slice(0,55),270,165,12,'#ff8a9a','center');

  if(!on){
    cardBtn(40,190,460,64,'👤','Гость','быстрый вход без почты','#4a7aff',async()=>{
      if(!O||!O.ready){toast('SDK…');return}
      toast('Вход…');const r=await O.signInGuest();toast(r.ok?'Вошли!':(r.error||'Ошибка'));
    });
    cardBtn(40,270,460,64,'✉','Email','вход / регистрация','#b070ff',async()=>{
      if(!O||!O.ready){toast('SDK…');return}
      const email=prompt('Email');if(!email)return;
      const pass=prompt('Пароль (мин. 6)');if(!pass)return;
      toast('…');let r=await O.signInEmail(email,pass,false);
      if(!r.ok)r=await O.signInEmail(email,pass,true);
      toast(r.ok?'Успех':(r.error||'Ошибка'));
    });
    chipBtn(40,360,220,50,'↻','Сессия','#668',async()=>{if(O&&O.refresh){await O.refresh();toast(O.session?'OK':'Нет')}});
    chipBtn(280,360,220,50,'🛠','Статус','#668',()=>toast(O?(O.status+' / '+(O.ready?'ready':'no')):'нет'));
  }else{
    const code=(D.prof&&D.prof.uid)||'—';
    tx('Код: '+code,270,190,16,'#ffd34a','center');
    chipBtn(40,220,220,52,'👥','Друзья','#4a7aff',()=>scr='friends');
    chipBtn(280,220,220,52,'⚔','Рейд','#ff5a7a',()=>{scr='raid';if(O.refreshRaid)O.refreshRaid()});
    chipBtn(40,286,220,52,'🏆','Топ','#ffc030',async()=>{if(O.loadLeaderboard)await O.loadLeaderboard();scr='rank'});
    chipBtn(280,286,220,52,'⬆','Счёт','#3ad86a',async()=>{const r=await O.submitScore();toast(r.ok?(''+r.score):(r.error||'?'))});
    chipBtn(40,352,220,52,'⚡','Дуэль','#c04aff',()=>{const c=prompt('Код');if(!c)return;go(5,4,0,1,{id:'duel',diff:1.35,coinMul:2.5})});
    chipBtn(280,352,220,52,'↻','Синхрон','#6a8aff',async()=>{await O.refresh();toast('OK')});
    cardBtn(40,430,460,56,'⎋','Выйти','сменить аккаунт','#445',async()=>{await O.signOut();toast('Вышли')});
  }
}

function friends(){
  bg(1,6);back();tx('Друзья',270,40,26,'#fff','center');
  const O=window.POOnline;
  if(!O||!O.session){tx('Войдите в онлайн',270,200,20,'#ff8a9a','center');btn(120,280,300,55,'К онлайн','#4a7aff',()=>scr='online');return}

  btn(30,80,240,50,'По коду','#4a7aff',async()=>{
    const code=prompt('Код пилота (PO-XXXXXX)');if(!code)return;
    const r=await O.sendFriendRequest(code);toast(r.ok?('Заявка → '+(r.name||'')):(r.error||'Ошибка'));
  },16);
  btn(290,80,220,50,'Профиль','#b070ff',async()=>{
    const code=prompt('Код пилота для просмотра');if(!code)return;
    toast('Загрузка...');const r=await O.getProfile(code);
    if(!r.ok){toast(r.error||'Не найден');return}
    friendView=r.profile;scr='friendProfile';
  },16);

  let y=150;
  const uid=O.session.user.id;
  const reqs=(O.requests||[]).filter(r=>r.status==='pending'&&r.receiver_id===uid);
  if(reqs.length){
    tx('Входящие заявки:',30,y,15,'#ffd34a');y+=24;
    for(const r of reqs.slice(0,4)){
      panel(24,y,492,58,'#4a7aff');
      tx('От '+String(r.sender_id).slice(0,8)+'…',40,y+20,14);
      btn(280,y+8,100,42,'Принять','#3ad86a',async()=>{
        const res=await O.respondFriend(r.id,true);toast(res.ok?'Друг добавлен':(res.error||'Ошибка'));
      },14);
      btn(390,y+8,110,42,'Отклон.','#ff5a7a',async()=>{
        await O.respondFriend(r.id,false);toast('Отклонено');
      },14);
      y+=66;
    }
  }

  // outgoing pending
  const out=(O.requests||[]).filter(r=>r.status==='pending'&&r.sender_id===uid);
  if(out.length){
    tx('Исходящие: '+out.length,30,y,14,'#9ec9ff');y+=22;
  }

  tx('Мои друзья ('+((O.friends||[]).length)+')',30,y,15,'#ffd34a');y+=24;
  const list=O.friends||[];
  if(!list.length)tx('Пока никого — отправь заявку по коду',270,y+40,14,'#9ec9ff','center');
  list.slice(0,8).forEach(f=>{
    panel(24,y,492,70,'#4a7aff');
    const online=f.is_online||(f.last_seen&&(Date.now()-new Date(f.last_seen).getTime()<5*60*1000));
    tx(online?'●':'○',40,y+24,16,online?'#3ad86a':'#667');
    tx((f.display_name||'Пилот').slice(0,14),60,y+22,16);
    tx((f.pilot_code||'')+' · Ур.'+(f.level||1),60,y+48,13,'#9ec9ff');
    // last seen
    let seen='нет данных';
    if(f.last_seen){
      const sec=Math.max(0,(Date.now()-new Date(f.last_seen).getTime())/1000|0);
      if(sec<300)seen='сейчас';
      else if(sec<3600)seen=Math.floor(sec/60)+' мин назад';
      else if(sec<86400)seen=Math.floor(sec/3600)+' ч назад';
      else seen=Math.floor(sec/86400)+' дн назад';
    }
    tx(seen,300,y+22,12,'#cfe0ff');
    btn(300,y+36,100,28,'Профиль','#6a8aff',async()=>{
      toast('...');const r=await O.getProfile(f.user_id||f.pilot_code);
      if(!r.ok){toast(r.error||'Ошибка');return}
      friendView=r.profile;scr='friendProfile';
    },13);
    btn(410,y+36,90,28,'Удалить','#ff5a7a',async()=>{
      if(!confirm('Удалить из друзей '+(f.display_name||'')+'?'))return;
      const r=await O.removeFriend(f.user_id);toast(r.ok?'Удалён':(r.error||'Ошибка'));
    },13);
    y+=78;
  });
  btn(120,H-70,300,50,'Обновить','#445',async()=>{await O.loadFriends();toast('Обновлено')},16);
}
let friendView=null;

function friendProfile(){
  bg(4,6);back();tx('Профиль пилота',270,40,24,'#fff','center');
  const O=window.POOnline;
  const p=friendView;
  if(!p){tx('Нет данных',270,200,20,'#fff','center');btn(120,280,300,55,'Назад','#4a7aff',()=>scr='friends');return}
  panel(40,90,460,320,'#4a7aff');
  const online=p.is_online;
  tx(online?'● В сети':'○ Не в сети',270,120,16,online?'#3ad86a':'#9ec9ff','center');
  tx(p.display_name||'Пилот',270,155,28,'#fff','center');
  tx(p.pilot_code||'',270,185,16,'#ffd34a','center');
  tx('Уровень '+(p.level||1),270,215,18,'#cfe0ff','center');
  let seen='—';
  if(p.last_seen){
    const sec=Math.max(0,(Date.now()-new Date(p.last_seen).getTime())/1000|0);
    if(sec<300)seen='только что';
    else if(sec<3600)seen=Math.floor(sec/60)+' мин назад';
    else if(sec<86400)seen=Math.floor(sec/3600)+' ч назад';
    else seen=new Date(p.last_seen).toLocaleString('ru-RU');
  }
  tx('Был(а) в сети: '+seen,270,250,14,'#9ec9ff','center');
  tx('Счёт: '+(p.score||0)+'  ·  Волны: '+(p.best_wave||0),270,285,15,'#fff','center');
  tx('Убито: '+(p.kills||0)+'  ·  Боссов: '+(p.bosses||0),270,315,15,'#fff','center');
  if(p.raid_tokens!=null)tx('Рейд-токены: '+p.raid_tokens,270,345,14,'#cfe0ff','center');

  if(p.is_self){
    tx('Это вы',270,400,16,'#ffd34a','center');
  }else if(p.is_friend){
    btn(90,395,360,48,'Подарок (50 / день)','#ffc030',async()=>{
      const r=await O.sendGift(p.user_id);
      toast(r.ok?(r.msg||'Отправлено'):(r.error||'Ошибка'));
    },16);
    btn(90,450,360,48,'Удалить из друзей','#ff5a7a',async()=>{
      if(!confirm('Удалить '+p.display_name+'?'))return;
      const r=await O.removeFriend(p.user_id);toast(r.ok?'Удалён':(r.error||'Ошибка'));
      if(r.ok){friendView=null;scr='friends'}
    },18);
  }else if(p.pending_out){
    tx('Заявка уже отправлена',270,400,16,'#ffd34a','center');
  }else if(p.pending_in){
    btn(90,400,360,55,'✓ Принять заявку','#3ad86a',async()=>{
      const req=(O.requests||[]).find(r=>r.status==='pending'&&r.sender_id===p.user_id&&r.receiver_id===O.session.user.id);
      if(!req){toast('Заявка не найдена');return}
      const r=await O.respondFriend(req.id,true);toast(r.ok?'Добавлен':(r.error||'Ошибка'));
      if(r.ok){const g2=await O.getProfile(p.user_id);if(g2.ok)friendView=g2.profile}
    },18);
  }else{
    btn(90,400,360,55,'Добавить в друзья','#3ad86a',async()=>{
      const r=await O.sendFriendRequest(p.pilot_code);toast(r.ok?'Заявка отправлена':(r.error||'Ошибка'));
      if(r.ok){p.pending_out=true}
    },18);
  }
  btn(90,470,360,50,'← К списку друзей','#6a8aff',()=>scr='friends',16);
}

function raid(){
  bg(5,6);back();tx('Глобальный Рейд',270,40,26,'#fff','center');
  const O=window.POOnline,R=O&&O.raid;
  if(!O||!O.session){tx('Войдите в онлайн',270,200,22,'#ff8a9a','center');btn(120,280,300,60,'К онлайн','#4a7aff',()=>scr='online');return}
  if(!R){
    tx('Нет данных рейда',270,180,20,'#fff','center');
    btn(100,240,340,60,'Подключиться','#4a7aff',async()=>{
      const r=await O.joinRaid();if(!r.ok)await O.refreshRaid();toast(r.ok?'В рейде':(r.error||'OK'));
    });
    return;
  }
  const hp=Math.max(0,Number(R.hp)||0),max=Math.max(1,Number(R.max_hp)||1);
  panel(30,90,480,200,'#ff5a7a');
  tx(''+(R.boss_name||'НЕБУЛОН'),270,120,24,'#fff','center');
  tx('Фаза '+(R.phase||1),270,155,18,'#ffd34a','center');
  bar(60,175,420,22,hp/max,'#ff2a3a');
  tx(hp.toLocaleString('ru-RU')+' / '+max.toLocaleString('ru-RU'),270,205,16,'#fff','center');
  tx('Твой урон: '+(O.ownDamage||0).toLocaleString('ru-RU'),270,250,16,'#9ec9ff','center');
  btn(60,320,200,70,'Атака','#ffc030',async()=>{
    const r=await O.attackRaid();toast(r.ok?('Урон '+(r.data&&r.data.damage||'?')):(r.error||'Ошибка'));
  },18);
  btn(280,320,200,70,'Обновить','#4a7aff',async()=>{await O.refreshRaid();toast('OK')},18);
  btn(60,410,420,55,'Join рейд','#b070ff',async()=>{
    const r=await O.joinRaid();toast(r.ok?'Готово':(r.error||'Ошибка'));
  },18);
}


function tower(){
  bg(7,8);back();
  // pixel tower stack
  for(let i=0;i<8;i++){
    const w=40+i*6;
    g.fillStyle=i%2?'#5a6a9a':'#3a4a7a';
    g.fillRect(270-w/2,520-i*48,w,46);
    g.fillStyle='#ffd34a';g.fillRect(270-4,520-i*48+10,8,8);
  }
  g.fillStyle='#8a9acc';g.fillRect(250,100,40,40);
  g.fillStyle='#ff5a7a';g.fillRect(262,88,16,16);
  tx('Башня',270,40,28,'#fff','center');
  // daily reset
  const day=new Date().toDateString();
  if(D.tower.day!==day){D.tower.day=day;D.tower.floor=0;save()}
  const fl=D.tower.floor||0,best=D.tower.best||0;
  panel(40,100,460,200,'#b070ff');
  tx('Ежедневная башня',270,130,20,'#fff','center');
  tx('Этажи: одна жизнь · 10 этажей',270,160,14,'#e0b0ff','center');
  tx('Текущий: '+fl+' / 10',270,200,22,'#ffd34a','center');
  tx('Рекорд: '+best,270,235,16,'#9ec9ff','center');
  const next=Math.min(10,fl+1);
  if(fl>=10){
    tx('Башня на сегодня пройдена!',270,320,18,'#3ad86a','center');
    tx('Завтра этажи сбросятся',270,350,14,'#9ec9ff','center');
  }else{
    btn(90,300,360,70,'Этаж '+next,'#ff5a7a',()=>{
      go(Math.min(9,next-1), next%5, 0, 0, null, next);
    },22);
    tx('Награда: монеты, гемы, на 5/10 — сундук',270,400,13,'#9ec9ff','center');
  }
  btn(90,450,360,55,'Тренировка','#6a8aff',()=>{
    go(3,2,0,1,null,0);
  },16);
}

function modules(){
  bg(2,6);back();tx('Модули оружия',270,40,26,'#fff','center');
  // active synergies
  const eq=D.modules.equip||{};const ownedEq=Object.values(eq).filter(Boolean);
  const active=MODULE_SYNERGY.filter(s=>ownedEq.includes(s.a)&&ownedEq.includes(s.b));
  if(active.length)tx('Синергия: '+active.map(s=>s.name).join(', '),270,92,12,'#ffd34a','center');
  tx(''+D.coins+'  *'+D.gems,270,72,15,'#9ec9ff','center');
  tx('Слоты:',30,110,15,'#ffd34a');
  ['dmg','fire','skill'].forEach((slot,i)=>{
    const mid=eq[slot],m=mid&&MODULES.find(x=>x.id===mid);
    const x=30+i*170;
    panel(x,125,160,70,m?RARITY_COL[m.rarity]:'#334');
    tx({dmg:'Урон',fire:'Темп',skill:'Навык'}[slot],x+80,140,14,'#9ec9ff','center');
    tx(m?m.name:'— пусто —',x+80,165,13,'#fff','center');
    hit(x,120,160,70,()=>{if(m){eq[slot]=null;save();toast('Снят')}});
  });
  let y=210;
  MODULES.forEach(m=>{
    const owned=!!(D.modules.owned&&D.modules.owned[m.id]);
    panel(24,y,492,58,owned?RARITY_COL[m.rarity]:'#2a3050');
    tx(m.name,40,y+20,15,owned?'#fff':'#778');
    const b=m.bonus||{};
    tx(Object.keys(b).map(k=>k+'+'+Math.round(b[k]*100)+'%').join(' '),40,y+42,12,'#9ec9ff');
    if(owned){
      btn(360,y+8,140,42,'Экип.','#3ad86a',()=>{
        const slot=m.slot==='hp'||m.slot==='util'?'skill':m.slot;
        // map util/hp to skill slot if needed - use dmg/fire/skill only
        const sl=['dmg','fire','skill'].includes(m.slot)?m.slot:(eq.skill? (eq.dmg? 'fire':'dmg'):'skill');
        eq[sl]=m.id;save();toast(m.name+' экип.');
      },14);
    }else{
      const price=m.gems?('G'+m.gems):(''+m.cost);
      btn(360,y+8,140,42,price,'#ffc030',()=>{
        if(m.gems){if(D.gems<m.gems){toast('Мало гемов');return}D.gems-=m.gems}
        else{if(D.coins<m.cost){toast('Мало монет');return}D.coins-=m.cost}
        D.modules.owned[m.id]=1;save();beep(700,.1);toast('Куплено');
      },14);
    }
    y+=64;
  });
}

function prestige(){
  bg(5,6);back();drawIcon2D('prest',270,38,1.5);tx('Престиж',270,70,24,'#fff','center');
  const worldsDone=Object.keys(stars).filter(k=>k.endsWith('_'+(STAGES_PER_WORLD-1))).length;
  const pl=D.prestige.level||0,pb=D.prestige.bonus||0;
  panel(40,100,460,280,'#ffc030');
  tx('Звёздный ранг: '+pl,270,140,24,'#fff','center');
  tx('Постоянный бонус: +'+Math.round(pb*100)+'% урона',270,180,16,'#ffd34a','center');
  tx('Пройдено миров (босс): '+worldsDone+'/10',270,220,16,'#fff','center');
  tx('Престиж сбрасывает прогресс кампании,',270,260,14,'#cfe0ff','center');
  tx('монеты/гемы/компаньоны/модули остаются.',270,285,14,'#cfe0ff','center');
  tx('+5% урона и +2.5% HP за каждый ранг.',270,315,14,'#9ec9ff','center');
  if(worldsDone>=10){
    btn(90,360,360,65,'Престиж +1 ранг','#b070ff',()=>{
      if(!confirm('Сбросить кампанию и получить +5% урона навсегда?'))return;
      D.prog={};D.prestige.level=pl+1;D.prestige.bonus=pb+0.05;
      D.xp=0; // keep level
      save();toast('Престиж '+D.prestige.level+'!');beep(900,.3);
    },20);
  }else{
    tx('Нужно победить боссов всех 10 миров',270,380,15,'#ff8a9a','center');
  }
  btn(90,450,360,55,'К мирам','#4a7aff',()=>scr='map',18);
}

function set(){
  bg(3,6);back();tx('Настройки',270,40,28,'#fff','center');
  btn(90,100,360,55,'Плейлист / Музыка','#b070ff',()=>scr='music',18);
  btn(90,165,360,55,'Админ-панель','#ff5a7a',()=>scr='admin',18);
  btn(90,230,360,50,'Промокод','#ffc030',()=>qolDailyCode(),16);
  btn(90,290,360,50,'Быстрый ремонт (+30% HP в бою)','#3ad86a',()=>{D.quickRepair=true;save();toast('В бою 1 раз +30% HP')},14);
  btn(90,350,360,50,'Удвоить XP сезона (1 бой)','#b070ff',()=>{D.seasonBoost=true;save();toast('След. бой x2 season XP')},14);
  btn(90,140,360,70,'Звук: '+(D.snd?'вкл':'выкл'),'#4a7aff',()=>{D.snd^=1;save()});
  btn(90,230,360,70,'Музыка: '+(D.mus?'вкл':'выкл'),'#4a7aff',()=>{D.mus^=1;save()});
  btn(90,320,360,60,'Онлайн','#4a7aff',()=>scr='online');
  btn(90,395,360,60,'Сбросить прогресс','#ff5a7a',()=>{if(confirm('Стереть весь прогресс?')){localStorage.removeItem('po10');location.reload()}});
}

/* ===== BATTLE ===== */
function go(w,s,endless,trial,eventMode,towerFloor){
  const cb=companionBonus();
  D.fenixUsed=false;
  B={w,s,endless,trial,eventMode:eventMode||null,tower:towerFloor|0,boss:!endless&&!towerFloor&&((s===STAGES_PER_WORLD-1)||((s+1)%5===0)),wave:0,waves:towerFloor?1:(endless?999:((s===STAGES_PER_WORLD-1)?1:2+Math.min(4,(s/5|0)))),q:[],qt:0,diff:1+w*.4+s*.06+(trial?.55:0)+((eventMode&&eventMode.diff)?(eventMode.diff-1):0),rc:0,rg:0,over:0,pause:0,auto:0,wt:1,t:0,cb,stageBoss:(s===STAGES_PER_WORLD-1),miniBoss:((s+1)%5===0&&s!==STAGES_PER_WORLD-1)};
  const mh=Math.floor(((trial?55:100)+20*D.uh+bldLvl('dome')*20)*(1+cb.hp));
  P={x:270,y:H-220,hp:mh,mhp:mh,inv:0,fire:0,pw:1,dmg:10*(1+.18*D.ud)*(1+cb.dmg)};
  if(D.quickRepair){P.hp=Math.min(P.mhp,P.hp+P.mhp*0.3);D.quickRepair=false;save()}
  bl=[];eb=[];en=[];pk=[];fx=[];scr='battle';
}
function nextWave(){
  const n=++B.wave;
  if(B.tower){
    const f=B.tower;const hp=(400+f*220)*B.diff;
    if(f%3===0){en.push({boss:1,btype:Math.min(9,f%10),x:270,y:-120,hp,mhp:hp,r:80,t:0,sc:1,col:WC[f%10]});B.bn='Страж этажа '+f;B.btype=f%10}
    else{B.q=[];for(let i=0;i<4+f;i++)B.q.push({ty:Math.min(5,Math.random()*(1.5+f*.25)|0),x:60+Math.random()*420})}
    return;
  }
  if(B.boss||(B.endless&&n%5==0)){
    const i=B.endless?(n/5|0)%10:B.w;const stageMul=1+((B.s||0)/STAGES_PER_WORLD)*1.2;const hp=(B.boss?(B.stageBoss?2800:1800)+B.w*150:1100+n*180)*B.diff*stageMul;
    en.push({boss:1,btype:i%10,x:270,y:-120,hp,mhp:hp,r:85,t:0,sc:1,col:WC[i%10]});B.bn=BN[i%10];B.btype=i%10;
  }else{B.q=[];for(let i=0;i<5+n*2;i++)B.q.push({ty:Math.min(5,Math.random()*(1.2+n*.4+(B.s||0)*.05)|0),x:60+Math.random()*420})}
}
const ab=(x,y,a,s)=>eb.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s});
const aim=(x,y,s,o=0)=>ab(x,y,Math.atan2(P.y-y,P.x-x)+o,s);
function boom(x,y,c,n=14){for(let i=0;i<n;i++){const a=Math.random()*7,v=40+Math.random()*180;fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5,c})}}
function hurt(e,d){e.hp-=d;e.fl=.07;if(e.hp<=0&&!e.dead){e.dead=1;B.rc+=e.boss?280:3+B.wave;D.kills++;track('kills');if(e.boss){D.bosses++;track('boss');if(B&&B.eventMode&&B.eventMode.track==='boss'){const es=ensureEventState();es.prog=(es.prog||0)+1;save()}}boom(e.x,e.y,e.boss?'#ffd36b':'#ff8a6a',e.boss?55:12);beep(e.boss?90:180,.2,.08);shake=e.boss?12:2;if(!e.boss&&Math.random()<.12)pk.push({x:e.x,y:e.y,t:Math.random()*3|0})}}
function dmgP(d){if(P.inv>0)return;P.hp-=d;shake=7;P.inv=.5;beep(120,.15,.08);try{navigator.vibrate(15)}catch(e){}}

function useCompanionSkill(slot){
  if(!B||B.pause||B.over||!P)return;
  const id=(D.equip||[])[slot];if(!id)return;
  const ch=CHARS.find(x=>x.id===id);if(!ch||!ch.skill)return;
  B.skillCd=B.skillCd||[0,0];
  if(B.skillCd[slot]>0){toast('Перезарядка');return}
  const sk=ch.skill;
  const cdMul=1-((B.cb&&B.cb.skill)||0);
  B.skillCd[slot]=Math.max(4,sk.cd*cdMul);
  beep(500,.15);
  const sid=sk.id;
  if(sid==='spark_shot'||sid==='shadow'||sid==='comet'){
    for(let i=0;i<8;i++)bl.push({x:P.x,y:P.y-20,vx:(i-3.5)*70,vy:-400-Math.random()*100,d:P.dmg*(sid==='shadow'?4:2.5),m:0});
  }else if(sid==='ice_shield'||sid==='fortify'){P.inv=sid==='fortify'?5:3;if(sid==='fortify')P.hp=Math.min(P.mhp,P.hp+P.mhp*0.1)}
  else if(sid==='fire_wave'){for(let k=-4;k<=4;k++)bl.push({x:P.x,y:P.y-10,vx:k*50,vy:-350,d:P.dmg*3})}
  else if(sid==='heal'){P.hp=Math.min(P.mhp,P.hp+P.mhp*0.25);toast('+HP')}
  else if(sid==='pulse_cd'){D.sk.m+=1;D.sk.n+=1;D.sk.s+=1;toast('Навыки +1')}
  else if(sid==='orbit_ring'||sid==='nova'){fx.push({ring:1,x:P.x,y:P.y,l:.55});en.forEach(e=>hurt(e,P.dmg*(sid==='nova'?22:12)));shake=8}
  else if(sid==='eclipse'){en.forEach(e=>{if(e.boss)hurt(e,P.dmg*35);else hurt(e,P.dmg*8)})}
  else if(sid==='slow'){B.slowT=4;toast('Замедление')}
  else if(sid==='quake'){en.forEach(e=>{e.sc=Math.max(e.sc,1.2);hurt(e,P.dmg*6)});shake=10}
  else if(sid==='rebirth'){toast('Феникс готов')}
  else if(sid==='starfall'){for(let i=0;i<16;i++)bl.push({x:40+Math.random()*460,y:-20-Math.random()*80,vx:(Math.random()-.5)*40,vy:200+Math.random()*100,d:P.dmg*2.2})}
  else if(sid==='d56_core'){P.inv=3;P.hp=Math.min(P.mhp,P.hp+P.mhp*0.15);for(let i=0;i<12;i++)bl.push({x:P.x,y:P.y-15,vx:(i-5.5)*55,vy:-420,d:P.dmg*3.5});shake=10}
  toast(ch.name+': '+sk.name);
}
function useA(k){
  if(!B||B.pause||B.over||(D.sk[k]|0)<1)return;D.sk[k]--;beep(500,.2);
  if(k=='m'){for(let i=0;i<6;i++)bl.push({x:P.x,y:P.y-20,vx:(i-2.5)*90,vy:-300,d:P.dmg*5.5,m:1})}
  else if(k=='n'){fx.push({ring:1,x:P.x,y:P.y,l:.55});en.forEach(e=>hurt(e,e.boss?P.dmg*18:P.dmg*28));eb=[];shake=9}
  else if(k=='s')P.inv=5;
  else if(k=='b'){en.forEach(e=>{if(!e.boss)hurt(e,P.dmg*12)});boom(P.x,P.y-80,'#ff6a3a',30);shake=8}
}
function upd(dt){
  B.t+=dt;if(B.pause||B.over)return;P.inv-=dt;
  if(B.skillCd){B.skillCd[0]=Math.max(0,B.skillCd[0]-dt);B.skillCd[1]=Math.max(0,B.skillCd[1]-dt)}
  // auto cast companion skills when ready and enemies present
  if(en.length&&B.skillCd){for(let si=0;si<2;si++){if(B.skillCd[si]<=0&&(D.equip||[])[si]){const ch=CHARS.find(x=>x.id===D.equip[si]);if(ch&&ch.skill&&Math.random()<0.006)useCompanionSkill(si)}}}
  // companion auto-shots
  B._cf=B._cf||[0,0];
  (D.equip||[]).forEach((id,si)=>{
    if(!id||!en.length||P.hp<=0)return;
    const ch=CHARS.find(x=>x.id===id);if(!ch)return;
    B._cf[si]=(B._cf[si]||0)-dt;
    if(B._cf[si]>0)return;
    B._cf[si]=1.1-(ch.rarity||1)*0.12;
    const ox=(si===0?-55:55);
    const target=en[0];
    const ang=Math.atan2(target.y-(P.y-10),target.x-(P.x+ox));
    const spd=320+ch.rarity*30;
    const dmg=P.dmg*(0.35+ch.rarity*0.12);
    bl.push({x:P.x+ox,y:P.y-10,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,d:dmg,m:0,col:ch.col});
  });
  if(B.slowT>0)B.slowT-=dt;
  if(B.auto){let tx_=270,bd=1e9;en.forEach(e=>{const d=Math.abs(e.y-P.y);if(d<bd&&e.y>0){bd=d;tx_=e.x}});eb.forEach(b=>{if(b.y<P.y&&b.y>P.y-160&&Math.abs(b.x-P.x)<50)tx_=P.x+(b.x<P.x?80:-80)});P.x+=(tx_-P.x)*Math.min(1,4*dt)}
  P.x=Math.max(25,Math.min(515,P.x));P.y=Math.max(120,Math.min(H-150,P.y));
  const fireRate=.2*(1-(B.cb?.fire||0));
  P.fire-=dt;if(P.fire<=0){P.fire=Math.max(.08,fireRate);const n=P.pw+1;for(let i=0;i<n&&i<5;i++){const o=i-(Math.min(n,5)-1)/2;bl.push({x:P.x+o*13,y:P.y-30,vx:o*45,vy:-900,d:P.dmg})}beep(880,.03,.012)
  // companion support shots occasionally
  if(B.cb&&B.cb.dmg>0.1&&Math.random()<0.08)bl.push({x:P.x+(Math.random()-.5)*40,y:P.y-20,vx:(Math.random()-.5)*60,vy:-700,d:P.dmg*0.6})}
  if(B.q.length){B.qt-=dt;if(B.qt<=0){const q=B.q.shift(),h=([28,42,110,55,35,90][q.ty]||40)*B.diff*(1+B.wave*.09);en.push({ty:q.ty,x:q.x,y:-40,hp:h,mhp:h,r:([22,22,30,20,16,26][q.ty]||20),t:0,sc:1,col:(EP[q.ty]||EP[0]).a});B.qt=.5}}
  en.forEach(e=>{
    const sdt=dt*((B.slowT>0&&!e.boss)?0.45:1);
    e.t+=sdt;e.fl-=dt;
    if(e.boss){
      const ty=e.btype|0, f=e.hp/e.mhp;
      // movement by type
      if(ty===6){ // archon teleports
        e.y=Math.min(210,e.y+90*dt);
        if(e.sc<=0&&Math.random()<.02){e.x=80+Math.random()*380;boom(e.x,e.y,e.col,8)}
        else e.x+=(270+Math.sin(e.t)*120-e.x)*1.5*dt;
      }else if(ty===5){ // titan slow heavy
        e.y=Math.min(240,e.y+50*dt);e.x=270+Math.sin(e.t*.35)*80;
      }else if(ty===8){ // abyss drifts + pull
        e.y=Math.min(220,e.y+60*dt);e.x=270+Math.sin(e.t*.5)*160;
        if(e.y>180){P.x+=(e.x-P.x)*0.35*dt} // gravity pull
      }else if(ty===7){ // plasma circles
        e.y=Math.min(200,e.y+70*dt);e.x=270+Math.cos(e.t*.9)*170;
      }else{
        e.y=Math.min(230,e.y+75*dt);e.x=270+Math.sin(e.t*.7)*145;
      }
      e.sc-=dt;
      if(e.y>=199&&e.sc<=0){
        // unique attack patterns
        if(ty===0){ // spreader fan
          e.sc=f>.5?1.0:.55;for(let k=-4;k<=4;k++)ab(e.x,e.y+40,Math.PI/2+k*.18,210+f*40);
        }else if(ty===1){ // crystal shards + aim
          e.sc=f>.4?.9:.5;
          for(let k=0;k<8;k++)ab(e.x,e.y,e.t+k*Math.PI/4,160);
          if(f<.7)aim(e.x,e.y,280);
        }else if(ty===2){ // fire spiral + wave
          e.sc=f>.5?.85:.4;
          for(let k=0;k<10;k++)ab(e.x,e.y+20,e.t*3+k*.6,190);
          if(f<.45)for(let k=-2;k<=2;k++)ab(e.x,e.y+40,Math.PI/2+k*.3,250);
        }else if(ty===3){ // ice beams slow
          e.sc=f>.5?1.1:.6;
          for(let k=-1;k<=1;k++)ab(e.x,e.y+30,Math.PI/2+k*.12,320); // fast thin beams
          if(Math.hypot(e.x-P.x,e.y-P.y)<220)P.x+=(P.x-e.x>0?1:-1)*40*dt; // push/slow feel
        }else if(ty===4){ // gate spawner
          e.sc=f>.5?1.2:.7;
          aim(e.x,e.y,240);aim(e.x,e.y,240,.35);aim(e.x,e.y,240,-.35);
          if(Math.random()<.35)en.push({ty:Math.random()<.5?0:1,x:60+Math.random()*420,y:-30,hp:35*B.diff,mhp:35*B.diff,r:22,t:0,sc:1});
        }else if(ty===5){ // titan slam ring + burst
          e.sc=f>.55?1.4:.65;
          fx.push({ring:1,x:e.x,y:e.y,l:.5});
          for(let k=0;k<16;k++)ab(e.x,e.y,k*Math.PI/8,170);
          if(f<.4){for(let k=-3;k<=3;k++)ab(e.x,e.y+50,Math.PI/2+k*.15,280)}
          shake=Math.max(shake,6);
        }else if(ty===6){ // archon cross lasers + teleport shot
          e.sc=f>.5?.7:.35;
          ab(e.x,e.y,0,300);ab(e.x,e.y,Math.PI/2,300);ab(e.x,e.y,Math.PI,300);ab(e.x,e.y,-Math.PI/2,300);
          aim(e.x,e.y,260);aim(e.x,e.y,260,.4);aim(e.x,e.y,260,-.4);
        }else if(ty===7){ // plasma homing-ish
          e.sc=f>.5?.8:.4;
          for(let k=0;k<5;k++){const a=Math.atan2(P.y-e.y,P.x-e.x)+(k-2)*.25;ab(e.x,e.y,a,200)}
          if(f<.35)for(let k=0;k<12;k++)ab(e.x,e.y,e.t+k*Math.PI/6,150);
        }else if(ty===8){ // abyss pull already in move; dark nova
          e.sc=f>.5?1.0:.45;
          for(let k=0;k<14;k++)ab(e.x,e.y,e.t*.5+k*Math.PI/7,140+f*80);
          if(f<.3&&Math.random()<.3){en.push({ty:2,x:e.x,y:e.y,hp:50*B.diff,mhp:50*B.diff,r:28,t:0,sc:1})}
        }else{ // emperor hybrid
          e.sc=f>.66?1.0:f>.33?.55:.28;
          if(f>.66){for(let k=-3;k<=3;k++)ab(e.x,e.y+40,Math.PI/2+k*.2,230)}
          else if(f>.33){for(let k=0;k<12;k++)ab(e.x,e.y,e.t+k*Math.PI/6,190);aim(e.x,e.y,270)}
          else{for(let k=0;k<16;k++)ab(e.x,e.y,k*Math.PI/8,210);aim(e.x,e.y,300);if(Math.random()<.08)en.push({ty:0,x:e.x,y:e.y,hp:30*B.diff,mhp:30*B.diff,r:22,t:0,sc:1})}
        }
      }
    }
    else if(e.ty==0){e.y+=105*dt;e.x+=Math.sin(e.t*3)*65*dt}
    else if(e.ty==1){if(e.y<150)e.y+=125*dt;else e.x+=Math.sin(e.t*1.5)*120*dt;e.sc-=dt;if(e.sc<=0){e.sc=1.7;aim(e.x,e.y,240)}}
    else{e.y+=52*dt;e.sc-=dt;if(e.sc<=0){e.sc=2.2;for(let k=-1;k<2;k++)aim(e.x,e.y,210,k*.28)}}
    if(e.y>H+50)e.dead=1;
    if(!e.dead&&Math.hypot(e.x-P.x,e.y-P.y)<e.r+14){if(!e.boss){e.dead=1;boom(e.x,e.y,'#ff8a6a');dmgP(18)}else dmgP(.45)}
  });
  bl.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.m){let t=null,bd=1e9;en.forEach(e=>{const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bd&&!e.dead){bd=d;t=e}});if(t){b.vx+=(t.x-b.x)*6*dt;b.vy=Math.max(-700,Math.min(700,b.vy+(t.y-b.y)*6*dt))}}
    for(const e of en)if(!e.dead&&Math.abs(e.x-b.x)<e.r+4&&Math.abs(e.y-b.y)<e.r+8){hurt(e,b.d);b.dead=1;break}if(b.y<-20)b.dead=1});
  eb.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;if(Math.hypot(b.x-P.x,b.y-P.y)<14){b.dead=1;dmgP(11)}if(b.y>H+20||b.y<-30||b.x<-30||b.x>570)b.dead=1});
  pk.forEach(p=>{p.y+=105*dt;const d=Math.hypot(p.x-P.x,p.y-P.y);if(d<85)p.x+=(P.x-p.x)*5*dt;if(d<28){p.dead=1;beep(1200,.1);if(p.t==0)P.hp=Math.min(P.mhp,P.hp+28);else if(p.t==1)P.pw=Math.min(4,P.pw+1);else B.rg+=1}if(p.y>H+20)p.dead=1});
  fx.forEach(f=>{f.l-=dt;if(!f.ring){f.x+=f.vx*dt;f.y+=f.vy*dt}});
  bl=bl.filter(b=>!b.dead);eb=eb.filter(b=>!b.dead);pk=pk.filter(p=>!p.dead);fx=fx.filter(f=>f.l>0);
  en=en.filter(e=>!e.dead);shake=Math.max(0,shake-dt*28);
  if(P.hp<=0){if(!D.fenixUsed&&(D.equip||[]).some(id=>id==='fenix')){D.fenixUsed=true;P.hp=P.mhp*0.4;P.inv=2;toast('Феникс!');beep(300,.3)}else{P.hp=0;end(0)}}
  else if(!B.q.length&&!en.length){B.wt-=dt;if(B.wt<=0){if(B.wave>=B.waves)end(1);else{nextWave();B.wt=1.4}}}
}
function end(win){
  B.over=1;B.win=win;B.st=B.st||0;const full=!stars[key(B.w,B.s)];
  let c=B.rc,gm=B.rg;
  const coinMult=(1+(B.cb?.coin||0))*(B.eventMode&&B.eventMode.coinMul||1);
  if(win&&!B.endless){B.st=P.hp/P.mhp>.7?3:P.hp/P.mhp>.35?2:1;const k=key(B.w,B.s);stars[k]=Math.max(stars[k]||0,B.st);
    const bs=B.s===STAGES_PER_WORLD-1;const ms=B.miniBoss;c+=Math.floor((bs?600:ms?320:160)*(full?1:.25)*coinMult);gm+=(bs?50:ms?18:6)*(full?1:.25)|0;D.xp+=Math.floor((35+B.w*2)*(B.eventMode&&B.eventMode.xpMul||1));track('stages');
    if(B.eventMode){const es=ensureEventState();if(B.eventMode.track==='stages'){es.prog=(es.prog||0)+1;save()}if(B.eventMode.track==='boss'&&B.boss){es.prog=(es.prog||0)+1;save()}}
    if(bs){D.chests=(D.chests||0)+1+bldLvl('chest');toast('Сундук за босса!')}
    if(D.xp>=D.lv*100){D.xp-=D.lv*100;D.lv++}}
  if(B.endless)D.best=Math.max(D.best,B.wave);
  if(B.arena&&win){D.arenaBest=Math.max(D.arenaBest||0,B.wave||5);D.eventCur=(D.eventCur||0)+15;D.gems+=5}
  if(win){let sx=20+(B.wave||1)*3+(B.boss?40:0);if(D.seasonBoost){sx*=2;D.seasonBoost=false}D.season.xp=(D.season.xp||0)+sx}
  if(B.raidBoss){
    // damage dealt = maxhp - remaining style from B
    const dealt=Math.max(500, Math.floor((B.rc||0)*15 + (win?2000:400) + D.lv*50));
    D.eventRaid.bossHp=Math.max(0,(D.eventRaid.bossHp|0)-dealt);
    D.eventRaid.totalDmg=(D.eventRaid.totalDmg|0)+dealt;
    D.eventCur=(D.eventCur||0)+Math.floor(dealt/500)+5;
    toast('Урон рейду: '+dealt);
  }
  if(B.tower&&win){
    D.tower.floor=Math.max(D.tower.floor||0,B.tower);
    D.tower.best=Math.max(D.tower.best||0,B.tower);
    const tc=80+B.tower*40,tg=1+(B.tower%5===0?5:0);
    B.gc=(B.gc||0)+tc;B.gg=(B.gg||0)+tg;
    if(B.tower%5===0)D.chests=(D.chests||0)+1;
  }
  B.gc=Math.floor((Number(c)||0)*coinMult)||0;B.gg=Number(gm)||0;D.coins=(D.coins||0)+B.gc;D.gems=(D.gems||0)+B.gg;save();
}
function battle(){
  bg(B.w%10,B.endless?240:190);g.save();if(shake)g.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  pk.forEach(p=>tx(['HP','*','G'][p.t],p.x,p.y,24,'#fff','center'));
  en.forEach(e=>{if(e.boss)boss(e.x,e.y,e.t,e.col,e.btype);else if(!drawSpr('enemy'+Math.min(5,e.ty|0),e.x,e.y,e.ty==2?1.3:1.1))spr(EM[Math.min(EM.length-1,e.ty|0)]||EM[0],EP[Math.min(EP.length-1,e.ty|0)]||EP[0],e.x,e.y,e.ty==2?7:6);if(e.fl>0){g.globalAlpha=.5;g.fillStyle='#fff';g.beginPath();g.arc(e.x,e.y,e.r,0,7);g.fill();g.globalAlpha=1}});
  g.globalCompositeOperation='lighter';
  bl.forEach(b=>{g.fillStyle=b.m?'#ffd23a':'#38d8ff';g.shadowColor=g.fillStyle;g.shadowBlur=9;g.fillRect(b.x-2.5,b.y-14,5,b.m?18:24)});g.shadowBlur=0;
  eb.forEach(b=>{const q=g.createRadialGradient(b.x,b.y,0,b.x,b.y,10);q.addColorStop(0,'#fff');q.addColorStop(.4,'#ff3a5a');q.addColorStop(1,'rgba(255,40,80,0)');g.fillStyle=q;g.fillRect(b.x-10,b.y-10,20,20)});
  fx.forEach(f=>{if(f.ring){g.strokeStyle='#5ff6ff';g.lineWidth=7;g.globalAlpha=f.l*1.4;g.beginPath();g.arc(f.x,f.y,(.55-f.l)*1000,0,7);g.stroke();g.globalAlpha=1}else{g.globalAlpha=f.l*2;g.fillStyle=f.c;g.fillRect(f.x-3,f.y-3,6,6);g.globalAlpha=1}});
  g.globalCompositeOperation='source-over';
  // draw equipped companions near ship
  (D.equip||[]).forEach((id,i)=>{
    if(!id||P.hp<=0)return;
    const ch=CHARS.find(x=>x.id===id);if(!ch)return;
    const ox=(i===0?-55:55)+Math.sin(T*2+i)*6,oy=-10+Math.cos(T*1.5+i)*4;
    if(SPR[ch.id]&&drawSpr(ch.id,P.x+ox,P.y+oy,0.9)){}else if(CSPR[ch.id])drawPix(CSPR[ch.id],CPAL,P.x+ox,P.y+oy,3.5);else{g.fillStyle=ch.col;g.fillRect(P.x+ox-8,P.y+oy-8,16,16)}
  });
  if(P.hp>0){if(P.inv<=0||(B.t*20|0)%2){if(!drawSpr('ship',P.x,P.y,1.15))spr(SHIP,SPAL,P.x,P.y,5);const fl=5+Math.random()*7;g.fillStyle='#ffb04a';g.fillRect(P.x-10,P.y+30,5,fl);g.fillRect(P.x+5,P.y+30,5,fl)}
  if(P.inv>.55){g.strokeStyle='#5affb0';g.lineWidth=3.5;g.shadowColor='#5affb0';g.shadowBlur=12;g.beginPath();g.arc(P.x,P.y,44,0,7);g.stroke();g.shadowBlur=0}}g.restore();
  panel(12,12,50,50,'#4a9aff');if(typeof drawIco==='function')drawIco('pause',37,37,4);else drawIcon2D('pause',37,37,1.2);hit(12,12,50,50,()=>{if(!B.over)B.pause=1});
  const be=en.find(e=>e.boss);if(be){tx(B.bn,70,24,16);bar(70,40,320,16,be.hp/be.mhp,'#ff2a3a');tx(Math.ceil(be.hp/be.mhp*100)+'%',230,49,12,'#fff','center');const tips=['Веер','Кристаллы','Спираль','Лёд','Порталы','Таран','Телепорт','Плазма','Притяжение','Гибрид'];tx(tips[be.btype|0]||'',400,24,13,'#9ec9ff')}
  else bar(70,38,190,13,P.hp/P.mhp,'#3ad86a');
  panel(415,12,112,38,'#4a9aff');tx(B.endless?'Волна '+B.wave:'Волна '+B.wave+'/'+B.waves,471,32,15,'#fff','center');
  if(!be)tx('❤ '+Math.ceil(P.hp)+'  '+B.rc,70,65,15,'#fff');
  [['m','sword'],['n','boss'],['s','tower'],['b','chest']].forEach((a,i)=>{const x=12+i*78,y=H-86;panel(x,y,70,70,D.sk[a[0]]?'#3ad8ff':'#445');if(typeof drawIco==='function')drawIco(a[1]==='sword'?'rocket':a[1]==='boss'?'boom':a[1]==='tower'?'shield':'bomb',x+35,y+30,4);else drawIcon2D(a[1],x+35,y+28,1.4);tx(''+D.sk[a[0]],x+55,y+58,13,'#ffd34a','center');hit(x,y,70,70,()=>useA(a[0]))});
  btn(340,H-82,185,62,B.auto?'АВТО: ВКЛ':'АВТО БОЙ',B.auto?'#3aff9a':'#b070ff',()=>B.auto^=1,16);
  // companion skills
  for(let si=0;si<2;si++){
    const id=(D.equip||[])[si];if(!id)continue;
    const ch=CHARS.find(x=>x.id===id);if(!ch||!ch.skill)continue;
    const x=12+si*78,y=H-170;
    const cd=(B.skillCd&&B.skillCd[si])||0;
    panel(x,y,70,55,cd>0?'#445':'#c04aff');
    if(CSPR[ch.id])drawPix(CSPR[ch.id],CPAL,x+35,y+22,2);
    tx(cd>0?(''+Math.ceil(cd)):ch.skill.name.slice(0,4),x+35,y+44,11,'#fff','center');
    hit(x,y,70,55,()=>useCompanionSkill(si));
  }
  if(B.pause||B.over){g.fillStyle='rgba(2,4,20,.72)';g.fillRect(0,0,540,H)}
  if(B.pause){tx('ПАУЗА',270,290,38,'#fff','center');btn(110,350,320,65,'Продолжить','#3ad8ff',()=>B.pause=0);btn(110,435,320,65,'В меню','#ff5a7a',()=>scr='home')}
  else if(B.over){tx(B.win?'ПОБЕДА!':(B.endless?'Волна '+B.wave:'ПОРАЖЕНИЕ'),270,250,40,B.win?'#ffd34a':'#ff5a7a','center');tx(String.fromCharCode(9733).repeat(B.win?(B.st||1):0)+String.fromCharCode(9734).repeat(B.win?Math.max(0,3-(B.st||1)):3),270,315,36,'#ffd34a','center');
  tx('Монеты '+(B.gc|0)+'   Гемы '+(B.gg|0),270,380,22,'#fff','center');
  btn(110,440,320,65,B.win&&!B.endless&&B.s<STAGES_PER_WORLD-1?'Дальше':'Повторить','#ffc030',()=>{const n=B.win&&!B.endless&&B.s<STAGES_PER_WORLD-1?B.s+1:B.s;if(B.win&&!B.endless&&B.s===STAGES_PER_WORLD-1){sel=0;scr='map'}else{sel=n;go(B.w,n,B.endless,B.trial)}},24);btn(110,525,320,60,'В меню','#4a7aff',()=>{sel=B.s;scr=B.endless||B.trial?'home':'map'})}
}

/* Music */
let mi=0;const CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62],[60,64,67],[52,55,59],[50,53,57]];
setInterval(()=>{if(!D.mus||!D.snd||!ac)return;const c=CH[(mi>>4)%CH.length],n=c[mi%3]+(mi%8>5?12:0);beep(440*2**((n-69)/12),.13,.016);if(mi%4==0)beep(440*2**((c[0]-24-69)/12),.28,.028);mi++},165);

/* Loop */
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;T+=dt;toastT-=dt;btns=[];g.clearRect(0,0,540,H);g.imageSmoothingEnabled=false;
if(scr=='battle')upd(dt);
const __sc={home,map,shop,battle,contracts,rank,set,chests,station,profile,skins,online,friends,friendProfile,raid,event:eventScreen,eventShop,eventBoss,tower,modules,prestige,daily,arena,season:seasonPass,clan:clanScreen,baseRaid,weeklyBoss,music:musicScreen,admin:adminPanel,modes,social,more};
try{(typeof __sc[scr]==='function'?__sc[scr]:home)()}catch(err){console.error(scr,err);bg(0,4);tx('Ошибка UI',270,380,22,'#ff5a7a','center');tx(String(err&&err.message||err).slice(0,50),270,420,13,'#ff8a9a','center');btn(120,480,300,55,'В меню','#4a7aff',()=>{scr='home'})}
if(toastT>0){panel(80,H/2-24,380,48,'#ffd34a');tx(toastS,270,H/2,18,'#fff','center')}
requestAnimationFrame(loop)}
let drag=null;
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*540,(e.clientY-r.top)/r.height*H]}
cv.addEventListener('pointerdown',e=>{const[x,y]=pos(e);for(let i=btns.length-1;i>=0;i--){const b=btns[i];if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){beep(660,.05);b.fn();return}}
if(scr=='battle'&&drag===null){drag=e.pointerId;cv.setPointerCapture(e.pointerId)}});
cv.addEventListener('pointermove',e=>{if(e.pointerId===drag&&P&&B&&!B.pause&&!B.over&&!B.auto){const r=cv.getBoundingClientRect();P.x+=e.movementX/r.width*540;P.y+=e.movementY/r.width*540}if((scr==='station'||scr==='home')&&e.buttons){stationCam.x+=e.movementX*0.55;stationCam.y+=e.movementY*0.55;stationCam.x=Math.max(-200,Math.min(200,stationCam.x));stationCam.y=Math.max(-180,Math.min(140,stationCam.y))}});
const up=e=>{if(e.pointerId===drag)drag=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
requestAnimationFrame(loop);
