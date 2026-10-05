/* живе доки: стенд v2 не пройшов device-суд і не портовано О-49/О-51. Далі — archive/stands/.
   дім: Project вручну, поруч зі стендом (розділ «Код і інструменти» Lens_INDEX §5).
   прогін: npm i jsdom && node StockCheck_money_stagebench_v2_smoke.js — 103 твердження (ред. s15c ЛОК). */
const {JSDOM}=require('jsdom'),fs=require('fs');
const path=process.argv[2]||__dirname+'/StockCheck_money_stagebench_v2.html';
const html=fs.readFileSync(path,'utf8');
let errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',virtualConsole:new (require('jsdom').VirtualConsole)().on('jsdomError',e=>errs.push(e.message))});
const w=dom.window,d=w.document;
function t(n,c){console.log((c?'✓':'✗')+' '+n); if(!c)process.exitCode=1;}
t('без JS-помилок '+(errs[0]||''), errs.length===0);
const levs=[...d.querySelectorAll('.lev')];
t('важелів відрендерено: '+levs.length, levs.length>=40);
const undecl=d.getElementById('undecl').textContent;
t('рядок #undecl: '+(undecl||'порожній'), true);
t('усі .lev мають запис у DEPS', levs.every(e=>w.DEPS[e.dataset.k]));
// ── В-1: старт мусить збігатися з портом, тому міряється ДО будь-яких змін стану ──
t('старт bcntMin=34 (порт, р.858): '+w.S.bcntMin, w.S.bcntMin===34);
t('старт bcntState=open', w.S.bcntState==='open');
// bcntBd 82 — СВІДОМЕ відхилення від порту (100). Твердження сторожить саме 82:
// якщо хтось «поверне як у порті», лок раунду 3 мовчки зникне.
t('старт bcntBd=82 (лок s15c, відхилення від порту 100): '+w.S.bcntBd, w.S.bcntBd===82);
t('старт = лок раунду 3, не дефолти автора',
  w.S.order==='over-first' && w.S.div==='tone' && w.S.sign==='none' &&
  w.S.zeroMode==='dash' && w.S.curr==='row' && w.S.netMode==='mark' &&
  w.S.markPlateL==='flat' && w.S.markPlateD==='tile');
t('старт: zoom=1 (лупа огляду не запікається)', w.S.zoom===1);
// gate: shape=two має гасити div/mDivW/mEmph, лишати mGapPx
w.S.shape='two'; w.apply();
const dead=k=>d.querySelector('.lev[data-k="'+k+'"]').classList.contains('dead');
t('shape=two → div мертвий', dead('div'));
t('shape=two → mDivW мертвий', dead('mDivW'));
t('shape=two → mEmph мертвий', dead('mEmph'));
t('shape=two → L.mutL мертвий (З-3)', dead('L.mutL'));
t('shape=two → mGapPx живий', !dead('mGapPx'));
w.S.shape='split'; w.S.div='hairline'; w.apply();
t('split+hairline → L.fillMix мертвий (§3.1)', dead('L.fillMix'));
t('split → mGapPx мертвий', dead('mGapPx'));
w.S.div='tone'; w.apply();
t('split+tone → L.fillMix живий', !dead('L.fillMix'));
w.S.faRows=2; w.apply();
t('rows=2 → faGap мертвий', dead('faGap'));
t('rows=2 → faAlign мертвий', dead('faAlign'));
t('rows=2 → faWrap мертвий', dead('faWrap'));
w.S.faRows=1; w.S.faPairs=1; w.apply();
t('pairs=1 → iwCase мертвий', dead('iwCase'));
t('pairs=1 → IW-пара схована', d.getElementById('pairIw').style.display==='none');
w.S.faPairs=2; w.S.caseMode='zero'; w.apply();
t('zero → zeroMode живий', !dead('zeroMode'));
w.S.caseMode='both'; w.apply();
t('both → zeroMode мертвий', dead('zeroMode'));
// О-51
w.S.netMode='mark'; w.apply();
t('mark → плитка видима', !d.getElementById('scMark').hidden);
t('mark → img має data-URI', /^data:image\/webp/.test(d.getElementById('scImg').getAttribute('src')));
t('mark → netCase мертвий', dead('netCase'));
t('mark → markPx живий', !dead('markPx'));
w.S.netMode='text'; w.apply();
t('text → напис мережі видимий', !d.getElementById('scNtxt').hidden);
t('text → markPx мертвий', dead('markPx'));
t('text → напис = label', d.getElementById('scNtxt').textContent.indexOf('Бажаємо')===0);
w.S.netMode='none'; w.apply();
t('none → netPos мертвий', dead('netPos'));
// сцена
w.S.addrCase='worst'; w.apply();
t('worst → місто Верхньодніпровськ', /Верхньодніпровськ/.test(d.getElementById('scTxt').textContent));
w.S.roFlag=1; w.apply();
t('roFlag=1 → ro-рядок видимий', !d.getElementById('scRo').hidden);
// текст грошей
w.S.caseMode='both'; w.S.sign='glyph'; w.S.curr='last'; w.S.order='short-first';
w.S.magn='typ'; w.S.zeroMode='hide'; w.apply();
const sh=d.querySelector('#mOtc [data-h="short"]').textContent, ov=d.querySelector('#mOtc [data-h="over"]').textContent;
t('short = «−422» без грн (curr=last): '+sh, sh==='−422');
t('over = «+1 948 грн»: '+ov, ov==='+1 948 грн');
w.S.sign='arrow'; w.apply();
t('arrow → ↓422', d.querySelector('#mOtc [data-h="short"]').textContent.indexOf('↓')===0);
w.S.sign='none'; w.apply();
t('sign=none → без знака', d.querySelector('#mOtc [data-h="short"]').textContent==='422');
// прогін і copy
w.S.sign='glyph'; w.apply(); w.run3x3();
t('run3x3 надрукував вирок', /прогін 3×3/.test(d.getElementById('runout').textContent));
w.dumpAll();
const dump=d.getElementById('dump').value;
t('Copy-ALL має auto-dark близнюк', /prefers-color-scheme:dark/.test(dump)&&/data-theme="dark"/.test(dump));
t('Copy-ALL має нові токени', /--bcntBd/.test(dump)&&/--markPx/.test(dump));
console.log('\n--- #undecl ---\n'+(undecl||'(порожній)'));

// ── ДОДАНО ПІСЛЯ БАГУ «стенд мертвий»: перевірка РЕАЛЬНИХ подій, не прямих викликів ──
function click(el){el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}
function drag(el,v){el.value=v; el.dispatchEvent(new w.Event('input',{bubbles:true}));}
const segBtn=(k,v)=>d.querySelector('.lev[data-k="'+k+'"] button[data-v="'+v+'"]');
click(segBtn('shape','lead'));
t('клік по сегменту міняє стан', w.S.shape==='lead');
t('клік по сегменту перемальовує сцену', d.getElementById('mOtc').dataset.shape==='lead');
t('клік по сегменту перераховує gate', !d.querySelector('.lev[data-k="mEmph"]').classList.contains('dead'));
const rng=d.querySelector('.lev[data-k="mBwFB"] input');
t('важіль bwFB існує', !!rng);
drag(rng,'2.5');
t('drag повзунка міняє стан', w.S.mBwFB===2.5);
t('drag повзунка пише токен', d.documentElement.style.getPropertyValue('--mBwFB')==='2.5');
t('bwFA ⟂ bwFB (розщеплено)', w.S.mBwFA===1 && w.S.mBwFB===2.5);
t('керування сценою — у ВЕРХНІЙ смузі', !!d.querySelector('#hudlev .lev[data-k="devW"]') && !!d.querySelector('#hudlev .lev[data-k="zoom"]'));
t('у панелі внизу devW/zoom НЕМАЄ', !d.querySelector('.panel .lev[data-k="devW"]'));
click(d.querySelector('#hudlev .lev[data-k="devW"] button[data-v="393"]'));
t('пристрій 393 із верхньої смуги', w.S.devW===393 && d.getElementById('scene').style.width==='393px');
click(d.getElementById('btnTheme'));
t('тема перемикається кліком', d.documentElement.getAttribute('data-theme')==='dark');
t('матеріал перебудувався під DARK', !!d.querySelector('.lev[data-k="D.posS"]'));
click(d.getElementById('btnShut'));
t('панель згортається однією кнопкою', d.getElementById('panel').classList.contains('shut'));
click(d.querySelector('#g-fb .up'));
t('▲ піднімає групу нагору', d.querySelector('.panel .gr').id==='g-fb');

// ══════════ В-1 · КАПСУЛА .bcnt (самері s14 §3) ══════════
// Авто-звірка токен↔DEPS цих умов НЕ бачить (.done — клас, а PRED ловить лише
// [data-*="…"]) — межа названа в DEPS. Тому доводить їх лише смоук.
const css = d.querySelector('style').textContent;
const iDone = css.indexOf('.bhdr .bcnt.done{');
const iDark = css.lastIndexOf(':root:not([data-theme="light"]) .bhdr .bcnt{');
t('.bcnt.done існує в CSS', iDone > 0);
t('.bcnt.done стоїть ПІСЛЯ dark-блоків (порядок джерела, як р.862 > р.861)', iDone > iDark);
t('.bcnt.done 1:1 з білдом р.862',
  /\.bhdr \.bcnt\.done\{color:var\(--accent-ink\);background:var\(--accent-soft\);border-color:transparent\}/.test(css));

w.S.bcntState='open'; w.apply();
const bc = d.getElementById('scBcnt');
t('open → текст «10/11» (найширший ДОСЯЖНИЙ; «11/11» продукт не малює): '+bc.textContent, bc.textContent==='10/11');
t('open → без класу done', !bc.classList.contains('done'));
t('open → counterFill живий', !dead('counterFill'));
t('open → bcntBd живий', !dead('bcntBd'));

w.S.bcntState='done'; w.apply();
t('done → текст «✓» (білд р.3324/3415): '+bc.textContent, bc.textContent==='✓');
t('done → клас done', bc.classList.contains('done'));
t('done → counterFill МЕРТВИЙ (тло бере --accent-soft)', dead('counterFill'));
t('done → bcntBd МЕРТВИЙ (рамка transparent)', dead('bcntBd'));
t('done → винуватця названо', /done/.test(d.querySelector('.lev[data-k="counterFill"] .why').textContent));
w.S.bcntState='open'; w.apply();

// ══════════ В-2 · РОЗРЯДНІСТЬ, СКОРОЧЕННЯ, ВАЛЮТА, ПРАВИЙ КРАЙ ══════════
const OV = id => d.querySelector('#'+id+' [data-h="over"]').textContent;
const SH = id => d.querySelector('#'+id+' [data-h="short"]').textContent;
w.S.caseMode='both'; w.S.iwCase='both'; w.S.faPairs=2; w.S.faRows=1;
w.S.sign='glyph'; w.S.curr='last'; w.S.order='short-first'; w.S.abbr='off';
w.S.magn='typ'; w.apply();
t('magn=typ → fa over «+1 948 грн»: '+OV('mOtc'), OV('mOtc')==='+1 948 грн');
t('magn=typ → fb = fa (той самий реальний кейс)', OV('mBr')===OV('mOtc'));
w.S.magn='hi'; w.apply();
t('magn=hi → fa 5-значне «+19 177 грн» (Σp×3 по 38 OTC SKU): '+OV('mOtc'), OV('mOtc')==='+19 177 грн');
t('magn=hi → fa short «−9 368» (ΣD×p): '+SH('mOtc'), SH('mOtc')==='−9 368');
t('magn=hi → fb ЛИШАЄТЬСЯ 4-значним (дім не дає 5 знаків)', OV('mBr')==='+1 948 грн');
w.S.magn='max'; w.apply();
t('magn=max → fa short «−26 462» (ΣA×p OTC): '+SH('mOtc'), SH('mOtc')==='−26 462');
t('magn=max → fb short «−6 515» (ΣA×p Стрепсілс): '+SH('mBr'), SH('mBr')==='−6 515');
t('magn=max → fb over «+4 568 грн» (Σp×3 Стрепсілс): '+OV('mBr'), OV('mBr')==='+4 568 грн');
w.S.zeroMode='keep0'; w.S.caseMode='zero'; w.apply();
t('keep0 при magn=max не падає (txt знає дім)', SH('mBr').indexOf('0')>=0);
w.S.zeroMode='hide'; w.S.caseMode='both'; w.apply();

w.S.magn='typ'; w.S.abbr='тис'; w.apply();
t('abbr=тис → «+1,9 тис грн» (десяткова КОМА, uk-UA): '+OV('mOtc'), OV('mOtc')==='+1,9 тис грн');
w.S.magn='hi'; w.apply();
t('abbr=тис при 5-значному → «+19,2 тис грн»: '+OV('mOtc'), OV('mOtc')==='+19,2 тис грн');
w.S.abbr='off'; w.S.magn='typ'; w.apply();

w.S.curr='row'; w.apply();
t('curr=row → «грн» НЕ на OTC: '+OV('mOtc'), OV('mOtc').indexOf('грн')<0);
t('curr=row → «грн» на останньому домі IW: '+OV('mIw'), OV('mIw').indexOf('грн')>0);
t('curr=row → fb окрема поверхня, «грн» лишається', OV('mBr').indexOf('грн')>0);
w.S.iwCase='zero'; w.apply();
t('curr=row + IW порожній → «грн» повертається на OTC', OV('mOtc').indexOf('грн')>0);
w.S.iwCase='both'; w.S.faPairs=1; w.apply();
t('curr=row + pairs=1 → «грн» на OTC (не зникає з ряду)', OV('mOtc').indexOf('грн')>0);
w.S.faPairs=2; w.S.curr='last'; w.apply();

t('faStretch мертвий при rows=1', dead('faStretch'));
w.S.faRows=2; w.apply();
t('faStretch живий при rows=2', !dead('faStretch'));
w.S.faStretch='on'; w.apply();
t('faStretch=on → data-stretch на .hdr-sub', d.getElementById('scSub').dataset.stretch==='on');
t('CSS правого краю існує',
  /\[data-rows="2"\]\[data-stretch="on"\] \.pair\.fa\{[^}]*justify-content:space-between/.test(css));
w.S.faStretch='off'; w.S.faRows=1; w.apply();
t('#undecl лишився порожнім після нових важелів', d.getElementById('undecl').textContent==='');

// ══════════ ДЕВАЙС-РАУНД 2 · ДВА ДЕФЕКТИ, ЗНАЙДЕНІ ОКОМ ══════════
// Д-1 · клас-маркер дому стоїть НА САМОМУ .mny, тому селектор нащадка «.fb .mny»
// нікого не матчив: border-color падав на currentColor (--text) = чорна жирна рамка,
// а важіль bdFB був мертвий, виглядаючи живим. auditTokens() це не ловить — токен у
// CSS вживається, просто селектор порожній. Детектор мусить бути ПРО DOM, не про текст.
t('дім-маркер fb стоїть на самому .mny (не на обгортці)',
  d.querySelector('#mBr').classList.contains('fb') && !d.querySelector('#mBr').parentElement.classList.contains('fb'));
t('у CSS немає мертвого селектора нащадка .fb .mny', css.indexOf('.fb .mny')<0);
t('у CSS немає мертвого селектора нащадка .fa .mny', css.indexOf('.fa .mny')<0);
t('бордюр fb адресується тим самим елементом (.mny.fb)', /\.mny\.fb,\.mny\.fb \.mh\{border-color/.test(css));
t('бордюр fa адресується тим самим елементом (.mny.fa)', /\.mny\.fa,\.mny\.fa \.mh\{border-color/.test(css));
// сторож на майбутнє: жоден дім не має покладатись на предка
['fa','fb'].forEach(function(h){
  const el=[...d.querySelectorAll('#scene .mny.'+h)];
  t('дім '+h+': усі пілюлі несуть клас самі ('+el.length+' шт)', el.length>0);
});

// Д-2 · підкладка мітки мережі — важіль розщеплено по темах
w.S.netMode='mark'; w.apply();
const tile=()=>d.querySelector('#scMark .ntile');
t('markPlateL і markPlateD живі при netMode=mark', !dead('markPlateL') && !dead('markPlateD'));
const wasDark = d.documentElement.getAttribute('data-theme')==='dark';
w.S[wasDark?'markPlateD':'markPlateL']='flat'; w.apply();
t('plate=flat дійшов до плитки активної теми', tile().dataset.plate==='flat');
w.S[wasDark?'markPlateD':'markPlateL']='none'; w.apply();
t('plate=none дійшов до плитки', tile().dataset.plate==='none');
t('CSS flat гасить рамку й тінь',
  /\.ntile\.is-mark\[data-plate="flat"\]\{border-color:transparent;box-shadow:none\}/.test(css));
t('CSS none знімає білий well і поле',
  /\[data-plate="none"\]\{background:transparent/.test(css));
t('правила plate стоять ПІСЛЯ dark-блоку мітки (порядок джерела)',
  css.indexOf('[data-plate="flat"]') > css.lastIndexOf(':root:not([data-theme="light"]) .ntile.is-mark'));
w.S[wasDark?'markPlateD':'markPlateL']='tile'; w.S.netMode='none'; w.apply();
t('netMode=none → обидві підкладки мертві', dead('markPlateL') && dead('markPlateD'));
t('#undecl порожній після раунду 2', d.getElementById('undecl').textContent==='');
