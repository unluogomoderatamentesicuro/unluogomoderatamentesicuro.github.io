/* ATHANOR — regia: stato, influenze involontarie, fasi dell'Opera, quiete,
   ricordi, colori che seguono il suono, registrazione.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const $ = id => document.getElementById(id);
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const STORE = 'athanor.formula.v4', TABSTORE = 'athanor.tab';

  const engine = new ATH.Engine();
  const recorder = new ATH.Recorder(engine);
  const visuals = new ATH.Visuals($('crucible'));
  let quies = null, memoria = null;

  const state = { base: {}, sw: {}, choice: {}, libra: 0.3, opus: 0, scene: 'soglia', allora: 0, visited: [], found: [] };
  ATH.PARAMS.forEach(p => state.base[p.id] = p.def);
  ATH.SWITCHES.forEach(s => state.sw[s.id] = s.def);
  ATH.CHOICES.forEach(c => state.choice[c.id] = c.def);
  const live = Object.assign({}, state.base);
  const PBYID = {}; ATH.PARAMS.forEach(p => PBYID[p.id] = p);
  const GBYID = {}; ATH.GROUPS.forEach(g => GBYID[g.id] = g);

  const seeds = {};
  ATH.PARAMS.forEach(p => seeds[p.id] = [0.07 + Math.random() * 0.1, 0.19 + Math.random() * 0.2, 0.43 + Math.random() * 0.4, Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3]);

  // —— salvataggio automatico
  let saveTimer = null;
  const persist = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(STORE, JSON.stringify(formula())); } catch (e) { /* niente memoria locale */ } }, 800);
  };

  // —— pannello
  let cryptaTimer = null;
  const ui = ATH.buildPanel($('panel'), {
    knob: (id, v) => {
      state.base[id] = v;
      if (id === 'crypta') { clearTimeout(cryptaTimer); cryptaTimer = setTimeout(() => engine.ready && engine.setCryptaSize(v), 600); }
      pulse(0.06); persist();
    },
    seal: (id, on) => {
      state.sw[id] = on; pulse(0.12);
      if (id === 'mutatio') syncWander();
      if (engine.ready && on && id === 'fulmen') engine.strike(0.5);
      persist();
    },
    choice: (id, v) => { state.choice[id] = v; if (id === 'diapason') ATH.diapason = v; pulse(0.08); persist(); },
    scene: id => recall(id),
    action: id => {
      if (id === 'newMemory') {
        if (memoria) { memoria.newMemory(); toast('Un ricordo nuovo: la melodia di carillon e pianoforte è cambiata.'); }
        else toast('Prima accendi il fuoco.');
      }
    }
  });

  // —— schede
  const tabsEl = $('tabs');
  const tabBtns = {};
  let curTab = 'fornax';
  ATH.TABS.forEach(tb => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tab'; b.id = 'tab-' + tb.id; b.setAttribute('role', 'tab');
    b.innerHTML = `<span class="tnum">${tb.num}</span><span class="tname">${tb.name}</span><span class="tgloss">${tb.gloss}</span>`;
    b.addEventListener('click', () => showTab(tb.id));
    tabsEl.appendChild(b); tabBtns[tb.id] = b;
  });
  function showTab(id) {
    curTab = id;
    Object.keys(tabBtns).forEach(k => tabBtns[k].setAttribute('aria-selected', k === id ? 'true' : 'false'));
    document.querySelectorAll('#panel .vessel').forEach(s => { s.hidden = s.dataset.tab !== id; });
    $('panel').scrollTop = 0;
    try { localStorage.setItem(TABSTORE, id); } catch (e) { }
  }
  let savedTab = 'fornax';
  try { savedTab = localStorage.getItem(TABSTORE) || 'fornax'; } catch (e) { }
  showTab(ATH.TABS.some(t => t.id === savedTab) ? savedTab : 'fornax');

  // —— bilancia
  const libraEl = $('libra');
  libraEl.addEventListener('input', () => { state.libra = libraEl.value / 1000; pulse(0.05); persist(); });
  function setLibra(v) { state.libra = clamp01(v); libraEl.value = Math.round(state.libra * 1000); }

  function formula() {
    return { athanor: 4, base: Object.assign({}, state.base), sw: Object.assign({}, state.sw), choice: Object.assign({}, state.choice), libra: +state.libra.toFixed(3), place: state.scene, allora: +state.allora.toFixed(3), visited: state.visited.slice(), found: state.found.slice(), lumini: (state.lumini || []).slice(), genCount: state.genCount || 0, opus: +state.opus.toFixed(3) };
  }
  function applyFormula(f) {
    if (!f || typeof f !== 'object') return false;
    let n = 0;
    if (f.base) ATH.PARAMS.forEach(p => { const v = +f.base[p.id]; if (f.base[p.id] !== undefined && isFinite(v)) { state.base[p.id] = clamp01(v); ui.knobs[p.id].set(state.base[p.id]); n++; } });
    if (f.sw) ATH.SWITCHES.forEach(s => { if (typeof f.sw[s.id] === 'boolean') { state.sw[s.id] = f.sw[s.id]; ui.seals[s.id].set(f.sw[s.id]); n++; } });
    if (f.choice) ATH.CHOICES.forEach(c => { const v = f.choice[c.id]; if (c.options.some(o => o.v === v)) { state.choice[c.id] = v; ui.choices[c.id].set(v); n++; } });
    ATH.diapason = state.choice.diapason;
    if (isFinite(+f.libra)) setLibra(+f.libra);
    if (isFinite(+f.opus)) state.opus = Math.max(0, +f.opus);
    const pid = f.place || f.scene;
    if (pid && ATH.getPlace(pid)) state.scene = pid;
    if (Array.isArray(f.visited)) state.visited = f.visited.filter(id => ATH.PLACE[id]);
    if (Array.isArray(f.found)) state.found = f.found.filter(id => ATH.PLACE[id]);
    if (Array.isArray(f.lumini)) state.lumini = f.lumini.filter(x => typeof x === 'string').slice(0, 24);
    if (isFinite(+f.genCount)) state.genCount = +f.genCount;
    if (isFinite(+f.allora)) setAllora(+f.allora);
    updateAtlas();
    markScene();
    if (engine.ready) engine.setCryptaSize(state.base.crypta);
    return n > 0;
  }

  const ALLORA = { nastro: 0.45, oblio: 0.35, distantia: 0.4, velum: -0.22, sublimatio: 0.15, aether: 0.2 };

  // —— gesti involontari
  const I = { px: 0.5, py: 0.5, acc: 0, agit: 0, presence: 0, lastMove: -1e9, coag: 0, coagT: 0, wheel: 0, idle: 0 };
  function pulse(a) { I.acc += a; }
  window.addEventListener('pointermove', e => {
    const nx = e.clientX / window.innerWidth, ny = e.clientY / window.innerHeight;
    I.acc += Math.hypot(nx - I.px, ny - I.py);
    I.px = nx; I.py = ny; I.lastMove = performance.now();
  }, { passive: true });
  const stage = $('stage');
  stage.addEventListener('pointerdown', e => { I.coagT = 1; I.px = e.clientX / innerWidth; I.py = e.clientY / innerHeight; I.lastMove = performance.now(); hideHint(); });
  window.addEventListener('pointerup', () => { I.coagT = 0; });
  window.addEventListener('pointercancel', () => { I.coagT = 0; });
  stage.addEventListener('wheel', e => { e.preventDefault(); I.wheel = Math.max(-0.45, Math.min(0.45, I.wheel - e.deltaY * 0.0005)); pulse(0.03); }, { passive: false });
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const tg = e.target;
    const tag = (tg && tg.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag) || (tg && tg.getAttribute && /slider|radio/.test(tg.getAttribute('role') || ''))) return;
    if (e.key.length !== 1 || e.key === ' ') return;
    if (!engine.ready) return;
    const code = e.key.toLowerCase().charCodeAt(0);
    const scale = ATH.SCALES[state.choice.modus];
    const root = ATH.rootHz(live.radix);
    const pan = ((code * 37) % 160) / 100 - 0.8;
    if (state.libra > 0.6) quies.bowl(root * 4 * ATH.ratioAt(scale, code % (scale.length * 2)) / 2, live.resonantia, pan);
    else engine.bell(root * ATH.ratioAt(scale, code % scale.length) * Math.pow(2, 2 + (code % 3)), pan, 0.8);
    pulse(0.05);
  });
  let hintGone = false;
  function hideHint() { if (!hintGone) { hintGone = true; $('hint').classList.add('gone'); } }

  function gesture(id) {
    const pr = I.presence, a = I.agit, c = I.coag;
    switch (id) {
      case 'solutio': return (I.px - 0.5) * 0.36 * pr;
      case 'plica': return (0.5 - I.py) * 0.16 * pr + a * 0.08;
      case 'coniunctio': return (I.py - 0.5) * 0.14 * pr;
      case 'cinis': return a * 0.32;
      case 'crepitus': return a * 0.42;
      case 'calcinatio': return a * 0.14 + c * 0.1;
      case 'mercurius': return a * 0.2;
      case 'draco': return c * 0.45;
      case 'ouroboros': return c * 0.3;
      case 'tempus': return I.wheel;
      case 'sublimatio': return (0.5 - I.py) * 0.1 * pr;
      case 'tempestas': return a * 0.12;
      case 'velum': return (0.5 - I.py) * 0.24 * pr;
      case 'halitus': return a * 0.25;
      case 'chorus': return c * 0.25;
      case 'aether': return c * 0.2;
      case 'nastro': return a * 0.15;
      case 'somnium': return a * 0.15;
      default: return 0;
    }
  }

  // —— movimenti lenti (transmutazioni e ricordi che arrivano)
  let tween = null;
  function moveTo(to, dur) {
    tween = { from: Object.assign({}, state.base), to, t: 0, dur };
  }
  function transmute() {
    const to = {};
    const skip = { lux: 1, memoria: 1, claritas: 1, spiritus: 1, somnus: 1 };
    ATH.PARAMS.forEach(p => {
      if (skip[p.id] || GBYID[p.group].tab !== curTab) return;
      const amt = p.id.indexOf('m_') === 0 ? 0.35 : 0.7;
      to[p.id] = clamp01(state.base[p.id] + (Math.random() - 0.5) * amt);
    });
    moveTo(to, 3.2);
    const pools = {
      fornax: ['solve', 'luna', 'quinta', 'crepusculum', 'mortificatio', 'retro'],
      quies: ['stasis'], memoria: ['fixa'], visio: ['constellatio', 'velamen']
    };
    const pool = pools[curTab];
    for (let i = 0; i < (curTab === 'fornax' ? 2 : 1); i++) {
      const id = pool[Math.floor(Math.random() * pool.length)];
      if (Math.random() < 0.6) { state.sw[id] = !state.sw[id]; ui.seals[id].set(state.sw[id]); }
    }
    if (curTab === 'quies' && Math.random() < 0.5) {
      const ch = ATH.CHOICES.find(c => c.id === 'modus');
      const v = ch.options[Math.floor(Math.random() * ch.options.length)].v;
      state.choice.modus = v; ui.choices.modus.set(v);
    }
    if (engine.ready && curTab === 'fornax') engine.strike(0.6);
    if (curTab === 'memoria' && memoria && Math.random() < 0.5) memoria.newMemory();
    pulse(0.3); persist();
  }

  // —— il cammino tra i luoghi
  const home = {};                       // i valori tuoi, prima che un luogo li cambiasse
  let traveling = false, passageT = -1, passDir = 0, dwell = 0, libraTween = null, hushTween = null, autoT = 0, autoNext = 80;
  let screamed = false, eroded = 0, flatDone = false, woke = false, doubtT = 0, faceNow = 0, ascendNow = 0;
  let hushNow = 0, helping = null, rescueAmt = 0, urged = false, tombIdx = 0, tombT = 0, darkNow = 0, glowNow = 0;
  const GP = id => ATH.getPlace(id);
  const isGen = id => typeof id === 'string' && id.indexOf('x:') === 0;
  const isKnown = id => { if (isGen(id)) return true; const p = ATH.PLACE[id]; return p && (!p.hidden || state.found.indexOf(id) >= 0); };
  const visibleExits = pl => (pl ? pl.exits : []).map(e => ATH.exitId(e)).filter(isKnown);
  const LUM = { accese: 0, soffuse: 0.4, candele: 0.62, torcia: 0.94, spente: 0.82 };

  function travel(id, quick) {
    const pl = GP(id);
    if (!pl || (traveling && !quick)) return;
    const from = GP(state.scene);
    const dl = from ? Math.sign((pl.level || 0) - (from.level || 0)) : 0;
    const dur = dl ? 4.4 : 3.4;
    traveling = !quick; passageT = quick ? -1 : 0; passDir = quick ? 0 : dl; dwell = 0; urged = false; helping = null; eroded = 0; flatDone = false; woke = false;
    if (memoria) { if (memoria.screaming) memoria.scream(false); memoria.flat(false); if (memoria.mon && memoria.mon.next > 1e9) memoria.mon.next = 0; }
    $('journey').classList.add('leaving');
    if (memoria && !quick) {
      if (dl) { memoria.walk('scala', 2.6, 0, dl); memoria.whoosh(dl, 2.8); memoria.walk(pl.terrain, 1.5, 2.6); }
      else { memoria.walk(from ? from.terrain : 'pietra', 1.6); memoria.walk(pl.terrain, 1.8, 1.6); }
    }
    if (memoria) memoria.terrain = pl.terrain === 'corsa' ? 'pietra' : pl.terrain;
    const to = {};
    ATH.MEM_IDS.forEach(m => to[m] = pl.levels[m] || 0);
    const set = Object.assign({}, pl.set || {});
    if (pl.bpm !== undefined) set.pulsus = pl.bpm;
    Object.keys(home).forEach(k => { if (!(k in set)) { to[k] = home[k]; delete home[k]; } });
    Object.keys(set).forEach(k => { if (!(k in home)) home[k] = state.base[k]; to[k] = set[k]; });
    moveTo(to, quick ? 2.5 : 6);
    if (pl.libra !== undefined) libraTween = { from: state.libra, to: pl.libra, t: 0, dur: quick ? 2.5 : 6 };
    hushTween = { from: hushNow, to: pl.hush || 0, t: 0, dur: quick ? 2.5 : 5 };
    if (pl.modus) { state.choice.modus = pl.modus; ui.choices.modus.set(pl.modus); }
    state.sw.spira = !!pl.spira; ui.seals.spira.set(state.sw.spira);
    if (memoria && Math.random() < 0.4) memoria.newMemory();
    state.scene = id;
    if (pl.gen) state.genCount = (state.genCount || 0) + 1;
    else {
      if (state.visited.indexOf(id) < 0) state.visited.push(id);
      if (pl.hidden && state.found.indexOf(id) < 0) state.found.push(id);
    }
    const hid = pl.exits.filter(e => typeof e !== 'string' && !isKnown(e.id));
    if (hid.length && Math.random() < 0.12) reveal(hid[Math.floor(Math.random() * hid.length)].id, true);
    if (pl.forget && !quick) setTimeout(() => forget(pl.forget), 4000);
    autoT = 0;
    setTimeout(() => { renderPlace(); $('journey').classList.remove('leaving'); }, quick ? 60 : 1700 + (dl ? 600 : 0));
    setTimeout(() => { traveling = false; }, quick ? 0 : dur * 1000);
    updateAtlas(); updateStrata(); if (!$('mapov').hidden) drawMap();
    pulse(0.1); persist();
  }
  function forget(n) {
    const pool = state.visited.filter(id => ['soglia', state.scene, 'lete'].indexOf(id) < 0);
    const gone = [];
    for (let i = 0; i < n && pool.length; i++) {
      const id = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      state.visited.splice(state.visited.indexOf(id), 1);
      const fi = state.found.indexOf(id); if (fi >= 0) state.found.splice(fi, 1);
      gone.push(GP(id).name);
    }
    if (gone.length) {
      $('plAllora').textContent = 'Hai dimenticato: ' + gone.join(', ') + '.';
      toast('L’acqua del fiume ha portato via ' + gone.length + (gone.length > 1 ? ' ricordi.' : ' ricordo.'));
      updateAtlas(); persist();
    }
  }
  function recall(id) {
    if (id) { travel(id); return; }
    const to = {}; ATH.MEM_IDS.forEach(m => to[m] = 0); moveTo(to, 9);
    toast('I ricordi si spengono piano. Il luogo resta.');
  }
  function reveal(id, quiet) {
    if (state.found.indexOf(id) >= 0) return;
    state.found.push(id);
    const p = GP(id);
    toast((quiet ? 'Ti sembra di ricordare un passaggio: ' : 'Si apre un passaggio che non c’era: ') + p.name);
    renderSoglie(id); updateAtlas(); persist();
  }
  function renderPlace() {
    const pl = GP(state.scene); if (!pl) return;
    const total = ATH.PLACES.length, n = state.visited.length;
    const kind = pl.gen ? 'altrove · profondità ' + pl.depth : (pl.kind === 'stato' ? 'stato dell’animo' : 'luogo') + ' · ' + ATH.levelName(pl.level);
    $('plKind').textContent = kind + ' · ' + n + ' di ' + total + ' trovati' + (state.genCount ? ' · ' + state.genCount + ' stanze senza nome' : '');
    $('plName').textContent = pl.name;
    $('plOra').textContent = pl.ora + (pl.lostText ? ' ' + pl.lostText : '');
    $('plAllora').textContent = pl.allora;
    $('lumini').hidden = !pl.candles;
    renderSoglie();
  }
  function renderSoglie(fresh) {
    const box = $('soglie'); box.innerHTML = '';
    const pl = GP(state.scene); if (!pl) return;
    box.classList.toggle('staying', !!pl.stay);
    const exits = visibleExits(pl).map(id => ({ id, p: GP(id) })).filter(o => o.p);
    exits.forEach(o => { o.up = (o.p.level || 0) - (pl.level || 0); o.dx = pl.gen || o.p.gen ? 0 : o.p.x - pl.x; o.dy = pl.gen || o.p.gen ? 0 : o.p.y - pl.y; });
    const rank = o => o.p.gen ? 3 : o.up > 0 ? 0 : o.up < 0 ? 2 : 1;
    exits.sort((a, b) => rank(a) - rank(b) || a.dx - b.dx);
    exits.forEach(({ id, p, up, dx, dy }) => {
      const b = document.createElement('button');
      const seen = p.gen || state.visited.indexOf(id) >= 0;
      b.type = 'button'; b.className = 'soglia' + (!seen ? ' new' : '') + (id === fresh ? ' fresh' : '') + (p.gen ? ' altrove' : '');
      const arrow = p.gen ? '⋯' : up > 0 ? '⇧' : up < 0 ? '⇩' : compass(dx, dy);
      if (up) b.classList.add('vertical');
      const label = p.gen && !pl.gen ? 'Più in là' : p.name;
      b.innerHTML = `<span class="arrow" aria-hidden="true">${arrow}</span><span class="sname">${label}</span>`;
      b.title = p.gen ? 'Un posto che nessuno ha mai visto' : up > 0 ? 'Sali: ' + ATH.levelName(p.level) : up < 0 ? 'Scendi: ' + ATH.levelName(p.level) : (seen ? p.ora : 'Non ci sei ancora stato');
      b.addEventListener('click', () => travel(id));
      b.addEventListener('pointerdown', e => e.stopPropagation());
      box.appendChild(b);
    });
    if (pl.scream) {
      const u = document.createElement('button');
      u.type = 'button'; u.className = 'soglia scream'; u.id = 'btnScream';
      u.innerHTML = `<span class="arrow" aria-hidden="true">◉</span><span class="sname">Tieni premuto per urlare</span>`;
      const on = e => { e.preventDefault(); e.stopPropagation(); if (memoria && !memoria.screaming) { memoria.scream(true); u.classList.add('on'); screamed = true; } };
      const off = () => { if (memoria && memoria.screaming) { memoria.scream(false); u.classList.remove('on'); setTimeout(() => toast(Math.random() < 0.5 ? 'Nessuno ha sentito.' : 'Nessuno ha sentito. O forse sì.'), 1500); } };
      u.addEventListener('pointerdown', on); u.addEventListener('pointerup', off); u.addEventListener('pointerleave', off); u.addEventListener('pointercancel', off);
      u.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) on(e); });
      u.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') off(); });
      box.appendChild(u);
    }
    if (pl.help) {
      const h = document.createElement('button');
      h.type = 'button'; h.className = 'soglia help' + (helping ? ' calling' : ''); h.id = 'btnHelp';
      h.innerHTML = `<span class="arrow" aria-hidden="true">◌</span><span class="sname">${helping ? 'Hai chiamato…' : 'Chiedi aiuto'}</span>`;
      h.addEventListener('click', callHelp);
      h.addEventListener('pointerdown', e => e.stopPropagation());
      box.appendChild(h);
    }
  }
  // la direzione vera sulla mappa: otto direzioni, il nord in alto
  function compass(dx, dy) {
    if (Math.abs(dx) < 0.004 && Math.abs(dy) < 0.004) return '→';
    const a = Math.atan2(-dy, dx), i = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
    return ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'][i];
  }
  ATH.compass = compass;
  function callHelp() {
    if (helping) return;
    helping = { t: 0, wait: 9 + Math.random() * 10 };
    toast('Chiami. La voce torna indietro, da sola.');
    if (memoria) { home.m_passi = home.m_passi === undefined ? state.base.m_passi : home.m_passi; }
    moveTo({ m_passi: 0.55, lumen: Math.min(1, state.base.lumen + 0.2) }, helping.wait);
    renderSoglie();
  }
  function updateAtlas() {
    Object.keys(ui.scenes).forEach(k => {
      const card = ui.scenes[k], known = isKnown(k), p = ATH.PLACE[k];
      card.setAttribute('aria-pressed', k === state.scene ? 'true' : 'false');
      card.disabled = !known;
      card.classList.toggle('unknown', !known);
      card.classList.toggle('visited', state.visited.indexOf(k) >= 0);
      card.querySelector('.sc-name').textContent = known ? p.name : '· · ·';
      card.querySelector('.sc-gloss').textContent = known ? ATH.levelName(p.level) + ' · ' + (p.kind === 'stato' ? 'stato dell’animo' : 'luogo') + (state.visited.indexOf(k) < 0 ? ' · non ancora visitato' : '') : 'un luogo che non ricordi';
    });
  }
  function updateStrata() {
    const pl = GP(state.scene), lv = pl ? pl.level : 0;
    document.querySelectorAll('#strata li').forEach(li => li.setAttribute('aria-current', +li.dataset.n === lv ? 'true' : 'false'));
    $('strata').classList.toggle('lost', !!(pl && pl.gen));
  }
  function setAllora(v) { state.allora = clamp01(v); $('allora').value = Math.round(state.allora * 1000); }
  $('allora').addEventListener('input', () => { state.allora = $('allora').value / 1000; pulse(0.04); persist(); });
  ['allora', 'libra'].forEach(id => $(id).addEventListener('pointerdown', e => e.stopPropagation()));
  $('journey').addEventListener('pointerdown', e => { if (e.target.closest('.jbar, .soglie, .lumini, .strata')) e.stopPropagation(); });

  // —— cose che succedono nei luoghi
  const ERODE_KEEP = {};
  function erodeText(el, txt, k) {
    let out = '';
    for (let i = 0; i < txt.length; i++) { const ch = txt[i]; const h = (Math.sin(i * 12.9898 + txt.length) * 43758.5453) % 1; out += ch !== ' ' && Math.abs(h) < k ? ' ' : ch; }
    el.textContent = out;
  }
  function placeMechanics(dt) {
    const pl = GP(state.scene); if (!pl || !engine.ready || traveling) { faceNow *= 0.98; return; }
    // le parole perdono le lettere
    if (pl.erode) {
      const k = Math.min(0.97, dwell / pl.erode);
      if (k - eroded > 0.02) { eroded = k; erodeText($('plName'), pl.name, k * 0.8); erodeText($('plOra'), pl.ora, k); erodeText($('plAllora'), pl.allora, k); }
    }
    // la voce che se ne va
    if (pl.fadeOut) {
      const k = Math.min(1, dwell / pl.fadeOut.secs);
      pl.fadeOut.ids.forEach(id => { state.base[id] = (pl.levels[id] || 0) * (1 - k); });
      state.base.oblio = 0.2 + k * 0.75; state.base.distantia = 0.3 + k * 0.6;
      if (k >= 1 && $('plAllora').dataset.end !== pl.id) { $('plAllora').dataset.end = pl.id; $('plAllora').textContent = pl.fadeOut.end; }
    } else $('plAllora').dataset.end = '';
    // il volto che si dissolve
    faceNow = pl.faceFade ? Math.min(1, dwell / pl.faceFade) : 0;
    // l'ultimo piano: più resti, più è luce
    ascendNow = pl.ascend ? Math.min(1, dwell / 60) : 0;
    // il dubbio: i nomi delle strade non stanno fermi
    if (pl.doubt) {
      doubtT += dt;
      if (doubtT > 1.3) {
        doubtT = 0;
        const btns = Array.from($('soglie').querySelectorAll('.soglia:not(.help):not(.scream)'));
        btns.forEach(b => { const n = b.querySelector('.sname'); if (!n.dataset.real) n.dataset.real = n.textContent; n.textContent = Math.random() < 0.35 ? btns[Math.floor(Math.random() * btns.length)].querySelector('.sname').dataset.real || n.dataset.real : n.dataset.real; b.style.opacity = (0.55 + Math.random() * 0.45).toFixed(2); });
      }
    }
    // l'ultimo respiro
    if (pl.flatline) {
      const k = Math.min(1, dwell / pl.flatline);
      state.base.pulsus = (pl.bpm || 0.3) * (1 - k);
      state.base.respiratio = 0.3 * (1 - k);
      if (k >= 1 && !flatDone && memoria) {
        flatDone = true; memoria.mon.next = 1e12; memoria.flat(true);
        moveTo({ m_respiro: 0 }, 3);
        $('plOra').textContent = 'Poi, semplicemente, il respiro dopo non arriva.';
        setTimeout(() => { if (memoria) memoria.flat(false); }, 7000);
      }
    }
    // risvegliarsi altrove
    if (pl.wake && dwell > pl.wake && !woke) {
      woke = true;
      $('blackout').classList.add('on');
      setTimeout(() => {
        const safe = ['giardino', 'alba', 'felicita', 'ninna', 'neve', 'mare_stelle', 'primo_ricordo', 'cucina', 'salvezza'];
        const scary = ['buio', 'voci', 'ospedale_abb', 'capovolta', 'dormitorio', 'scale_orfano', 'pozzo', 'x:' + Math.floor(Math.random() * 1e9) + ':4:risveglio'];
        const good = Math.random() < 0.5, pool = good ? safe : scary;
        const id = pool[Math.floor(Math.random() * pool.length)];
        if (ATH.PLACE[id] && ATH.PLACE[id].hidden && state.found.indexOf(id) < 0) state.found.push(id);
        travel(id, true);
        setTimeout(() => { $('blackout').classList.remove('on'); toast(good ? 'Ti svegli. Qui sei al sicuro.' : 'Ti svegli. Non sai dove sei. Non ti piace.'); }, 1200);
      }, 2600);
    }
  }

  // —— i lumini del cimitero
  state.lumini = state.lumini || [];
  $('lumini').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('luminiName').value.trim().slice(0, 40);
    if (!v) return;
    state.lumini.unshift(v); state.lumini = state.lumini.slice(0, 24);
    $('luminiName').value = '';
    toast('Hai acceso un lumino per ' + v + '.');
    tombIdx = Math.floor(Math.random() * 16); tombT = 0; tombName = v;
    if (memoria && engine.ready) engine.bell(ATH.rootHz(live.radix) * 8, 0.3, 0.5);
    persist();
  });
  let tombName = null;

  // —— la città verticale (indicatore dei livelli)
  ATH.LEVELS.forEach(l => {
    const li = document.createElement('li'); li.dataset.n = l.n;
    li.innerHTML = `<span class="sd" aria-hidden="true"></span><span class="sn">${l.name}</span>`;
    li.title = l.name + ' · ' + l.gloss;
    $('strata').querySelector('ol').appendChild(li);
  });

  // —— mappa a strati
  const SVGNS = 'http://www.w3.org/2000/svg';
  function drawMap() {
    const svg = $('mapSvg'); svg.innerHTML = '';
    const BAND = { 0: 760 }, bandTop = {};
    let yy = 20;
    ATH.LEVELS.forEach(l => { bandTop[l.n] = yy; yy += (BAND[l.n] || 210); });
    svg.setAttribute('viewBox', `0 0 1000 ${yy + 10}`);
    const X = p => 160 + p.x * 800, Y = p => { const h = BAND[p.level] || 210; return bandTop[p.level] + 40 + p.y * (h - 90); };
    ATH.LEVELS.forEach(l => {
      const h = BAND[l.n] || 210, r = document.createElementNS(SVGNS, 'rect');
      r.setAttribute('x', 0); r.setAttribute('y', bandTop[l.n]); r.setAttribute('width', 1000); r.setAttribute('height', h - 6);
      r.setAttribute('class', 'm-band' + (l.n % 2 ? ' odd' : '')); svg.appendChild(r);
      const tx = document.createElementNS(SVGNS, 'text');
      tx.setAttribute('x', 16); tx.setAttribute('y', bandTop[l.n] + 30); tx.setAttribute('class', 'm-level'); tx.textContent = l.name; svg.appendChild(tx);
      const tg = document.createElementNS(SVGNS, 'text');
      tg.setAttribute('x', 16); tg.setAttribute('y', bandTop[l.n] + 50); tg.setAttribute('class', 'm-lgloss'); tg.textContent = l.gloss; svg.appendChild(tg);
    });
    const cur = GP(state.scene), adj = visibleExits(cur);
    const drawn = {};
    ATH.PLACES.forEach(p => {
      if (!isKnown(p.id)) return;
      p.exits.forEach(e => {
        const q = ATH.PLACE[ATH.exitId(e)]; if (!q || !isKnown(q.id)) return;
        const key = [p.id, q.id].sort().join('|'); if (drawn[key]) return; drawn[key] = 1;
        const l = document.createElementNS(SVGNS, 'line');
        l.setAttribute('x1', X(p)); l.setAttribute('y1', Y(p)); l.setAttribute('x2', X(q)); l.setAttribute('y2', Y(q));
        l.setAttribute('class', 'm-edge' + ((p.id === state.scene || q.id === state.scene) ? ' near' : '') + (p.level !== q.level ? ' vert' : ''));
        svg.appendChild(l);
      });
      if (p.exits.some(e => isGen(ATH.exitId(e)))) {
        const l = document.createElementNS(SVGNS, 'text');
        l.setAttribute('x', X(p) + 14); l.setAttribute('y', Y(p) - 10); l.setAttribute('class', 'm-gen'); l.textContent = '⋯'; svg.appendChild(l);
      }
    });
    let hereNode = null;
    ATH.PLACES.forEach(p => {
      if (!isKnown(p.id)) return;
      const g = document.createElementNS(SVGNS, 'g');
      const visited = state.visited.indexOf(p.id) >= 0, here = p.id === state.scene, reach = visited || adj.indexOf(p.id) >= 0;
      g.setAttribute('class', 'm-node' + (visited ? ' visited' : '') + (here ? ' here' : '') + (reach ? ' reach' : '') + (p.kind === 'stato' ? ' stato' : ''));
      g.setAttribute('transform', `translate(${X(p)},${Y(p)})`);
      g.setAttribute('tabindex', reach && !here ? '0' : '-1');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', p.name + (here ? ' (sei qui)' : ''));
      g.innerHTML = (here ? '<circle class="m-halo" r="22"/>' : '') + `<circle class="m-dot" r="${p.kind === 'stato' ? 7 : 9}"/><text class="m-label" y="${p.y > 0.9 ? -16 : 26}">${p.name}</text>`;
      if (here) hereNode = g;
      const go = () => {
        if (here) return;
        if (!reach) { toast('Non sai ancora come arrivarci da qui.'); return; }
        closeMap(); travel(p.id);
      };
      g.addEventListener('click', go);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      svg.appendChild(g);
    });
    const known = ATH.PLACES.filter(p => isKnown(p.id)).length;
    $('mapCount').textContent = `Visitati ${state.visited.length} di ${ATH.PLACES.length} · altri ${ATH.PLACES.length - known} non li ricordi ancora` + (state.genCount ? ` · ${state.genCount} stanze senza nome attraversate` : '') + (cur && cur.gen ? ' · ora sei nell’Altrove, fuori dalla mappa' : '');
    setTimeout(() => { if (hereNode) { const wrap = $('mapWrap'), r = hereNode.getBoundingClientRect(), w = wrap.getBoundingClientRect(); wrap.scrollTop += r.top - w.top - w.height / 2; } }, 30);
  }
  function openMap() { drawMap(); $('mapov').hidden = false; $('btnMapClose').focus(); }
  function closeMap() { $('mapov').hidden = true; }
  $('btnMap').addEventListener('click', openMap);
  $('btnMapClose').addEventListener('click', closeMap);
  $('mapov').addEventListener('click', e => { if (e.target.id === 'mapov') closeMap(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('mapov').hidden) closeMap(); });
  $('btnWander').addEventListener('click', () => {
    state.sw.mutatio = !state.sw.mutatio; ui.seals.mutatio.set(state.sw.mutatio); syncWander();
    toast(state.sw.mutatio ? 'Vaghi. Ogni tanto i piedi ti portano altrove.' : 'Ti fermi qui.'); persist();
  });
  $('btnKnobs').addEventListener('click', () => $('btnVeil').click());
  function syncWander() { $('btnWander').setAttribute('aria-pressed', state.sw.mutatio ? 'true' : 'false'); }

  // —— fasi
  const phaseList = $('phases');
  ATH.PHASES.forEach((ph, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ph'; b.title = ph.name + ' · ' + ph.gloss;
    b.innerHTML = `<span aria-hidden="true">${ph.glyph}</span><span class="sr">${ph.name}</span>`;
    b.addEventListener('click', () => {
      const cur = Math.floor(state.opus) % 4, delta = (i - cur + 4) % 4;
      if (delta) state.opus = Math.floor(state.opus) + delta - 1 + 0.84;
      pulse(0.1);
    });
    li.appendChild(b); phaseList.appendChild(li);
  });
  const phBtns = Array.from(phaseList.querySelectorAll('.ph'));

  const pal = { bg: ATH.PHASES[0].bg.slice(), accent: ATH.PHASES[0].accent.slice(), second: ATH.PHASES[0].second.slice() };
  const qpal = { bg: ATH.QUIES_PAL.bg.slice(), accent: ATH.QUIES_PAL.accent.slice(), second: ATH.QUIES_PAL.second.slice() };
  const out = { bg: [0, 0, 0], accent: [0, 0, 0], second: [0, 0, 0] };
  let w = [1, 0, 0, 0], phIdx = 0;
  function phaseStep(dt) {
    if (state.sw.rota && !state.sw.lapis) state.opus += dt / 170 * (0.55 + I.agit * 2.6 + I.presence * 0.25 + I.coag * 0.5);
    phIdx = Math.floor(state.opus) % 4;
    const nx = (phIdx + 1) % 4, frac = state.opus - Math.floor(state.opus);
    const bl = smooth(0.8, 1, frac);
    w = [0, 0, 0, 0]; w[phIdx] = 1 - bl; w[nx] += bl;
    const A = ATH.PHASES[phIdx], B = ATH.PHASES[nx];
    ['bg', 'accent', 'second'].forEach(k => { for (let j = 0; j < 3; j++) pal[k][j] = lerp(A[k][j], B[k][j], bl); });
  }
  function bias(id) {
    let v = 0;
    for (let i = 0; i < 4; i++) if (w[i] > 0) v += (ATH.PHASES[i].bias[id] || 0) * w[i];
    return v;
  }

  // colore: rgb ↔ hsl per far girare la tinta col suono
  function toHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h / 6, s, l];
  }
  function toRgb(h, s, l) {
    if (!s) return [l * 255, l * 255, l * 255];
    const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
  }
  const MOTIFS = ['womb', 'face', 'scents', 'doubt', 'purify', 'stars', 'snow', 'haze', 'motes', 'field', 'beam', 'ceiling', 'glass', 'monitor', 'fever', 'sun', 'meet', 'train', 'lights', 'ruin', 'well', 'rose', 'nebula', 'throne', 'city', 'cityFlip', 'windows', 'stairs', 'candles', 'tombs', 'forest', 'whispers', 'void', 'tears', 'cracks', 'river', 'underwater'];
  let hueShift = 0, qVis = 0; const motif = {}; MOTIFS.forEach(m => motif[m] = 0);

  // —— registrazione
  const btnRec = $('btnRec'), recTime = $('recTime'), btnWav = $('btnSaveWav'), btnCmp = $('btnSaveCmp');
  btnRec.addEventListener('click', async () => {
    if (!engine.ready) return;
    if (!recorder.recording) {
      btnWav.hidden = true; btnCmp.hidden = true;
      recorder.start();
      btnRec.setAttribute('aria-pressed', 'true'); $('recLabel').textContent = 'Ferma';
      document.body.classList.add('is-rec');
    } else {
      btnRec.disabled = true;
      await recorder.stop();
      btnRec.disabled = false;
      btnRec.setAttribute('aria-pressed', 'false'); $('recLabel').textContent = 'Registra';
      document.body.classList.remove('is-rec');
      await ATH.hostReady;
      btnWav.hidden = !ATH.canSave('wav');
      const ext = recorder.compressedExt;
      btnCmp.hidden = !(recorder.compressed && ext && ATH.canSave(ext));
      if (ext) btnCmp.textContent = 'Salva ' + ext.toUpperCase();
      const mb = recorder.wav ? (recorder.wav.size / 1048576).toFixed(1) : 0;
      if (btnWav.hidden && btnCmp.hidden) toast('Registrazione chiusa, ma il salvataggio non è disponibile in questa vista.');
      else toast('Registrazione chiusa: ' + fmtTime(recorder.frames / engine.ctx.sampleRate) + (btnWav.hidden ? '' : ' · WAV ' + mb + ' MB'));
    }
  });
  btnWav.addEventListener('click', async () => { if (recorder.wav) toast((await ATH.saveFile('athanor-' + ATH.stamp() + '.wav', recorder.wav)).msg); });
  btnCmp.addEventListener('click', async () => { if (recorder.compressed) toast((await ATH.saveFile('athanor-' + ATH.stamp() + '.' + recorder.compressedExt, recorder.compressed)).msg); });
  function fmtTime(s) { s = Math.floor(s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

  // —— formule
  $('btnFormula').addEventListener('click', async () => {
    await ATH.hostReady;
    if (!ATH.canSave('json')) { toast('Il salvataggio non è disponibile in questa vista.'); return; }
    const blob = new Blob([JSON.stringify(formula(), null, 2)], { type: 'application/json' });
    toast((await ATH.saveFile('athanor-formula-' + ATH.stamp() + '.json', blob)).msg);
  });
  $('btnLoad').addEventListener('click', () => $('fileFormula').click());
  $('fileFormula').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try { toast(applyFormula(JSON.parse(rd.result)) ? 'Formula caricata.' : 'Questo file non contiene una formula di Athanor.'); persist(); }
      catch (err) { toast('Il file non è leggibile: serve un .json salvato da Athanor.'); }
    };
    rd.readAsText(f);
    e.target.value = '';
  });

  $('btnTrans').addEventListener('click', transmute);
  $('btnVeil').addEventListener('click', () => {
    const veiled = document.body.classList.toggle('veiled');
    $('btnVeil').textContent = veiled ? 'Svela' : 'Vela';
    $('btnVeil').setAttribute('aria-pressed', veiled ? 'true' : 'false');
    $('btnKnobs').setAttribute('aria-pressed', veiled ? 'false' : 'true');
    measure();
  });
  $('btnQuiet').addEventListener('click', async () => {
    if (!engine.ready) return;
    if (engine.ctx.state === 'running') { await engine.ctx.suspend(); $('btnQuiet').textContent = 'Riaccendi'; document.body.classList.add('quiet'); }
    else { await engine.ctx.resume(); $('btnQuiet').textContent = 'Quiete'; document.body.classList.remove('quiet'); }
  });

  let toastT = null;
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3800);
  }

  try { const raw = localStorage.getItem(STORE); if (raw) applyFormula(JSON.parse(raw)); else setLibra(state.libra); } catch (e) { setLibra(state.libra); }

  // —— accensione
  $('btnStart').addEventListener('click', async () => {
    const btn = $('btnStart');
    btn.disabled = true; btn.textContent = 'Il fuoco prende…';
    try {
      await engine.start();
      engine.setCryptaSize(state.base.crypta);
      quies = new ATH.Quies(engine);
      memoria = new ATH.Memoria(engine);
      engine.on('bell', e => visuals.bell(e));
      engine.on('strike', e => visuals.strike(e));
      engine.on('mem', e => visuals.dream.event(e));
      engine.on('bowl', e => visuals.dream.event({ kind: 'bowl', pan: e.pan }));
      document.body.classList.add('lit');
      $('gate').hidden = true;
      travel(ATH.getPlace(state.scene) ? state.scene : 'soglia', true);
      setTimeout(hideHint, 9000);
      if (window.innerWidth <= 760 && !document.body.classList.contains('veiled')) $('btnVeil').click();
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Riprova';
      $('gateErr').textContent = 'Questo browser non ha acceso il motore audio. Prova con una versione recente di Chrome, Firefox o Safari.';
    }
  });

  // —— geometria del crogiolo
  let center = { x: innerWidth / 2, y: innerHeight / 2 };
  function measure() {
    const r = stage.getBoundingClientRect();
    center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    if (r.height < 120) center.y = innerHeight * 0.3;
  }
  window.addEventListener('resize', measure);
  setTimeout(measure, 50);

  // —— ciclo
  let last = performance.now(), frameN = 0, cssT = 0, curPh = -1, clock = 0, filtKey = '';
  const root = document.documentElement, canvas = $('crucible');
  function step(now, draw) {
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now; clock += dt;

    const speed = I.acc / dt; I.acc = 0;
    I.agit += (Math.min(1, speed * 0.55) - I.agit) * Math.min(1, dt * (speed * 0.55 > I.agit ? 5 : 0.9));
    const present = now - I.lastMove < 2500;
    I.presence += ((present ? 1 : 0) - I.presence) * Math.min(1, dt * 1.4);
    I.coag += (I.coagT - I.coag) * Math.min(1, dt * (I.coagT ? 1.3 : 0.7));
    I.wheel *= Math.pow(0.9, dt);
    I.idle = present ? 0 : I.idle + dt;

    if (tween) {
      tween.t += dt;
      const k = smooth(0, 1, tween.t / tween.dur);
      Object.keys(tween.to).forEach(id => { state.base[id] = lerp(tween.from[id], tween.to[id], k); ui.knobs[id].set(state.base[id]); });
      if (tween.t >= tween.dur) { tween = null; if (engine.ready) engine.setCryptaSize(state.base.crypta); persist(); }
    }

    // bilancia che segue il luogo
    if (libraTween) {
      libraTween.t += dt;
      setLibra(lerp(libraTween.from, libraTween.to, smooth(0, 1, libraTween.t / libraTween.dur)));
      if (libraTween.t >= libraTween.dur) libraTween = null;
    }
    // restare: le soglie nascoste si aprono
    if (engine.ready && !traveling) {
      dwell += dt;
      const pl = GP(state.scene);
      if (pl) {
        pl.exits.forEach(e => { if (typeof e !== 'string' && !isKnown(e.id) && dwell > e.linger) reveal(e.id); });
        // restare: le strade svaniscono
        if (pl.stay) $('soglie').style.setProperty('--fade', Math.max(0.12, 1 - dwell / 90).toFixed(2));
        // a volte bisogna scappare
        if (pl.urge && dwell > pl.urge && !urged) {
          urged = true; $('soglie').classList.add('urge');
          toast('Devi andartene da qui.');
          home.pulsus = home.pulsus === undefined ? state.base.pulsus : home.pulsus;
          moveTo({ pulsus: Math.min(1, state.base.pulsus + 0.3), m_cuore: Math.max(state.base.m_cuore, 0.4) }, 8);
        }
        // il cimitero: ti fermi davanti a una lapide
        if (pl.candles) { tombT += dt; if (tombT > 9) { tombT = 0; tombIdx++; tombName = state.lumini.length && Math.random() < 0.35 ? state.lumini[Math.floor(Math.random() * state.lumini.length)] : null; } }
      }
      // qualcuno ha sentito
      if (helping) {
        helping.t += dt; rescueAmt = Math.min(1, helping.t / helping.wait);
        if (helping.t > helping.wait) { helping = null; toast('Qualcuno ti ha sentito.'); travel('salvezza'); }
      }
    }
    if (!helping) rescueAmt *= Math.pow(0.3, dt);
    placeMechanics(dt);
    if (hushTween) { hushTween.t += dt; hushNow = lerp(hushTween.from, hushTween.to, smooth(0, 1, hushTween.t / hushTween.dur)); if (hushTween.t >= hushTween.dur) hushTween = null; }
    if (passageT >= 0) { passageT += dt; if (passageT > (passDir ? 4.4 : 3.4)) { passageT = -1; passDir = 0; } }
    // vagare
    let autoMeta = 0;
    if (state.sw.mutatio && engine.ready && !traveling) {
      autoT += dt;
      autoMeta = 0.25 * (0.5 - 0.5 * Math.cos(clock / 45));
      if (autoT > autoNext) {
        autoT = 0; autoNext = 55 + Math.random() * 65;
        const ex = visibleExits(GP(state.scene)).filter(id => !isGen(id) || Math.random() < 0.3);
        const fresh = ex.filter(id => !isGen(id) && state.visited.indexOf(id) < 0);
        const pool = fresh.length && Math.random() < 0.6 ? fresh : ex;
        if (pool.length) travel(pool[Math.floor(Math.random() * pool.length)]);
      }
    }

    phaseStep(dt);

    // respiro
    const breathOn = state.sw.spira;
    const rate = (4 + state.base.respiratio * 4) / 60;
    const breath01 = 0.5 - 0.5 * Math.cos(clock * Math.PI * 2 * rate);
    const breathMul = breathOn ? 1 - state.base.profunditas * 0.75 * (1 - breath01) : 1;

    // valori vivi
    const tt = now / 1000 * (0.3 + state.base.anima * 1.8);
    const sp = state.sw.lapis ? 0 : state.base.spiritus * (1 + Math.min(0.6, I.idle / 40));
    const locked = state.choice.diapason !== 'libero';
    ATH.PARAMS.forEach(p => {
      const s = seeds[p.id];
      if (!p.drift || (locked && p.id === 'radix')) { live[p.id] = state.base[p.id]; return; }
      const n = Math.sin(tt * s[0] + s[3]) * 0.5 + Math.sin(tt * s[1] + s[4]) * 0.3 + Math.sin(tt * s[2] + s[5]) * 0.2;
      live[p.id] = clamp01(state.base[p.id] + n * sp * p.drift * 1.7 + bias(p.id) + gesture(p.id) + (p.id === 'metamorphosis' ? autoMeta : 0) + (ALLORA[p.id] || 0) * state.allora);
    });
    { const pl = GP(state.scene); if (pl && pl.stay) live.lumen = clamp01(live.lumen + Math.min(0.3, dwell / 200)); }
    const hush = Math.max(hushNow, state.base.silentium);

    engine.apply(live, state.sw, { px: I.px * I.presence, libra: state.libra, breath: breathMul, hush }, dt);
    if (engine.ready) {
      const rootHz = ATH.rootHz(live.radix);
      quies.apply(live, state.sw, state.choice, dt, rootHz);
      memoria.apply(live, state.sw, state.choice, dt, rootHz);
    }

    if (draw) {
      // quanto è quieto il mondo, e quale ricordo lo colora
      let memE = 0; ATH.MEM_IDS.forEach(id => memE = Math.max(memE, live[id]));
      memE *= Math.min(1, live.memoria * 1.4);
      const qT = Math.max(clamp01((state.libra - 0.15) / 0.7), memE * 0.7);
      qVis += (qT - qVis) * Math.min(1, dt * 0.8);
      const sc = GP(state.scene);
      const target = sc ? sc.pal : ATH.QUIES_PAL;
      const lm = state.choice.lumina === 'luogo' ? ((sc && sc.lumina) || 'accese') : state.choice.lumina;
      darkNow += ((engine.ready ? LUM[lm] || 0 : 0) - darkNow) * Math.min(1, dt * 0.5);
      glowNow += ((lm === 'candele' ? 1 : 0) - glowNow) * Math.min(1, dt * 0.5);
      ['bg', 'accent', 'second'].forEach(k => { for (let j = 0; j < 3; j++) qpal[k][j] = lerp(qpal[k][j], target[k][j], Math.min(1, dt * 0.5)); });
      const mAmt = Math.min(1, 0.35 + memE * 1.6) * (engine.ready ? 1 : 0);
      MOTIFS.forEach(m => { const on = sc && sc.motif[m] ? sc.motif[m] * mAmt : 0; motif[m] += (Math.min(1.4, on) - motif[m]) * Math.min(1, dt * 0.4); });
      const mix = qVis * 0.9;
      ['bg', 'accent', 'second'].forEach(k => { for (let j = 0; j < 3; j++) out[k][j] = lerp(pal[k][j], qpal[k][j], mix); });
      if (state.sw.tinta && engine.ready) {
        const target = Math.max(-0.06, Math.min(0.06, (visuals.centroid - 0.16) * 0.5));
        hueShift += (target - hueShift) * Math.min(1, dt * 0.6);
        ['accent', 'second'].forEach(k => {
          const h = toHsl(out[k][0], out[k][1], out[k][2]);
          const lv = Math.min(0.9, h[2] * (0.9 + visuals.level * 0.5));
          out[k] = toRgb((h[0] + hueShift + 1) % 1, Math.min(1, h[1] * (0.9 + visuals.level * 0.6)), lv);
        });
      }

      if (++frameN % 3 === 0) ATH.PARAMS.forEach(p => { if (GBYID[p.group].tab === curTab) ui.knobs[p.id].setLive(live[p.id]); });
      visuals.frame(dt, {
        L: live, sw: state.sw, pal: out, w, agit: I.agit, presence: I.presence, px: I.px, py: I.py,
        cx: center.x, cy: center.y, coag: I.coag, analyser: engine.ready ? engine.analyser : null,
        phaseGlyph: ATH.PHASES[phIdx].glyph, q: qVis, motif,
        wave: memoria ? memoria.waveVal : 0, voiceAct: memoria ? memoria.voiceAct : 0,
        breathOn, breath01, passage: passageT >= 0 ? Math.sin(Math.PI * Math.min(1, passageT / (passDir ? 4.4 : 3.4))) : 0, passDir,
        levelN: sc ? sc.level || 0 : 0, lumini: state.lumini, tombIdx, tombName, rescue: rescueAmt, faceFade: faceNow, ascend: ascendNow, dark: darkNow * (1 - ascendNow * 0.8), darkMode: lm, candleGlow: glowNow * darkNow
      });
      cssT += dt;
      if (cssT > 0.15) {
        cssT = 0;
        const r = a => a.map(Math.round).join(',');
        root.style.setProperty('--accent', `rgb(${r(out.accent)})`);
        root.style.setProperty('--accent-rgb', r(out.accent));
        root.style.setProperty('--second', `rgb(${r(out.second)})`);
        root.style.setProperty('--bg-rgb', r(out.bg));
        root.style.setProperty('--bg', `rgb(${r(out.bg)})`);
        root.style.setProperty('--grain', (state.base.granum * 0.24).toFixed(3));
        const fk = `brightness(${(0.6 + state.base.claritas * 0.8).toFixed(2)}) saturate(${((0.2 + state.base.color * 1.6) * (1 - state.allora * 0.45)).toFixed(2)}) sepia(${(state.allora * 0.55).toFixed(2)})`;
        document.body.classList.toggle('no-verba', !state.sw.verba);
        const pl = $('place'); pl.style.setProperty('--ora', (1 - state.allora * 0.7).toFixed(2)); pl.style.setProperty('--allora', (0.6 + state.allora * 0.4).toFixed(2));
        if (fk !== filtKey) { filtKey = fk; canvas.style.filter = fk; }
        if (curPh !== phIdx) {
          curPh = phIdx;
          const ph = ATH.PHASES[phIdx];
          $('phaseName').textContent = ph.name; $('phaseGloss').textContent = ph.gloss;
          phBtns.forEach((b, i) => b.setAttribute('aria-current', i === phIdx ? 'step' : 'false'));
          document.body.dataset.phase = ph.id;
        }
        root.style.setProperty('--opus', (state.opus - Math.floor(state.opus)).toFixed(3));
        if (recorder.recording) recTime.textContent = fmtTime(recorder.frames / engine.ctx.sampleRate);
      }
    }
  }
  function loop(now) { requestAnimationFrame(loop); try { step(now, true); } catch (err) { if (window.console) console.error(err); } }
  requestAnimationFrame(loop);
  setInterval(() => { if (document.hidden) step(performance.now(), false); }, 200);

  ATH.state = state; ATH.live = live; ATH.engine = engine;
  ATH.recall = recall; ATH.showTab = showTab; ATH.travel = travel; ATH.reveal = reveal;
  Object.defineProperty(ATH, 'memoria', { get: () => memoria });
})(window.ATH);
