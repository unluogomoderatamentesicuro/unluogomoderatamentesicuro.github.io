/* ATHANOR — regia: stato, influenze involontarie, fasi dell'Opera, quiete,
   ricordi, colori che seguono il suono, registrazione.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const $ = id => document.getElementById(id);
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const STORE = 'athanor.formula.v6', TABSTORE = 'athanor.tab';

  const engine = new ATH.Engine();
  const recorder = new ATH.Recorder(engine);
  const visuals = new ATH.Visuals($('crucible'));
  let quies = null, memoria = null;

  const state = { base: {}, sw: {}, choice: {}, libra: 0.3, opus: 0, scene: ATH.START || 'soglia', allora: 0, visited: [], trail: [], seen: [], found: [], flags: {}, answers: {}, mood: {} };
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
      state.base[id] = v; touch(id);
      if (id === 'crypta') { clearTimeout(cryptaTimer); cryptaTimer = setTimeout(() => engine.ready && engine.setCryptaSize(v), 600); }
      pulse(0.06); persist();
    },
    seal: (id, on) => {
      state.sw[id] = on; pulse(0.12); wakeTab(SW_TAB[id]); touched['sw:' + id] = clock;
      if (id === 'mutatio') syncWander();
      const SEAL_SAY = { pax: ['La pace scende, piano, in mezzo minuto.', 'La pace si ritira.'], stasis: ['L’accordo della quiete resta fermo.', 'L’accordo torna a cambiare.'], fixa: ['La melodia del ricordo non cambierà più.', 'La melodia del ricordo torna a trasformarsi.'], lapis: ['La pietra: le manopole smettono di vagare da sole.', 'Le manopole tornano a vagare.'], spira: ['Il suono respira: si gonfia e si svuota.', 'Il respiro si ferma.'], rota: ['La ruota delle fasi gira da sola.', 'La ruota si ferma.'] };
      if (SEAL_SAY[id]) toast(SEAL_SAY[id][on ? 0 : 1]);
      if (id === 'stasis' && !on && quies) quies.chordT = 1e3;
      if (engine.ready && on && id === 'fulmen') engine.strike(0.5);
      persist();
    },
    choice: (id, v) => { state.choice[id] = v; touched['ch:' + id] = clock; if (id === 'diapason') { ATH.diapason = v; fork(v); } pulse(0.08); persist(); },
    scene: id => recall(id),
    action: id => {
      if (id === 'newMemory') {
        if (memoria) { memoria.newMemory(); toast('Un ricordo nuovo: la melodia di carillon e pianoforte è cambiata.'); }
        else toast('Prima accendi il fuoco.');
      }
    }
  });

  // —— il diapason: un tono puro alla frequenza scelta, e la nota su cui è accordato il mondo
  function fork(v) {
    if (!engine.ready || v === 'libero') return;
    const c = engine.ctx, t = c.currentTime + 0.02, f = +v;
    const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o.frequency.value = f; o2.frequency.value = f * 2.0; const g2 = c.createGain(); g2.gain.value = 0.06;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.01); g.gain.setTargetAtTime(0, t + 0.05, 1.4);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(engine.masterSum); o.start(t); o2.start(t); o.stop(t + 7); o2.stop(t + 7);
    toast('Diapason: ' + (v === '440' || v === '432' ? 'La a ' + v + ' Hz' : v + ' Hz') + '. Tutto il mondo si accorda su questa nota.');
  }
  const NOTE = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
  function noteName(f) { const n = Math.round(12 * Math.log2(f / 440)) + 57; const cents = Math.round((12 * Math.log2(f / 440) + 57 - n) * 100); return NOTE[((n % 12) + 12) % 12] + (cents ? (cents > 0 ? ' +' : ' ') + cents + ' cent' : ''); }
  { const sec = document.querySelector('.vessel[data-group="diapason"]'); if (sec) { const p = document.createElement('p'); p.className = 'diap-read'; p.id = 'diapRead'; sec.insertBefore(p, sec.querySelector('.vnote')); } }
  function updateDiap() {
    const el = $('diapRead'); if (!el) return;
    const f = ATH.rootHz(live.radix), v = state.choice.diapason;
    el.textContent = 'Nota fondamentale adesso: ' + f.toFixed(1).replace('.', ',') + ' Hz · ' + noteName(f) + (v === 'libero' ? ' · accordatura libera: la nota scivola con la manopola Radix' : v === '440' || v === '432' ? ' · agganciata ai semitoni del La ' + v : ' · agganciata a ' + v + ' Hz, spostato di ottave');
  }

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
  libraEl.addEventListener('input', () => { state.libra = libraEl.value / 1000; libraTween = null; libraHeld = clock; pulse(0.05); persist(); });
  function setLibra(v) { state.libra = clamp01(v); libraEl.value = Math.round(state.libra * 1000); }

  function formula() {
    return { athanor: 6, base: Object.assign({}, state.base), sw: Object.assign({}, state.sw), choice: Object.assign({}, state.choice), libra: +state.libra.toFixed(3), place: state.scene, allora: +state.allora.toFixed(3), seen: state.seen.slice(), found: state.found.slice(), lumini: (state.lumini || []).slice(), genCount: state.genCount || 0, flags: Object.assign({}, state.flags), answers: Object.assign({}, state.answers), mood: Object.assign({}, state.mood), opus: +state.opus.toFixed(3) };
  }
  // auto = ricordi del browser: si conservano le scoperte e i lumini, ma il cammino ricomincia dalla soglia
  function applyFormula(f, auto) {
    if (!f || typeof f !== 'object') return false;
    let n = 0;
    const seen = Array.isArray(f.seen) ? f.seen : Array.isArray(f.visited) ? f.visited : null;
    if (seen) state.seen = seen.filter(id => ATH.PLACE[id]);
    if (Array.isArray(f.found)) state.found = f.found.filter(id => ATH.PLACE[id]);
    if (Array.isArray(f.lumini)) state.lumini = f.lumini.filter(x => typeof x === 'string').slice(0, 24);
    if (isFinite(+f.genCount)) state.genCount = +f.genCount;
    ['flags', 'answers', 'mood'].forEach(k => { if (f[k] && typeof f[k] === 'object') state[k] = Object.assign({}, f[k]); });
    if (auto) { updateAtlas(); return true; }
    if (f.base) ATH.PARAMS.forEach(p => { const v = +f.base[p.id]; if (f.base[p.id] !== undefined && isFinite(v)) { state.base[p.id] = clamp01(v); ui.knobs[p.id].set(state.base[p.id]); n++; } });
    if (f.sw) ATH.SWITCHES.forEach(s => { if (typeof f.sw[s.id] === 'boolean') { state.sw[s.id] = f.sw[s.id]; ui.seals[s.id].set(f.sw[s.id]); n++; } });
    if (f.choice) ATH.CHOICES.forEach(c => { const v = f.choice[c.id]; if (c.options.some(o => o.v === v)) { state.choice[c.id] = v; ui.choices[c.id].set(v); n++; } });
    ATH.diapason = state.choice.diapason;
    if (isFinite(+f.libra)) setLibra(+f.libra);
    if (isFinite(+f.opus)) state.opus = Math.max(0, +f.opus);
    const pid = f.place || f.scene;
    if (pid && ATH.getPlace(pid) && pid !== state.scene) { if (engine.ready) travel(pid); else state.scene = pid; }
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
      case 'cinis': return a * 0.16;
      case 'crepitus': return a * 0.12;
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
  let tween = null, clock = 0;
  function moveTo(to, dur) {
    // ciò che hai toccato da poco resta tuo: i luoghi non lo spostano
    Object.keys(to).forEach(k => { if (clock - (touched[k] || -1e9) < HOLD) delete to[k]; });
    tween = { from: Object.assign({}, state.base), to, t: 0, dur };
  }
  // —— le tue mani hanno la precedenza: ciò che giri si sente sempre
  const HOLD = 120;                                   // per due minuti un luogo non cambia la manopola che hai girato
  const touched = {}, wake = { fornax: 0, quies: 0, memoria: 0, visio: 0 }, wakeT = { fornax: -1e9, quies: -1e9, memoria: -1e9, visio: -1e9 };
  const SW_TAB = {}; ATH.SWITCHES.forEach(s2 => { const g = GBYID[s2.group]; SW_TAB[s2.id] = g ? g.tab : 'fornax'; });
  let wokeToast = 0;
  function wakeTab(tab) { if (tab && wake[tab] !== undefined) wakeT[tab] = clock; }
  function touch(id) {
    touched[id] = clock;
    if (tween && id in tween.to) { delete tween.to[id]; }
    if (id in home) delete home[id];
    const p = PBYID[id]; if (!p) return;
    const tab = GBYID[p.group].tab;
    if (p.group === 'somnus' && id === 'silentium') return;   // il silenzio non sveglia la fornace
    wakeTab(tab);
    audition(id);
  }
  // alcune manopole agiscono piano, o solo quando qualcosa suona: allora fanno sentire subito cosa cambiano
  const audT = {};
  function audition(id) {
    if (!engine.ready || clock - (audT[id] || -9) < 0.6) return;
    audT[id] = clock;
    const root = ATH.rootHz(live.radix);
    let base = root; while (base < 110) base *= 2;
    const scale = ATH.SCALES[state.choice.modus] || ATH.SCALES.pentatonico;
    if (id === 'aurora' && quies) quies.chordT = 1e3;
    if ((id === 'patera' || id === 'resonantia' || id === 'altitudo') && quies) {
      const oct = Math.pow(2, 1 + Math.min(2, Math.floor(state.base.altitudo * 3)));
      quies.bowl(base * oct * ATH.ratioAt(scale, Math.floor(Math.random() * scale.length)) / 2, state.base.resonantia, Math.random() * 1.2 - 0.6);
    }
    if (id === 'radix' || id === 'aurum') engine.bell(root * 4, Math.random() * 1.2 - 0.6, 0.5);
    if (id === 'tempus' || id === 'ouroboros') engine.strike(0.35);
  }
  const recent = id => { const d = clock - (touched[id] === undefined ? -1e9 : touched[id]); return d < 40 ? 1 : d < 90 ? 1 - (d - 40) / 50 : 0; };
  function wakeStep(dt) {
    Object.keys(wake).forEach(k => {
      const d = clock - wakeT[k], tgt = d < 20 ? 1 : d < 50 ? 1 - (d - 20) / 30 : 0;
      wake[k] += (tgt - wake[k]) * Math.min(1, dt * (tgt > wake[k] ? 1.4 : 0.6));
    });
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
  let libraHeld = -1e9, pressNow = 0, pressFreed = false;
  let traveling = false, passageT = -1, passDir = 0, dwell = 0, libraTween = null, hushTween = null, autoT = 0, autoNext = 80;
  let clueN = 0, clueT = 0, nightDone = false, nightT = -1, peaceK = 0, paxK = 0, swingOn = false;
  let screamed = false, eroded = 0, flatDone = false, woke = false, doubtT = 0, faceNow = 0, ascendNow = 0;
  let hushNow = 0, helping = null, rescueAmt = 0, urged = false, tombIdx = 0, tombT = 0, darkNow = 0, glowNow = 0;
  const GP = id => ATH.getPlace(id);
  const isGen = id => typeof id === 'string' && id.indexOf('x:') === 0;
  const isKnown = id => { if (isGen(id)) return true; const p = ATH.PLACE[id]; return p && (!p.hidden || state.found.indexOf(id) >= 0); };
  const visibleExits = pl => (pl ? pl.exits : []).map(e => ATH.exitId(e)).filter(isKnown);
  const LUM = { accese: 0, soffuse: 0.4, candele: 0.62, torcia: 0.94, spente: 0.82 };

  function travel(id, quick, byRoute) {
    const pl = GP(id);
    if (!pl || (traveling && !quick)) return;
    if (!byRoute && route) stopRoute(true);
    const from = GP(state.scene);
    { const hb = document.getElementById('btnHide'); if (hb) { const inT = id === 'tana'; hb.setAttribute('aria-pressed', inT ? 'true' : 'false'); hb.textContent = inT ? 'Esci' : 'Nasconditi'; } }
    const dl = from ? Math.sign((pl.level || 0) - (from.level || 0)) : 0;
    const dur = dl ? 4.4 : 3.4;
    pressFreed = false; traveling = !quick; passageT = quick ? -1 : 0; passDir = quick ? 0 : dl; dwell = 0; urged = false; helping = null; eroded = 0; flatDone = false; woke = false;
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
    if (pl.libra !== undefined && clock - libraHeld > HOLD) libraTween = { from: state.libra, to: pl.libra, t: 0, dur: quick ? 2.5 : 6 };
    // il rumore arriva di colpo, la quiete arriva piano
    hushTween = { from: hushNow, to: pl.hush || 0, t: 0, dur: quick ? 2.5 : ((pl.hush || 0) > hushNow ? 14 : 2.2) };
    ATH.currentWhispers = pl.whisperWords || null; clueN = 0; clueT = 0; nightDone = false; nightT = -1;
    const mine = k => clock - (touched[k] === undefined ? -1e9 : touched[k]) < HOLD * 2;
    if (pl.modus && !mine('ch:modus')) { state.choice.modus = pl.modus; ui.choices.modus.set(pl.modus); }
    if (!mine('sw:spira')) { state.sw.spira = !!pl.spira; ui.seals.spira.set(state.sw.spira); }
    if (memoria && Math.random() < 0.4) memoria.newMemory();
    state.scene = id;
    if (state.trail[state.trail.length - 1] !== id) state.trail.push(id);
    if (pl.gen) state.genCount = (state.genCount || 0) + 1;
    else {
      if (state.visited.indexOf(id) < 0) state.visited.push(id);
      if (state.seen.indexOf(id) < 0) state.seen.push(id);
      if (pl.hidden && state.found.indexOf(id) < 0) state.found.push(id);
    }
    const hid = pl.exits.filter(e => typeof e !== 'string' && !isKnown(e.id));
    if (hid.length && Math.random() < 0.12) reveal(hid[Math.floor(Math.random() * hid.length)].id, true);
    if (pl.forget && !quick) setTimeout(() => forget(pl.forget), 4000);
    checkSecrets(id, true);
    if (pl.newMelody && memoria) memoria.newMemory();
    autoT = 0;
    setTimeout(() => { renderPlace(); $('journey').classList.remove('leaving'); }, quick ? 60 : 1700 + (dl ? 600 : 0));
    setTimeout(() => { traveling = false; }, quick ? 0 : dur * 1000);
    updateAtlas(); updateStrata(); if (!$('mapov').hidden) drawMap();
    pulse(0.1); persist();
  }
  function forget(n) {
    const pool = state.seen.filter(id => ['soglia', state.scene, 'lete'].indexOf(id) < 0);
    const gone = [];
    for (let i = 0; i < n && pool.length; i++) {
      const id = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      const vi = state.visited.indexOf(id); if (vi >= 0) state.visited.splice(vi, 1);
      const si = state.seen.indexOf(id); if (si >= 0) state.seen.splice(si, 1);
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
    const CAPS = ['Qualcosa che avevi dimenticato torna a galla: ', 'Ti sembra di ricordare un posto che prima non c’era: ', 'Forse è un sogno. Forse no: ', 'Una porta che non avevi mai visto: '];
    toast(p.secret ? CAPS[Math.floor(Math.random() * CAPS.length)] + p.name : (quiet ? 'Ti sembra di ricordare un passaggio: ' : 'Si apre un passaggio che non c’era: ') + p.name);
    renderSoglie(id); updateAtlas(); persist();
  }
  // —— le capsule del tempo: luoghi nascosti che compaiono a modo loro
  const CAPSULES = ATH.PLACES.filter(p => p.secret && p.hidden);
  const needsOk = c => { const n = c.secret.needs; if (!n) return true; return (Array.isArray(n) ? n : [n]).every(k => state.flags[k] || state.seen.indexOf(k) >= 0); };
  function checkSecrets(id, arriving) {
    CAPSULES.forEach(c => {
      if (isKnown(c.id) || !needsOk(c) || c.secret.at.indexOf(id) < 0) return;
      if (arriving && c.secret.chance && Math.random() < c.secret.chance) setTimeout(() => { if (state.scene === id) reveal(c.id); }, 5000 + Math.random() * 9000);
    });
    // e a volte, senza nessun motivo
    if (arriving && Math.random() < 0.035) {
      const pool = CAPSULES.filter(c => !isKnown(c.id) && needsOk(c));
      if (pool.length) { const c = pool[Math.floor(Math.random() * pool.length)]; setTimeout(() => reveal(c.id), 8000 + Math.random() * 10000); }
    }
  }
  function lingerSecrets() {
    CAPSULES.forEach(c => { if (!isKnown(c.id) && c.secret.linger && needsOk(c) && c.secret.at.indexOf(state.scene) >= 0 && dwell > c.secret.linger) reveal(c.id); });
  }
  // —— i luoghi che fanno domande
  let askT = null;
  function renderAsk(pl) {
    clearTimeout(askT);
    const box = $('plAsk'); box.innerHTML = ''; box.hidden = !pl.ask;
    if (!pl.ask) return;
    const okQ = q => (!q.if || state.flags[q.if]) && (!q.ifnot || !state.flags[q.ifnot]);
    const qs = pl.ask;
    let i = qs.findIndex((q, k) => okQ(q) && state.answers[pl.id + ':' + k] === undefined);
    const again = i < 0;
    if (again) { const av = qs.map((q, k) => k).filter(k => okQ(qs[k]) && qs[k].ifnot === undefined); if (!av.length) { box.hidden = true; return; } i = av[Math.floor(Math.random() * av.length)]; }
    const q = qs[i], key = pl.id + ':' + i;
    const p = document.createElement('p'); p.className = 'ask-q'; p.textContent = q.q; box.appendChild(p);
    const row = document.createElement('div'); row.className = 'ask-a';
    q.a.forEach((a, k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ask-b'; b.textContent = a.t;
      b.addEventListener('pointerdown', e => e.stopPropagation());
      b.addEventListener('click', () => {
        const prev = state.answers[key];
        state.answers[key] = k;
        if (a.f) state.flags[a.f] = (state.flags[a.f] || 0) + 1;
        if (a.mus) Object.keys(a.mus).forEach(m => { state.mood[m] = Math.max(-0.15, Math.min(0.15, (state.mood[m] || 0) + a.mus[m])); });
        // la stessa domanda, un'altra volta: non sempre la stessa risposta
        let say = a.say;
        if (again && prev !== undefined) say = prev === k ? (Math.random() < 0.5 ? 'L’altra volta avevi detto lo stesso. Ne sei ancora sicuro?' : say) : 'L’altra volta avevi risposto un’altra cosa. Quale delle due è vera?';
        box.innerHTML = ''; const r = document.createElement('p'); r.className = 'ask-say'; r.textContent = say; box.appendChild(r);
        pulse(0.1); persist();
        if (memoria && Math.random() < 0.5) memoria.newMemory();
        checkSecrets(pl.id, false);
        if (qs.findIndex((qq, kk) => okQ(qq) && state.answers[pl.id + ':' + kk] === undefined) >= 0) askT = setTimeout(() => { if (state.scene === pl.id) renderAsk(pl); }, 7000);
      });
      row.appendChild(b);
    });
    box.appendChild(row);
  }
  // —— il nascondiglio: da qualunque posto, quando non hai più voglia di girare
  let prevScene = null;
  function enterTana() {
    if (state.scene === 'tana') { leaveTana(); return; }
    if (route) stopRoute(true);
    prevScene = state.scene;
    if (state.sw.mutatio) { state.sw.mutatio = false; ui.seals.mutatio.set(false); syncWander(); }
    travel('tana');
    $('btnHide').setAttribute('aria-pressed', 'true'); $('btnHide').textContent = 'Esci';
  }
  function leaveTana() {
    const back = GP(prevScene) && prevScene !== 'tana' ? prevScene : 'soglia';
    travel(back);
    $('btnHide').setAttribute('aria-pressed', 'false'); $('btnHide').textContent = 'Nasconditi';
  }
  $('btnHide').addEventListener('click', enterTana);
  function renderPlace() {
    const pl = GP(state.scene); if (!pl) return;
    const total = ATH.PLACES.length, n = state.seen.length;
    const kind = pl.gen ? 'altrove · profondità ' + pl.depth : (pl.kind === 'stato' ? 'stato dell’animo' : 'luogo') + ' · ' + ATH.levelName(pl.level);
    $('plKind').textContent = kind + ' · ' + n + ' di ' + total + ' trovati' + (state.genCount ? ' · ' + state.genCount + ' stanze senza nome' : '');
    $('plName').textContent = pl.name;
    $('plOra').textContent = pl.ora + (pl.lostText ? ' ' + pl.lostText : '');
    $('plAllora').textContent = pl.allora;
    $('lumini').hidden = !pl.candles;
    renderAsk(pl);
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
      const seen = p.gen || state.seen.indexOf(id) >= 0;
      b.type = 'button'; b.className = 'soglia' + (!seen ? ' new' : '') + (id === fresh ? ' fresh' : '') + (p.gen ? ' altrove' : '');
      const toMind = !!p.mind !== !!pl.mind, arrow = p.gen ? '⋯' : up > 0 ? '⇧' : up < 0 ? '⇩' : toMind ? '◌' : compass(dx, dy);
      if (toMind) b.classList.add('mind');
      if (up) b.classList.add('vertical');
      const label = p.gen && !pl.gen ? 'Più in là' : p.name;
      b.innerHTML = `<span class="arrow" aria-hidden="true">${arrow}</span><span class="sname">${label}</span>`;
      b.title = toMind ? (p.mind ? 'Dentro la testa: ' + p.name : 'Si torna fuori: ' + p.name) : p.gen ? 'Un posto che nessuno ha mai visto' : up > 0 ? 'Sali: ' + ATH.levelName(p.level) : up < 0 ? 'Scendi: ' + ATH.levelName(p.level) : (seen ? p.ora : 'Non ci sei ancora stato');
      b.addEventListener('click', () => travel(id));
      b.addEventListener('pointerdown', e => e.stopPropagation());
      box.appendChild(b);
    });
    if (pl.safe) {
      const u = document.createElement('button');
      u.type = 'button'; u.className = 'soglia safe-out';
      const back = GP(prevScene) ? GP(prevScene).name : 'La soglia';
      u.innerHTML = `<span class="arrow" aria-hidden="true">◠</span><span class="sname">Esci piano · ${back}</span>`;
      u.addEventListener('click', () => leaveTana()); u.addEventListener('pointerdown', e => e.stopPropagation());
      box.appendChild(u);
    }
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
      card.classList.toggle('visited', state.seen.indexOf(k) >= 0);
      card.querySelector('.sc-name').textContent = known ? p.name : '· · ·';
      card.querySelector('.sc-gloss').textContent = known ? ATH.levelName(p.level) + ' · ' + (p.kind === 'stato' ? 'stato dell’animo' : 'luogo') + (state.seen.indexOf(k) < 0 ? ' · non ancora visitato' : '') : 'un luogo che non ricordi';
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
    // la casa che fa rumore, poi tace
    swingOn = !!pl.swing;
    if (pl.swing && !hushTween) hushNow = 0.5 + 0.48 * Math.sin(Math.PI * 2 * dwell / pl.swing - Math.PI / 2);
    // la pace: restando, tutto si spegne piano
    peaceK = pl.peace ? smooth(0, 1, dwell / pl.peace) : 0;
    // i dettagli e le domande, uno alla volta
    if (pl.clues) {
      clueT += dt;
      if (clueN < pl.clues.length && (clueN === 0 ? clueT > 3 : clueT > 8)) {
        clueT = 0; clueN++;
        $('plAllora').textContent = pl.clues.slice(Math.max(0, clueN - 2), clueN).join(' ');
      }
    }
    // l'incubo: un'ondata, poi il silenzio e il cuore
    if (pl.nightmare && !nightDone && dwell > pl.nightmare) {
      nightDone = true; nightT = 0;
      engine.strike(1); engine.strike(0.8);
      if (memoria) memoria.burst(memoria.lv.m_sussurri, engine.ctx.currentTime + 0.05, 1.2, 1.5, 300, 0);
    }
    if (nightT >= 0) {
      nightT += dt;
      if (nightT < 3.5) { hushNow = 0; setLibra(0.05); }
      else if (nightT < 4) { hushNow = 1; setLibra(0.9); state.base.pulsus = 0.85; toast('Ti svegli di colpo. Era un sogno. Respira.'); nightT = 99; }
    }
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

  // —— il percorso verso un luogo lontano
  let route = null;                      // { target, path: [id, …] }
  function findPath(from, to) {
    if (from === to) return [];
    const prev = { [from]: null }, q = [from];
    while (q.length) {
      const c = q.shift();
      for (const n of visibleExits(GP(c))) {
        if (isGen(n) || n in prev) continue;
        prev[n] = c;
        if (n === to) { const path = []; let k = to; while (k !== from) { path.unshift(k); k = prev[k]; } return path; }
        q.push(n);
      }
    }
    return null;
  }
  function routeTo(id) {
    const path = findPath(state.scene, id);
    if (!path) { toast('Da qui non sai ancora come arrivarci.'); return; }
    if (!path.length) return;
    route = path.length > 1 ? { target: id, path: path.slice(1) } : null;
    if (route) toast('Cammini verso ' + GP(id).name + ': ' + path.length + ' passaggi.');
    travel(path[0], false, true);
    renderRoute();
  }
  function stopRoute(silent) { if (route && !silent) toast('Ti fermi qui.'); route = null; renderRoute(); }
  function renderRoute() {
    const el = $('route');
    if (!route) { el.hidden = true; return; }
    el.hidden = false;
    $('routeText').textContent = 'Verso ' + GP(route.target).name + ' · ancora ' + route.path.length + (route.path.length > 1 ? ' passaggi' : ' passaggio');
  }
  $('routeStop').addEventListener('click', () => stopRoute());
  ATH.routeTo = routeTo;

  // —— mappa a strati
  const SVGNS = 'http://www.w3.org/2000/svg';
  let mapSel = null;
  const el = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k])); if (parent) parent.appendChild(e); return e; };
  // —— la mappa: un'unica carta scura, strato sotto strato, che si scorre dall'alto (i cieli) al basso (il grembo)
  const AT = ATH.ATLAS;
  let mapZ = 0;
  function wrapName(n, max) {
    max = max || 17;
    if (n.length <= max) return [n];
    const w = n.split(' '); let a = '', k = 0;
    while (k < w.length && (a + ' ' + w[k]).trim().length <= Math.max(10, Math.ceil(n.length / 2) + 2)) { a = (a + ' ' + w[k]).trim(); k++; }
    return [a, w.slice(k).join(' ')].filter(Boolean);
  }
  const GLY = {
    tree: 'M0 -9 L6 3 L-6 3 Z M0 3 V7', pine: 'M0 -10 L5 -2 L2 -2 L6 5 L-6 5 L-2 -2 L-5 -2 Z', wave: 'M-10 0 Q-5 -4 0 0 T10 0', grass: 'M-4 3 L-5 -3 M0 3 V-5 M4 3 L5 -3',
    cross: 'M0 -8 V7 M-4 -3 H4', house: 'M-6 6 V-1 L0 -7 L6 -1 V6 Z', star: 'M0 -4 V4 M-4 0 H4', peak: 'M-10 6 L-2 -7 L2 -1 L5 -5 L11 6', reed: 'M-3 5 V-6 M0 5 V-9 M3 5 V-5',
    ruin: 'M-7 6 V-4 H-3 V1 H1 V-6 H5 V6', drop: 'M0 -5 Q4 1 0 4 Q-4 1 0 -5 Z', arch: 'M-6 6 V-1 Q0 -9 6 -1 V6', eye: 'M-7 0 Q0 -6 7 0 Q0 6 -7 0 Z M0 -1.5 V1.5',
    spiral: 'M0 0 Q3 -3 5 0 Q5 5 0 6 Q-6 5 -6 0 Q-5 -7 2 -8', moon: 'M2 -6 A6 6 0 1 0 2 6 A4.5 4.5 0 1 1 2 -6 Z'
  };
  const LAND = { sea: ['wave', 'wave', 'drop'], field: ['grass', 'grass', 'tree'], water: ['wave', 'reed', 'drop'], trees: ['pine', 'tree', 'pine'], town: ['house', 'arch', 'house'],
    house: ['house', 'grass'], ruin: ['ruin', 'grass'], tomb: ['cross', 'cross', 'tree'], city: ['house', 'house', 'ruin'], void: ['grass', 'star'], sky: ['star', 'star', 'moon'],
    mount: ['peak', 'pine', 'peak'], under: ['drop', 'arch'], deep: ['wave', 'drop'], mind: ['eye', 'spiral'], dream: ['moon', 'star', 'spiral'] };
  const PALE = { sky: '200,205,255', mount: '170,200,170', field: '170,200,150', trees: '150,190,150', sea: '130,175,220', water: '130,175,220', deep: '110,150,200', mind: '200,180,240', dream: '200,180,240', tomb: '210,200,190', under: '190,170,160' };
  function renderTabs() {
    const box = $('atlasTabs'); box.innerHTML = '';
    const cur = GP(state.scene);
    AT.pages.forEach((pg, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'atab' + (cur && cur.page === i ? ' here' : ''); b.dataset.i = i;
      b.innerHTML = `<span class="rn">${pg.n}</span><span class="tn">${pg.title}</span>`;
      b.addEventListener('click', () => $('mapWrap').scrollTo({ top: Math.max(0, pg.top * mapZ - 4), behavior: 'smooth' }));
      box.appendChild(b);
    });
  }
  function markTab() {
    const wrap = $('mapWrap'), y = (wrap.scrollTop + wrap.clientHeight * 0.35) / (mapZ || 1);
    let k = 0; AT.pages.forEach((pg, i) => { if (y >= pg.top) k = i; });
    $('atlasTabs').querySelectorAll('.atab').forEach((b, i) => b.classList.toggle('on', i === k));
  }
  function drawMap(keepScroll) {
    const svg = $('mapSvg'); svg.innerHTML = '';
    const W = AT.PW, H = AT.H, f = n => n.toFixed(1);
    const wrap = $('mapWrap'), ww = wrap.clientWidth || window.innerWidth;
    if (!mapZ) mapZ = ww >= 900 ? Math.min(0.9, (ww - 6) / W) : Math.max((ww - 4) / W, 0.5);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.width = Math.round(W * mapZ) + 'px'; svg.style.height = Math.round(H * mapZ) + 'px';
    const cur = GP(state.scene), adj = cur && !cur.gen ? visibleExits(cur) : [];
    const sel = mapSel && ATH.PLACE[mapSel] ? mapSel : null;
    const selPath = sel ? findPath(state.scene, sel) : null;
    const onPath = new Set(selPath ? [state.scene].concat(selPath) : []);
    const pathKey = new Set(), trailKey = new Set();
    if (selPath) { let a = state.scene; selPath.forEach(b => { pathKey.add([a, b].sort().join('|')); a = b; }); }
    for (let i = 1; i < state.trail.length; i++) trailKey.add([state.trail[i - 1], state.trail[i]].sort().join('|'));
    const known = new Set(ATH.PLACES.filter(p => isKnown(p.id)).map(p => p.id));
    const gB = el('g', {}, svg), gD = el('g', {}, svg), gE = el('g', {}, svg), gT = el('g', {}, svg), gN = el('g', {}, svg);
    // gli strati
    AT.pages.forEach((pg, k) => {
      el('rect', { x: 0, y: pg.top, width: W, height: pg.h - 4, class: 'm-band' + (k % 2 ? ' odd' : '') + (pg.n === 'VI' ? ' mind' : '') }, gB);
      const t = el('text', { x: W / 2, y: pg.top + 52, class: 'm-stratum' }, gB); t.textContent = pg.title;
      const g2 = el('text', { x: W / 2, y: pg.top + 80, class: 'm-stratum-g' }, gB); g2.textContent = pg.sub;
      const hw = pg.title.length * 9 + 40;
      el('path', { d: `M${W / 2 - hw - 220} ${pg.top + 46} H${W / 2 - hw} M${W / 2 + hw} ${pg.top + 46} H${W / 2 + hw + 220}`, class: 'm-orn' }, gB);
      el('circle', { cx: W / 2 - hw - 228, cy: pg.top + 46, r: 3, class: 'm-orn-dot' }, gB); el('circle', { cx: W / 2 + hw + 228, cy: pg.top + 46, r: 3, class: 'm-orn-dot' }, gB);
      pg.sections.forEach(sc => { const st = el('text', { x: 40, y: sc.y + 30, class: 'm-substratum' }, gB); st.textContent = sc.name + '  ·  ' + sc.gloss; el('path', { d: `M40 ${sc.y + 40} H${W - 40}`, class: 'm-orn thin' }, gB); });
    });
    // contrade: il nome, e qualche segno del paesaggio nei vuoti (niente contorni)
    const boxes = [];
    ATH.PLACES.forEach(p => { if (!known.has(p.id) || p.ax === undefined) return; boxes.push(p.isHub ? [p.ax - 120, p.ay - 62, p.ax + 120, p.ay + 30] : [p.ax - 14, p.ay - 24, p.ax + 186, p.ay + 36]); });
    AT.pages.forEach(pg => pg.cells.forEach(c => {
      if (!known.has(c.hub)) return;
      const nm = el('text', { x: c.x + c.w / 2, y: c.y + 30, class: 'm-region', fill: PALE[c.land] ? `rgba(${PALE[c.land]},.55)` : null }, gD); nm.textContent = c.name;
      boxes.push([c.x + c.w / 2 - 190, c.y + 8, c.x + c.w / 2 + 190, c.y + 38]);
      let seed = (c.x * 7 + c.y * 13) | 0; const rr = () => { seed = (seed * 16807 + 11) % 2147483647; return seed / 2147483647; };
      const kinds = LAND[c.land] || ['grass'];
      for (let i = 0, n = 0; i < 60 && n < 7; i++) {
        const x = c.x + 12 + rr() * (c.w - 24), y = c.y + 44 + rr() * (c.h - 50);
        if (boxes.some(b => x > b[0] - 10 && x < b[2] + 10 && y > b[1] - 12 && y < b[3] + 12)) continue;
        n++; boxes.push([x - 12, y - 10, x + 12, y + 10]);
        el('path', { d: GLY[kinds[Math.floor(rr() * kinds.length)]], transform: `translate(${x.toFixed(0)},${y.toFixed(0)}) scale(${(0.9 + rr() * 0.5).toFixed(2)})`, class: 'm-deco', stroke: PALE[c.land] ? `rgb(${PALE[c.land]})` : null }, gD);
      }
    }));
    // porte (verso altri livelli, la mente, o un altro strato della terra)
    const doors = {};
    ATH.PLAN.roads.forEach(r => {
      const p = ATH.PLACE[r.a], q = ATH.PLACE[r.b]; if (!p || !q || !known.has(p.id) || !known.has(q.id)) return;
      if (r.kind !== 'portal' && p.page === q.page) return;
      const sym = (a, b) => (b.level || 0) > (a.level || 0) ? '⇧' : (b.level || 0) < (a.level || 0) ? '⇩' : (!!b.mind !== !!a.mind) ? '◌' : b.ay > a.ay ? '↓' : '↑';
      (doors[p.id] = doors[p.id] || []).push(sym(p, q) + ' ' + q.name); (doors[q.id] = doors[q.id] || []).push(sym(q, p) + ' ' + p.name);
    });
    // le strade
    ATH.PLAN.roads.forEach(r => {
      const p = ATH.PLACE[r.a], q = ATH.PLACE[r.b]; if (!p || !q || !known.has(p.id) || !known.has(q.id) || p.ax === undefined || q.ax === undefined) return;
      const key = [p.id, q.id].sort().join('|'), onp = pathKey.has(key), tr = trailKey.has(key);
      const cross = r.kind === 'portal' || p.page !== q.page;
      if (cross && !onp) return;
      const near = p.id === state.scene || q.id === state.scene, dy = q.ay - p.ay, dx = q.ax - p.ax;
      let d;
      if (r.kind === 'lane' || r.kind === 'row') d = `M${f(p.ax)} ${f(p.ay)} C${f(p.ax)} ${f(p.ay + dy * 0.6)} ${f(q.ax)} ${f(q.ay - dy * 0.4)} ${f(q.ax)} ${f(q.ay)}`;
      else if (r.kind === 'short') { const low = Math.max(p.ay, q.ay) + 38; d = `M${f(p.ax)} ${f(p.ay)} C${f(p.ax + 10)} ${f(low)} ${f(q.ax - 10)} ${f(low)} ${f(q.ax)} ${f(q.ay)}`; }
      else if (r.kind === 'via') d = `M${f(p.ax)} ${f(p.ay)} C${f(p.ax + dx * 0.4)} ${f(p.ay - 22)} ${f(q.ax - dx * 0.4)} ${f(q.ay - 22)} ${f(q.ax)} ${f(q.ay)}`;
      else d = `M${f(p.ax)} ${f(p.ay)} C${f(p.ax + 40)} ${f(p.ay + dy * 0.5)} ${f(q.ax - 40)} ${f(q.ay - dy * 0.5)} ${f(q.ax)} ${f(q.ay)}`;
      el('path', { d, class: 'm-edge m-' + (cross ? 'portal' : r.kind) + (near ? ' near' : '') + (onp ? ' path' : '') + (tr ? ' trail' : '') }, onp || tr ? gT : gE);
    });
    let hereNode = null;
    ATH.PLACES.forEach(p => {
      if (!known.has(p.id) || p.ax === undefined) return;
      const here = p.id === state.scene, today = state.visited.indexOf(p.id) >= 0, near = adj.indexOf(p.id) >= 0;
      const g = el('g', {
        class: 'm-node' + (p.isHub ? ' hub' : '') + (here ? ' here' : '') + (today ? ' today' : '') + (near ? ' near' : '') + (p.kind === 'stato' ? ' stato' : '') + (sel === p.id ? ' sel' : '') + (onPath.has(p.id) ? ' onpath' : '') + (state.seen.indexOf(p.id) < 0 ? ' never' : '') + (p.secret ? ' secret' : '') + (p.mind ? ' mind' : ''),
        transform: `translate(${p.ax},${p.ay})`, tabindex: here ? '-1' : '0', role: 'button', 'aria-label': p.name + ' · ' + (p.district || '') + (here ? ' (sei qui)' : near ? ' (a un passo)' : '')
      }, gN);
      el('circle', { class: 'm-hit', r: 26 }, g);
      if (here) el('circle', { class: 'm-halo', r: 22 }, g);
      el('circle', { class: 'm-dot', r: here ? 10 : p.isHub ? 9 : 7 }, g);
      const lines = wrapName(p.name, p.isHub ? 24 : 17);
      let tx;
      if (p.isHub) tx = el('text', { class: 'm-label hubl', x: 0, y: -20 - (lines.length - 1) * 21 }, g);
      else tx = el('text', { class: 'm-label side', x: 15, y: 6 - (lines.length - 1) * 10 }, g);
      lines.forEach((ln, k) => { const ts = el('tspan', { x: p.isHub ? 0 : 15, dy: k ? (p.isHub ? 21 : 20) : 0 }, tx); ts.textContent = ln; });
      const ds = doors[p.id];
      if (ds && ds.length) {
        const dt = el('text', { class: 'm-door' + (p.isHub ? ' hubp' : ''), x: p.isHub ? 0 : 15, y: p.isHub ? 30 : 6 + (lines.length - 1) * 10 + 20 }, g);
        dt.textContent = ds[0] + (ds.length > 1 ? '  · +' + (ds.length - 1) : '');
        const tt = el('title', {}, dt); tt.textContent = ds.join('\n');
      }
      if (p.exits.some(e => isGen(ATH.exitId(e)))) { const gt = el('text', { class: 'm-gen', x: -16, y: 6, 'text-anchor': 'end' }, g); gt.textContent = '⋯'; }
      if (here) hereNode = g;
      const pick = () => { if (here) return; mapSel = p.id; drawMap(true); };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    renderTabs();
    let tick = false; wrap.onscroll = () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; markTab(); }); } };
    markTab();
    const bar = $('mapGo');
    if (sel && sel !== state.scene) {
      bar.hidden = false;
      const sp = GP(sel);
      $('mapGoText').textContent = selPath ? sp.name + ' · ' + sp.district + ' · ' + (selPath.length === 1 ? 'a un passo da qui' : selPath.length + ' passaggi') : sp.name + ' · da qui non sai ancora come arrivarci';
      $('mapGoBtn').disabled = !selPath;
    } else bar.hidden = true;
    const nKnown = known.size;
    $('mapCount').textContent = `Trovati ${state.seen.length} di ${ATH.PLACES.length} · oggi ${state.visited.length}` + (ATH.PLACES.length - nKnown ? ` · ${ATH.PLACES.length - nKnown} ancora nascosti` : '') + (state.genCount ? ` · ${state.genCount} stanze senza nome` : '') + (cur && cur.gen ? ' · ora sei nell’Altrove, fuori dalla mappa' : '') + (cur && cur.offmap ? ' · ora sei nel nascondiglio' : '');
    if (!keepScroll) setTimeout(() => { if (hereNode) { const r = hereNode.getBoundingClientRect(), w = wrap.getBoundingClientRect(); wrap.scrollTop += r.top - w.top - w.height / 2; wrap.scrollLeft += r.left - w.left - w.width / 2; markTab(); } }, 30);
  }
  function zoomMap(k) {
    const wrap = $('mapWrap'), w = wrap.getBoundingClientRect();
    const cxp = (wrap.scrollLeft + w.width / 2) / mapZ, cyp = (wrap.scrollTop + w.height / 2) / mapZ;
    mapZ = Math.max(0.3, Math.min(1.5, mapZ * k));
    drawMap(true);
    wrap.scrollLeft = cxp * mapZ - w.width / 2; wrap.scrollTop = cyp * mapZ - w.height / 2;
  }
  function turn(d) {
    const wrap = $('mapWrap'), y = (wrap.scrollTop + wrap.clientHeight * 0.35) / mapZ;
    let k = 0; AT.pages.forEach((pg, i) => { if (y >= pg.top) k = i; });
    k = Math.max(0, Math.min(AT.pages.length - 1, k + d));
    wrap.scrollTo({ top: AT.pages[k].top * mapZ - 4, behavior: 'smooth' });
  }
  $('mapZoomIn').addEventListener('click', () => zoomMap(1.2));
  $('mapZoomOut').addEventListener('click', () => zoomMap(0.83));
  $('mapPrev').addEventListener('click', () => turn(-1));
  $('mapNext').addEventListener('click', () => turn(1));
  $('mapHere').addEventListener('click', () => drawMap(false));
  window.addEventListener('resize', () => { if (!$('mapov').hidden) { mapZ = 0; drawMap(true); } });
  $('mapGoBtn').addEventListener('click', () => { const id = mapSel; mapSel = null; closeMap(); routeTo(id); });
  function openMap() { mapSel = null; mapZ = 0; $('mapov').hidden = false; drawMap(); $('btnMapClose').focus(); }
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
      if (delta || state.opus - Math.floor(state.opus) > 0.8) {
        // si va subito alla fase scelta, con una dissolvenza di qualche secondo
        jump = { w: w.slice(), pal: { bg: pal.bg.slice(), accent: pal.accent.slice(), second: pal.second.slice() }, k: 1 };
        state.opus = Math.floor(state.opus) + delta + 0.001;
        if (delta === 0) state.opus = Math.floor(state.opus) + 0.001;
        phBtns.forEach((x, j) => x.setAttribute('aria-current', j === i ? 'step' : 'false'));
      }
      pulse(0.1);
    });
    li.appendChild(b); phaseList.appendChild(li);
  });
  const phBtns = Array.from(phaseList.querySelectorAll('.ph'));

  const pal = { bg: ATH.PHASES[0].bg.slice(), accent: ATH.PHASES[0].accent.slice(), second: ATH.PHASES[0].second.slice() };
  const qpal = { bg: ATH.QUIES_PAL.bg.slice(), accent: ATH.QUIES_PAL.accent.slice(), second: ATH.QUIES_PAL.second.slice() };
  const out = { bg: [0, 0, 0], accent: [0, 0, 0], second: [0, 0, 0] };
  let w = [1, 0, 0, 0], phIdx = 0, jump = null;
  function phaseStep(dt) {
    if (state.sw.rota && !state.sw.lapis) state.opus += dt / 170 * (0.55 + I.agit * 2.6 + I.presence * 0.25 + I.coag * 0.5);
    phIdx = Math.floor(state.opus) % 4;
    const nx = (phIdx + 1) % 4, frac = state.opus - Math.floor(state.opus);
    const bl = smooth(0.8, 1, frac);
    w = [0, 0, 0, 0]; w[phIdx] = 1 - bl; w[nx] += bl;
    const A = ATH.PHASES[phIdx], B = ATH.PHASES[nx];
    ['bg', 'accent', 'second'].forEach(k => { for (let j = 0; j < 3; j++) pal[k][j] = lerp(A[k][j], B[k][j], bl); });
    if (jump) {
      jump.k = Math.max(0, jump.k - dt / 3.5);
      const k = smooth(0, 1, jump.k);
      for (let i = 0; i < 4; i++) w[i] = lerp(w[i], jump.w[i], k);
      ['bg', 'accent', 'second'].forEach(c => { for (let j = 0; j < 3; j++) pal[c][j] = lerp(pal[c][j], jump.pal[c][j], k); });
      if (jump.k <= 0) jump = null;
    }
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
  const MOTIFS = ['clutter', 'wallpaper', 'toycar', 'loculi', 'cameo', 'hand', 'womb', 'face', 'scents', 'doubt', 'purify', 'stars', 'snow', 'haze', 'motes', 'field', 'beam', 'ceiling', 'glass', 'monitor', 'fever', 'sun', 'meet', 'train', 'lights', 'ruin', 'well', 'rose', 'nebula', 'throne', 'city', 'cityFlip', 'windows', 'stairs', 'candles', 'tombs', 'forest', 'whispers', 'void', 'tears', 'cracks', 'river', 'underwater', 'nook', 'corridor', 'swing', 'trees', 'lake', 'fireflies', 'fog', 'veil', 'vetrate', 'arcade', 'machine', 'film', 'cradle', 'mountain', 'deep', 'rainfall', 'wisps', 'path', 'sprout', 'ice', 'door', 'crowd', 'dream', 'xmas', 'egg', 'board', 'siren', 'blanket'];
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
  // il menu «Altro» su schermi piccoli
  $('btnMore').addEventListener('click', e => {
    e.stopPropagation();
    const open = !document.body.classList.contains('more-open');
    document.body.classList.toggle('more-open', open);
    $('btnMore').setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', e => { if (document.body.classList.contains('more-open') && !e.target.closest('#moreMenu') && !e.target.closest('#btnMore')) { document.body.classList.remove('more-open'); $('btnMore').setAttribute('aria-expanded', 'false'); } });
  $('moreMenu').addEventListener('click', e => { if (e.target.closest('button') && (window.innerWidth <= 760 || window.innerHeight <= 520)) setTimeout(() => { document.body.classList.remove('more-open'); $('btnMore').setAttribute('aria-expanded', 'false'); }, 150); });
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

  setLibra(state.libra);
  try { const raw = localStorage.getItem(STORE) || localStorage.getItem('athanor.formula.v4'); if (raw) applyFormula(JSON.parse(raw), true); } catch (e) { /* niente memoria */ }

  // —— accensione
  // sonda per le prove automatiche (non cambia nulla)
  ATH._probe = { state, live, ui, travel: (id) => travel(id, true), engine, wake, touched, motif };
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
      if ((window.innerWidth <= 760 || window.innerHeight <= 520) && !document.body.classList.contains('veiled')) $('btnVeil').click();
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Riprova';
      $('gateErr').textContent = 'Il motore audio non si è acceso. Ricarica la pagina forzando l’aggiornamento (Cmd+Maiusc+R o Ctrl+F5); se non basta, prova con una versione recente di Chrome, Firefox o Safari. Dettaglio: ' + (err && err.message ? err.message : err);
      if (window.console) console.error(err);
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
  let last = performance.now(), frameN = 0, cssT = 0, curPh = -1, filtKey = '';
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
        lingerSecrets();
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
    // il percorso continua da solo, un luogo alla volta
    if (route && engine.ready && !traveling && dwell > 2.8) {
      const next = route.path.shift();
      if (!route.path.length) route = null;
      if (next && GP(next)) travel(next, false, true);
      renderRoute();
    }
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
        const fresh = ex.filter(id => !isGen(id) && state.seen.indexOf(id) < 0);
        const pool = fresh.length && Math.random() < 0.6 ? fresh : ex;
        if (pool.length) travel(pool[Math.floor(Math.random() * pool.length)]);
      }
    }

    phaseStep(dt);

    // respiro
    const breathOn = state.sw.spira || recent('profunditas') > 0 || recent('respiratio') > 0;
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
      live[p.id] = clamp01(state.base[p.id] + n * sp * p.drift * 1.7 * (1 - recent(p.id) * 0.8) + bias(p.id) + gesture(p.id) + (p.id === 'metamorphosis' ? autoMeta : 0) + (ALLORA[p.id] || 0) * state.allora);
    });
    { const pl = GP(state.scene); if (pl && pl.stay) live.lumen = clamp01(live.lumen + Math.min(0.3, dwell / 200));
      // in certi luoghi, tirando verso Allora, torna il rumore di quando erano vivi
      if (pl && pl.alloraLevels && state.allora > 0.01) Object.keys(pl.alloraLevels).forEach(id => { live[id] = clamp01(live[id] + pl.alloraLevels[id] * state.allora); }); }
    paxK = clamp01(paxK + (state.sw.pax ? dt / 24 : -dt / 10));
    const pk = Math.max(peaceK, smooth(0, 1, paxK));
    if (pk > 0.001) {
      // la pace: si calmano il fuoco, le voci e il nastro; si aprono il velo, il coro, la carezza
      ['tempestas', 'crepitus', 'cinis', 'calcinatio', 'plica', 'contritio', 'plumbum', 'm_sussurri', 'm_acufene', 'm_ronzio', 'm_tubature', 'nastro'].forEach(id => { live[id] *= 1 - pk * 0.9 * (1 - recent(id)); });
      live.oblio *= 1 - pk * 0.6 * (1 - recent('oblio'));
      live.lumen = clamp01(live.lumen + pk * 0.3); live.velum = clamp01(live.velum + pk * 0.3);
      live.chorus = clamp01(live.chorus + pk * 0.25); live.aether = clamp01(live.aether + pk * 0.2);
      live.m_carezza = Math.max(live.m_carezza, pk * 0.3); live.m_scacciapensieri = Math.max(live.m_scacciapensieri, pk * 0.18);
    }
    // la folla, gli sguardi: più resti, più il luogo ti stringe; poi, se resti ancora, si allenta
    { const pl = GP(state.scene); let tgt = 0;
      if (pl && pl.press && !traveling) { const k = dwell / pl.press; tgt = k < 1 ? smooth(0, 1, k) : k < 1.6 ? 1 : Math.max(0, 1 - (k - 1.6) * 1.2);
        if (k >= 1.6 && !pressFreed) { pressFreed = true; $('plAllora').textContent = 'Nessuno ti stava guardando. Nessuno si ricorderà di quella frase. Solo tu.'; } }
      pressNow += (tgt - pressNow) * Math.min(1, dt * 0.6);
      if (pressNow > 0.005) {
        const k = pressNow;
        live.m_voci = clamp01(live.m_voci + k * 0.4); live.m_sussurri = clamp01(live.m_sussurri + k * 0.35); live.m_acufene = clamp01(live.m_acufene + k * 0.3);
        live.m_cuore = clamp01(live.m_cuore + k * 0.35); live.pulsus = clamp01(Math.max(live.pulsus, 0.45 + k * 0.4));
        live.distantia = clamp01(live.distantia - k * 0.3); live.lumen = clamp01(live.lumen - k * 0.2); live.nastro = clamp01(live.nastro + k * 0.25);
        live.solutio = clamp01(live.solutio - k * 0.15);
      }
    }
    // quello che hai risposto alle domande resta, piano, dentro la musica
    Object.keys(state.mood).forEach(m => { if (live[m] !== undefined) live[m] = clamp01(live[m] + state.mood[m]); });
    // se tocchi la fornace, la fornace si sveglia anche nei luoghi quieti
    wakeStep(dt);
    const wF = wake.fornax, wQ = wake.quies, wM = wake.memoria;
    const hush = Math.max(hushNow, pk, state.base.silentium);
    const libraAll = Math.max(state.libra, pk * 0.97);
    const libraQ = Math.max(libraAll, wQ * 0.5);
    if (wM > 0.01) live.memoria = Math.max(live.memoria, wM * 0.62);
    // il battito si sente solo se c'è un cuore; il nastro e l'oblio solo se c'è un ricordo che suona
    { const rp = recent('pulsus'); if (rp > 0) live.m_cuore = Math.max(live.m_cuore, rp * 0.3); }
    { const rk = Math.max(recent('oblio'), recent('nastro'), recent('distantia'), recent('metamorphosis'), recent('memoria'));
      if (rk > 0) { let e = 0; ATH.MEM_IDS.forEach(m => e = Math.max(e, live[m])); if (e < 0.12) { live.m_carillon = Math.max(live.m_carillon, rk * 0.3); live.m_fruscio = Math.max(live.m_fruscio, rk * 0.2); } } }
    if (wF > 0.6 && (hushNow > 0.5 || libraAll > 0.8 || pk > 0.5) && clock - wokeToast > 90) { wokeToast = clock; toast('La fornace si riaccende piano, sotto le tue mani.'); }

    engine.apply(live, state.sw, { px: I.px * I.presence, libra: libraAll, libraQ, wakeF: state.base.silentium > 0.5 ? 0 : wF, breath: breathMul, hush }, dt);
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
        levelN: sc ? sc.level || 0 : 0, lumini: state.lumini, tombIdx, tombName, rescue: rescueAmt, faceFade: faceNow, ascend: ascendNow, dark: darkNow * (1 - ascendNow * 0.8), darkMode: lm, candleGlow: glowNow * darkNow, press: pressNow
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
        if (curTab === 'quies') updateDiap();
        if (recorder.recording) recTime.textContent = fmtTime(recorder.frames / engine.ctx.sampleRate);
      }
    }
  }
  // con la mappa aperta il crogiolo si ridisegna più di rado: lo scorrimento resta fluido
  let skipN = 0;
  function loop(now) { requestAnimationFrame(loop); const mapOpen = !$('mapov').hidden; try { step(now, !mapOpen || (++skipN % 6 === 0)); } catch (err) { if (window.console) console.error(err); } }
  requestAnimationFrame(loop);
  setInterval(() => { if (document.hidden) step(performance.now(), false); }, 200);

  ATH.state = state; ATH.live = live; ATH.engine = engine;
  ATH.recall = recall; ATH.showTab = showTab; ATH.travel = travel; ATH.reveal = reveal;
  Object.defineProperty(ATH, 'memoria', { get: () => memoria });
})(window.ATH);
