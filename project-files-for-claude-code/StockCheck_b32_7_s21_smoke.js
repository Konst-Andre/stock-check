/* StockCheck · b32.7 · s21 smoke (s17 + П-7 + Х-2 + Х-3) — «лічильник Історія бреше»
   живе доки: О-53 не закрито device-тестом і не внесено в самері b32.3.
   Запуск: node StockCheck_b32_3_visitcount_smoke.js <файл.html>            */
const fs=require('fs');
const F=process.argv[2]||'StockCheck_port_b32_3_s17_visitcount.html';
const S=fs.readFileSync(F,'utf8');
let ok=0,bad=0;
const t=(n,c)=>{c?(ok++,console.log('  ✓ '+n)):(bad++,console.log('  ✗ '+n));};

/* ── A · предикат витягується з ЖИВОГО файлу, не переписується в тесті ───── */
const m=S.match(/function hasData\(v\)\{[^\n]*\}/);
if(!m){console.log('✗ hasData не знайдено');process.exit(1);}
const hasData=eval('('+m[0].replace(/^function hasData/,'function')+')');

console.log('\n[A] предикат hasData');
t('порожній vals → false',            hasData({vals:{},transferred:false})===false);
t('vals відсутній → false',           hasData({transferred:false})===false);
t('null → false',                     hasData(null)===false);
t('одне значення → true',             hasData({vals:{k1:5},transferred:false})===true);
/* 0 — валідний залишок (.is-zero). Truthy-тест зламав би саме цей кейс. */
t('значення 0 → true (НЕ truthy)',    hasData({vals:{k1:0},transferred:false})===true);
t('порожній + transferred → true',    hasData({vals:{},transferred:true})===true);

/* ── B · сценарій оператора: калькулятор при завідуючій ──────────────────── */
console.log('\n[B] сценарій «ввів → стер → вийшов», 3 доби');
const visits=[
  {date:'2026-08-11',vals:{},transferred:false},   // ввів і стер
  {date:'2026-08-12',vals:{},transferred:false},   // «Очистити підрахунок»
  {date:'2026-08-13',vals:{},transferred:false}    // ввів і стер
];
t('бейдж: було 3 → стало 0',          visits.filter(hasData).length===0);
t('журнал: 3 рядки → 0',              visits.filter(hasData).length===0);
t('clearData: аптека не рахується',   visits.some(hasData)===false);

console.log('\n[B2] змішаний масив — реальні візити не з\'їдаються');
const mix=[
  {date:'2026-08-10',vals:{k1:12},transferred:true},   // idx 0 · реальний
  {date:'2026-08-11',vals:{},transferred:false},       // idx 1 · артефакт
  {date:'2026-08-12',vals:{k1:0,k2:3},transferred:false} // idx 2 · реальний, є 0
];
t('рахується 2 з 3',                  mix.filter(hasData).length===2);
t('transferred вцілів',               hasData(mix[0])===true);
t('візит з нулем вцілів',             hasData(mix[2])===true);

/* ── C · ІНВАРІАНТ IDX: гвард мусить стояти ВСЕРЕДИНІ forEach ───────────── */
console.log('\n[C] інваріант idx (р.3866 читає e.visits[r.idx] прямим індексом)');
const vm=S.match(/e\.visits\.forEach\(function\(v,i\)\{([\s\S]{0,400}?)out\.push/);
t('гвард всередині forEach',          !!vm && /if\(!hasData\(v\)\)return;/.test(vm[1]));
t('idx лишився оригінальним i',       /idx:i,/.test(S));
t('НЕМА .filter(hasData).forEach',    !/visits\.filter\(hasData\)\.forEach/.test(S));
const survivors=[...mix.entries()].filter(([i,v])=>hasData(v)).map(([i])=>i);
t('вцілілі несуть idx 0 і 2',         JSON.stringify(survivors)==='[0,2]');

/* ── D · усі п'ять читачів на одній мірці ───────────────────────────────── */
console.log('\n[D] читачі');
t('phState → hasData',                /transferred\?'transferred':\(hasData\(v\)\?'ready':'new'\)/.test(S));
t('homeModel → filter(hasData)',      /visits=\(e&&e\.visits\)\?e\.visits\.filter\(hasData\)\.length:0/.test(S));
t('clearData → some(hasData)',        /e\.visits\.some\(hasData\)/.test(S));
t('visitModel → guard',               /if\(!hasData\(v\)\)return;/.test(S));
t('жоден читач не лишив visits.length як мірку кількості',
   !/visits=\(e&&e\.visits\)\?e\.visits\.length:0/.test(S));

/* ── E · гварди на порожній масив НЕ зачеплені (це не мірки) ─────────────── */
console.log('\n[E] guard-и доступу лишились недоторкані');
t('todayVisit guard',                 /function todayVisit\(px\)\{var e=ST\.phs\[px\];if\(!e\|\|!e\.visits\|\|!e\.visits\.length\)return null;/.test(S));
t('phState guard',                    /function phState\(px\)\{var e=ST\.phs\[px\];if\(!e\|\|!e\.visits\|\|!e\.visits\.length\)return'new';/.test(S));
t('visitModel guard',                 /if\(!e\|\|!e\.visits\|\|!e\.visits\.length\)return;/.test(S));

/* ── F · крок 2 ще НЕ зроблено — писач лишається як був ─────────────────── */
console.log('\n[F] ensureVisit не переписувався (крок 2 діє ПІСЛЯ нього, не замість)');
t('ensureVisit незмінний',            /arr\.push\(nv\);return nv;\}/.test(S));
t('onInput досі кличе ensureVisit',   /var vis=ensureVisit\(curPx\);/.test(S));
t('очищення досі спорожнює vals',     /v\.vals=\{\};v\.transferred=false;/.test(S));

/* ══════════════════════════════════════════════════════════════════════════
   КРОК 2 · ПИСАЧ + МІГРАЦІЯ. Секції G-J додані після device✓ кроку 1.
   ══════════════════════════════════════════════════════════════════════════ */
const TODAY='2026-08-14';
const pmatch=S.match(/function pruneVisit\(px\)\{[\s\S]*?\n\}/);
const smatch=S.match(/function pruneStore\(\)\{[\s\S]*?\n\}/);
console.log('\n[G] pruneVisit — писач');
t('pruneVisit існує', !!pmatch);
t('pruneStore існує', !!smatch);
t('prune тільки останній (pop, не splice)', !!pmatch && /e\.visits\.pop\(\)/.test(pmatch[0]));
t('prune тільки сьогоднішній', !!pmatch && /last\.date!==today\(\)/.test(pmatch[0]));
t('prune поважає hasData', !!pmatch && /\|\|hasData\(last\)\)return false/.test(pmatch[0]));
t('порожній ключ аптеки прибирається', !!pmatch && /delete ST\.phs\[px\]/.test(pmatch[0]));

/* Виконуємо ЖИВІ тіла з файлу на стабах — не переписуємо логіку в тесті. */
let ST={ver:2,phs:{}};
const today=()=>TODAY;
const saveST=()=>{saveCalls++;};
let saveCalls=0;
const pruneVisit=eval('('+pmatch[0].replace(/^function pruneVisit/,'function')+')');
const pruneStore=eval('('+smatch[0].replace(/^function pruneStore/,'function')+')');

console.log('\n[H] pruneVisit — поведінка');
ST.phs={A:{visits:[{date:TODAY,vals:{},transferred:false}]}};
t('порожній сьогоднішній → знято', pruneVisit('A')===true && ST.phs.A===undefined);

ST.phs={B:{visits:[{date:TODAY,vals:{k:0},transferred:false}]}};
t('значення 0 → НЕ знято', pruneVisit('B')===false && ST.phs.B.visits.length===1);

ST.phs={C:{visits:[{date:TODAY,vals:{},transferred:true}]}};
t('transferred порожній → НЕ знято', pruneVisit('C')===false);

ST.phs={D:{visits:[{date:'2026-08-01',vals:{},transferred:false}]}};
t('вчорашній порожній → писач НЕ чіпає (це робота міграції)',
   pruneVisit('D')===false && ST.phs.D.visits.length===1);

ST.phs={E:{visits:[{date:'2026-08-01',vals:{k:7},transferred:true},
                   {date:TODAY,vals:{},transferred:false}]}};
t('знято лише хвіст, реальний вцілів',
   pruneVisit('E')===true && ST.phs.E.visits.length===1 && ST.phs.E.visits[0].vals.k===7);

console.log('\n[I] pruneStore — міграція');
ST.phs={
  X:{visits:[{date:'2026-08-01',vals:{},transferred:false},
             {date:'2026-08-02',vals:{k:3},transferred:false},
             {date:'2026-08-03',vals:{},transferred:false}]},
  Y:{visits:[{date:'2026-08-01',vals:{},transferred:false}]},
  Z:{visits:[{date:'2026-08-01',vals:{},transferred:true}]}
};
saveCalls=0;
const removed=pruneStore();
t('знято 3 порожніх', removed===3);
t('X лишив 1 реальний', ST.phs.X.visits.length===1 && ST.phs.X.visits[0].vals.k===3);
t('Y прибрано цілком', ST.phs.Y===undefined);
t('Z (transferred) вцілів', ST.phs.Z && ST.phs.Z.visits.length===1);
t('saveST викликано рівно раз', saveCalls===1);

saveCalls=0;
t('ІДЕМПОТЕНТНІСТЬ: другий прохід нічого не знімає', pruneStore()===0);
t('ІДЕМПОТЕНТНІСТЬ: у localStorage не пишемо', saveCalls===0);

console.log('\n[J] точки виклику в продукті');
t('loadST кличе pruneStore', /if\(!ST\|\|!ST\.phs\)ST=\{ver:2,phs:\{\}\};pruneStore\(\);/.test(S));
t('onInput кличе pruneVisit перед saveST', /pruneVisit\(curPx\);\n\s*saveST\(\);/.test(S));
t('«Очистити підрахунок» кличе pruneVisit', /pruneVisit\(curPx\);\s*\/\* b32\.3 крок 2/.test(S));
t('міграція логує підсумок', /console\.log\('\[b32\.3\] prune:/.test(S));

/* ══ b32.4 · П-1 + П-2 · ШІТ МЕНЮ ═══════════════════════════════════════════ */
console.log('\n[K] П-2 стеля і скрол меню');
t('scope #sheet, НЕ спільний .sheet',
   /#sheet\{max-height:85dvh;overflow-y:auto;overscroll-behavior:contain/.test(S));
t('dvh, не vh',                       !/#sheet\{max-height:85vh/.test(S));
t('спільний .sheet без overflow',     !/^\.sheet\{[^}]*overflow-y:auto/m.test(S));
t('ніша #sh-period недоторкана',      /#sh-period \.vlist\{max-height:40dvh;overflow-y:auto/.test(S));
t('ніша #sh-network недоторкана',     /#sh-network \.np-well\{position:relative;max-height:var\(--npWellH,339px\);overflow:auto/.test(S));

console.log('\n[L] П-1 swipe-to-close (порт A19 + guard A21)');
const sw=S.match(/function addSwipeClose\(boxId, closeFn, ig\)\{[\s\S]*?\n\}/);
t('addSwipeClose існує',              !!sw);
t('guard A21 (_sw)',                  !!sw && /if\(!box\|\|box\._sw\)return; box\._sw=true;/.test(sw[0]));
t('поріг grip = 40',                  !!sw && /if\(gt&&dy>40\)closeFn\(\);/.test(sw[0]));
t('поріг контенту = 64',              !!sw && /else if\(ss===0&&dy>64\)closeFn\(\);/.test(sw[0]));
t('scrollTop знімається на СТАРТІ',   !!sw && /ss=box\.scrollTop;/.test(sw[0]));
t('НЕ голе dy>N без scrollTop',       !!sw && !/else if\(dy>\d+\)closeFn/.test(sw[0]));
t('end-only: обидва passive:true',    !!sw && (sw[0].match(/\{passive:true\}/g)||[]).length===2);
t('end-only: без preventDefault',     !!sw && !/preventDefault/.test(sw[0]));
t('grip-детект під структуру StockCheck', !!sw && /closest\('\.grip'\)/.test(sw[0]));

console.log('\n[M] точка реєстрації');
t('виклик при init',                  /addSwipeClose\('sheet', closeSheet\);/.test(S));
t('НЕ в openSheet',                   !/function openSheet\(\)\{[^}]*addSwipeClose/.test(S));
t('closeSheet, не closeSheets',       !/addSwipeClose\('sheet', closeSheets\)/.test(S));
/* b32.5/П-7: scope-обіцянку b32.4 ЗАКРИТО — шітів тепер шість, не один.
   Твердження перевернуто: було «решта не чіпалась», стало «решта оживлена». */
t('усі шість шітів зареєстровані',    (S.match(/addSwipeClose\(/g)||[]).length===7);  // 1 оголошення + 6 викликів
t('ig .vlist у sh-period',            /addSwipeClose\('sh-period',[\s\S]*?'\.vlist'\);/.test(S));
t('ig .np-well у sh-network',         /addSwipeClose\('sh-network',[\s\S]*?'\.np-well'\);/.test(S));
t('about/install/confirm без ig',     (S.match(/addSwipeClose\('sh-(?:about|install|confirm)',[^\n]*null\);/g)||[]).length===3);
t('ig знімає жест ЦІЛКОМ',            !!sw && /if\(ign\)return;/.test(sw[0]));
t('ign читається на touchstart',      !!sw && /ign=!!\(ig&&e\.target\.closest\(ig\)\)/.test(sw[0]));
/* install закривається ОБГОРТКОЮ: closeSheets перевизначено пізніше в maint-IIFE,
   тож референс, знятий на init, захопив би до-IIFE-версію без mtDisarm. */
t('install через обгортку, не референс', /addSwipeClose\('sh-install',\s*function\(\)\{closeSheets\(\);\}/.test(S));

/* ── N · Х-3 · ПАМ'ЯТЬ ДОДАТКА ───────────────────────────────────────────── */
console.log('\n[N] Х-3 · індикатор пам’яті');
t('вага в UTF-16 (×2)',               /\(k\.length\+\(\(localStorage\.getItem\(k\)\|\|''\)\.length\)\)\*2/.test(S));
t('вага рахує ВЕСЬ origin',           /for\(var i=0;i<localStorage\.length;i\+\+\)/.test(S));
t('стеля НАВЧЕНА (окремий ключ)',     /CAPK='stockcheck_cap'/.test(S)&&/localStorage\.setItem\(CAPK/.test(S));
t('ключ стелі ≠ ключ даних',          /CAPK='stockcheck_cap'/.test(S)&&/const SK='farmstore_v2'/.test(S));
t('нові ключі без спадкового префікса',!/'farmstore_cap'/.test(S));
t('saveST більше не німий',           !/function saveST\(\)\{try\{localStorage\.setItem\(SK[^}]*\}catch\(e\)\{\}\}/.test(S));
t('відмова → learnCap',               /catch\(e\)\{\s*learnCap\(storeBytes\(\)\)/.test(S));
t('тост має анти-торохт гард',        /now-_qTs<5000/.test(S));
t('проба лише від 60%',               /if\(pct>=60\)\{\s*STQ_TIGHT=!stqProbe\(\)/.test(S));
t('проба прибирає за собою',          /finally\{\s*try\{localStorage\.removeItem\(key\)/.test(S));
t('проба-відмова → 100%',             /if\(STQ_TIGHT\)pct=100/.test(S));
t('заливка = тег i, не span',         /<i id="stqFill"><\/i>/.test(S));
t('селектор .stq-bar > i',            /\.stq-bar > i\{/.test(S));
t('трек списаний з .progress',        /\.mi-tx > \.stq-bar\{[\s\S]*?var\(--bg-soft\),var\(--border\) 37%/.test(S));
t('A69: auto-dark близнюк є',         /not\(\[data-theme="light"\]\) \.stq-bar > i/.test(S));
t('лок stH6/stRad6/stGap5/stInset2',  /--stH:6px; --stRad:6px; --stFillRad:6px; --stGap:5px; --stInset:2px/.test(S));
t('пороги 70/90',                     /pct>=90 \? 'var\(--crit\)' : \(pct>=70/.test(S));
t('запас із ЖИВИХ даних',             /var per=\(b>0\)\?\(b\/vc\):1900/.test(S));
t('renderStore при відкритті меню',   /function openSheet\(\)\{[^}]*renderStore\(\)/.test(S));
t('рядок — табло, без onclick',       /<div class="mi stq" id="miStq">/.test(S)&&!/id="miStq"[^>]*onclick/.test(S));
t('плюралізація візитів є',           /function plVis\(n\)/.test(S));

/* ── O · Х-2 · гейт Копіювати ────────────────────────────────────────────── */
console.log('\n[O] Х-2 · гейт порожнього підрахунку');
t('гейт ПЕРЕД transferred',           /if\(!Object\.keys\(data\)\.length\)\{toast[\s\S]{0,160}?\}\s*var col=/.test(S));
t('клас gated з updProg',             /cb\.classList\.toggle\('gated',fc===0\)/.test(S));
t('CTA-гама не чіпана (фільтр)',      /\.btn-copy\.gated\{filter:saturate/.test(S));

/* ── P · марка та бамп ───────────────────────────────────────────────────── */
console.log('\n[P] марка в About + бамп');
t('SC прибрано',                      !/id="ab-logo">SC</.test(S));
t('path тотожний .sc-comet',          (S.match(/M43\.00 26\.00L41\.70 30\.76/g)||[]).length===2);
t('плашка на токенах, не градієнт',   !/\[data-theme="dark"\] \.about-logo\{background:linear-gradient/.test(S));
t('бамп-рядок присутній',             /ver:'v2\.27\.\d', build:'stockcheck-pwa\.b32\.\d'/.test(S));

/* ── N2 · Х-3.1 · ІНДИКАТОР НЕ БРЕШЕ ──────────────────────────────────────────
   Регекс тут не годиться сам по собі: він засвідчує НАЯВНІСТЬ рядка, а дефект
   був у ПОВЕДІНЦІ (0% при живих даних). Тому renderStore витягується з файлу і
   виконується в пісочниці з підставленими storeBytes/visitCount. Судиться те,
   що побачить оператор: ширина заливки і текст підпису.                       */
console.log('\n[N2] Х-3.1 · поведінка індикатора');
t('гард мінімальної комірки',         /if\(b>0&&pct<1\)pct=1;/.test(S));
t('розвилка за фактом (vc===0)',      /if\(!vc\)\{ sub\.textContent='Даних нема/.test(S));
t('вага в КБ з одним знаком',         /\(b\/1024\)\.toFixed\(1\)\+' КБ'/.test(S));
t('підпис vc>0 без відсотка',         /sub\.textContent=vc\+' '\+plVis\(vc\)\+' \\u00b7 ще ~'\+left;/.test(S));

const rsm = S.match(/function renderStore\(\)\{[\s\S]*?\n\}/);
function run(bytes, vc){
  const sub={textContent:''}, fl={style:{}};
  const row={style:{setProperty(){},removeProperty(){}}};
  const document={getElementById:id=>id==='stqSub'?sub:(id==='stqFill'?fl:(id==='miStq'?row:null))};
  const CAP=5*1024*1024;
  let STQ_TIGHT=false;
  const storeBytes=()=>bytes, stqProbe=()=>true, visitCount=()=>vc;
  const plVis=n=>{const a=n%10,b2=n%100;
    if(a===1&&b2!==11)return'візит'; if(a>=2&&a<=4&&(b2<12||b2>14))return'візити'; return'візитів';};
  eval(rsm[0]);
  renderStore();
  return {sub:sub.textContent, w:fl.style.width};
}
if(!rsm){ t('renderStore витягнуто', false); }
else {
  t('renderStore витягнуто',          true);
  /* ЯДРО ДЕФЕКТУ: 24 КБ це ~12 живих візитів, на b32.5 бар малювався порожнім. */
  const live = run(24*1024, 12);
  t('12 візитів → бар НЕ порожній',   live.w==='1%');
  t('12 візитів → підпис каже 12',    /^12 візитів · ще ~\d+$/.test(live.sub));
  t('підпис без «0%»',                live.sub.indexOf('%')===-1);
  /* ДІАГНОСТИКА ВТРАТИ: два стани, що на b32.5 виглядали тотожно. */
  const wiped = run(0, 0), alive = run(410, 0);
  t('origin порожній → 0.0 КБ',       wiped.sub==='Даних нема · сховище 0.0 КБ');
  t('origin живий → ненульові КБ',    alive.sub==='Даних нема · сховище 0.4 КБ');
  t('два стани РІЗНІ на вигляд',      wiped.sub!==alive.sub);
  t('порожній origin → бар 0%',       wiped.w==='0%');
  t('живий origin без візитів → 1%',  alive.w==='1%');
  /* НЕ ЗЛАМАНО: середина шкали і поріг заповнення лишились як були. */
  const mid = run(2*1024*1024, 1000);
  t('2 МБ/1000 візитів → 40%',        mid.w==='40%');
  t('середина: підпис із запасом',    /^1000 візитів · ще ~\d+$/.test(mid.sub));
  const full = run(5*1024*1024, 2600);
  t('100% → текст «Заповнено»',       /^Заповнено/.test(full.sub) && full.w==='100%');
}

/* ── N3 · Х-4 · PERSISTENT STORAGE ──────────────────────────────────────────
   Гард наявності API обов'язковий: persist відсутній у старих WebKit, і голий
   виклик поклав би init цілком — тобто фікс надійності став би джерелом відмови. */
console.log('\n[N3] Х-4 · persistent storage');
t('фіча-детект перед викликом',       /if\(!navigator\.storage\|\|!navigator\.storage\.persist\)/.test(S));
t('persisted() перед persist()',      /navigator\.storage\.persisted\(\)\.then/.test(S));
t('scPersist до loadST',              S.indexOf('scPersist();')<S.indexOf('loadST();'));
t('повтор на visibilitychange',       /mtCheck\(false\); scPersist\(\);/.test(S));
t('прапорець НЕ в localStorage',      !/setItem\([^)]*SC_PERSIST|SC_PERSIST[^=]*setItem/.test(S));
t('catch на промісі',                 /\.catch\(function\(\)\{SC_PERSIST='err';\}\)/.test(S));
t('ver v2.27.2 · build b32.7',        /ver:'v2\.27\.2', build:'stockcheck-pwa\.b32\.7'/.test(S));

console.log(`\n─── ПІДСУМОК: ✓ ${ok} · ✗ ${bad} ───`);
process.exit(bad?1:0);
