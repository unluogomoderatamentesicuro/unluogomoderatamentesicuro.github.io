/* ATHANOR — LA PIANTA DELLA CITTÀ. Non più una striscia lunghissima, ma
   strati sovrapposti: in alto i cieli, poi le torri, poi la terra divisa in tre
   fasce (i campi e i boschi, le case, la città e i suoi morti), poi la mente,
   e sotto il sottosuolo, l'abisso, il grembo. Sette colonne in tutto.
   Ogni quartiere ha una piazza; una strada maestra serpeggia tra le piazze di
   una stessa fascia; da ogni piazza partono i sentieri. Le fasce della terra
   sono cucite tra loro da sentieri che scendono, e quartieri vicini sono uniti
   anche in fondo, da scorciatoie. Tra un livello e l'altro, e verso la mente,
   si passa per porte segnate accanto ai luoghi: niente fili lunghi che si
   incrociano. Tutte le strade sono a doppio senso; solo l'Altrove no.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const LVN = n => (ATH.LEVELS.find(l => l.n === n) || {});
  // le fasce, dall'alto in basso: [id, livello, nome, sottotitolo]
  const BANDS = [
    ['L4', 4], ['L3', 3], ['L2', 2], ['L1', 1],
    ['T0', 0, 'La terra', 'i campi, l’acqua, i boschi'],
    ['T1', 0, 'La terra', 'le case'],
    ['T2', 0, 'La terra', 'la città e i suoi morti'],
    ['M', 0, 'La mente', 'sogni, domande, paure'],
    ['U1', -1], ['U2', -2], ['U3', -3]
  ].map(([id, lv, name, gloss]) => ({ id, lv, name: name || LVN(lv).name, gloss: gloss || LVN(lv).gloss }));

  // [fascia, colonna, nome del quartiere, piazza, [sentieri], paesaggio]
  const D = [
    ['L4', 3, 'L’oltre', 'rinascita', [['oltre']], 'sky'],
    ['L3', 0, 'Il mare di stelle', 'mare_stelle', [], 'sky'],
    ['L3', 3, 'La rosa', 'empireo', [['pace'], ['trono']], 'sky'],
    ['L3', 6, 'L’aurora', 'aurora_boreale', [], 'sky'],
    ['L2', 0, 'La vetta', 'vetta', [['osservatorio'], ['rifugio_neve', 'ghiacciaio']], 'mount'],
    ['L2', 3, 'I tetti', 'tetti', [['pensieri', 'luna_piena'], ['capovolta']], 'town'],
    ['L2', 4, 'L’ultimo piano', 'ultimo_piano', [], 'sky'],
    ['L2', 5, 'Il campanile', 'campanile', [], 'town'],
    ['L2', 6, 'Il cielo aperto', 'aquilone', [['nuvole']], 'sky'],
    ['L1', 0, 'La montagna', 'sentiero', [['baita'], ['pascolo']], 'mount'],
    ['L1', 1, 'La mano', 'mano_nonno', [], 'house'],
    ['L1', 3, 'Le torri', 'torre', [['biblioteca', 'ninna'], ['vita_mai', 'finestre']], 'town'],
    ['L1', 4, 'Le scale', 'scale_orfano', [['dormitorio']], 'house'],
    ['L1', 5, 'L’ospedale', 'ospedale', [['sala_parto', 'figlio'], ['ultimo_respiro']], 'town'],
    ['L1', 6, 'La rinascita', 'germoglio', [['ricominciare', 'finestra_aperta'], ['perdono', 'prima_volta', 'respiro_lungo']], 'field'],
    ['T0', 0, 'Il mare', 'mare', [['stelle', 'lorenzo', 'faro'], ['porto', 'molo', 'spiaggia_inverno', 'mare_aperto']], 'sea'],
    ['T0', 1, 'La campagna', 'campagna', [['strade_nebbia', 'grano', 'neve', 'felicita'], ['vigna', 'uliveto', 'treno_merci', 'giardino']], 'field'],
    ['T0', 2, 'Il fiume', 'ruscello', [['ponte', 'mulino', 'cascata'], ['canneto', 'lago_ghiacciato', 'tuffi']], 'water'],
    ['T0', 3, 'Il bosco', 'bosco', [['fuga', 'conca', 'bosco_profondo', 'palude', 'lago'], ['porta_bosco']], 'trees'],
    ['T0', 4, 'Il borgo', 'borgo', [['mura', 'fontana'], ['orologio_fermo', 'campana_sola', 'casa_luce']], 'town'],
    ['T0', 5, 'Il paese', 'domenica', [['incontro', 'parco_giochi', 'festa_finita'], ['fiera']], 'town'],
    ['T0', 7, 'La casa al mare', 'casa_mare_inverno', [['persiane'], ['notte_finestra', 'sole_sveglia']], 'sea'],
    ['T0', 6, 'Il nulla', 'campo_nulla', [['strada_nulla', 'pensilina', 'palo_luce'], ['cammino_notte', 'deserto_sale', 'orizzonte']], 'void'],
    ['T1', 0, 'La casa vuota', 'casa_vuota', [['moquette', 'ripostiglio', 'macchinina'], ['stanza_vuota', 'occasioni', 'fotografie']], 'house'],
    ['T1', 1, 'I nonni', 'giorni_nonni', [['estate', 'cucina', 'sottoscala'], ['nonno_malato', 'letto_nonni', 'casa_venduta']], 'house'],
    ['T1', 2, 'La notte', 'letto', [['pioggia', 'insonnia', 'nessuno_parla', 'famiglia_spezzata'], ['male', 'veglia', 'risalita', 'risveglio', 'alba']], 'house'],
    ['T1', 3, 'La soglia', 'soglia', [['giugno', 'dubbio'], ['salvezza']], 'field'],
    ['T1', 4, 'Le voci della notte', 'voci_notte', [['radio_notte', 'lettera_mai', 'ultima_telefonata']], 'town'],
    ['T1', 5, 'La casa abbandonata', 'casa', [['soffitta', 'casa_velo'], ['stanza', 'stanza_specchi']], 'ruin'],
    ['T1', 6, 'Le feste', 'sedia_vuota', [['compleanno_solo', 'cane_vecchio'], ['natale_bambino', 'letterina', 'uovo_pasqua', 'giorni_uguali']], 'house'],
    ['T1', 8, 'Il cuore', 'domenica_sera', [['nostalgia', 'rimpianto', 'vergogna', 'paura_perdere'], ['gratitudine', 'tenerezza', 'stupore', 'sollievo', 'calma_dopo']], 'mind'],
    ['T1', 7, 'La casa lasciata', 'casa_fretta', [['spartito', 'seduta'], ['casa_vandali']], 'ruin'],
    ['T2', 0, 'L’orfanotrofio', 'orfanotrofio', [['cortile', 'refettorio', 'aula', 'lavatoio'], ['parlatorio', 'infermeria', 'cappella']], 'house'],
    ['T2', 1, 'Il manicomio', 'manicomio', [['manicomio_abb', 'ospedale_abb'], ['pronto_soccorso', 'ospizio']], 'ruin'],
    ['T2', 2, 'La chiesa', 'chiesa', [['cappella_funebre', 'funerale']], 'tomb'],
    ['T2', 3, 'Il cimitero', 'cimitero', [['massimo', 'monumentale', 'fuochi_fatui'], ['venticinque', 'madre']], 'tomb'],
    ['T2', 4, 'La città', 'centro', [['citta_vecchia', 'crocevia'], ['sala_giochi', 'cabina']], 'city'],
    ['T2', 5, 'La stazione', 'stazione', [['attesa', 'amore', 'addio'], ['periferia', 'treno_notte', 'binario_morto', 'citta_lontana']], 'city'],
    ['T2', 8, 'I posti di passaggio', 'autogrill', [['lavanderia', 'edicola'], ['cinema_paese']], 'city'],
    ['T2', 7, 'La strada', 'giorgio_moto', [['obitorio']], 'city'],
    ['T2', 6, 'Le rovine', 'citta_abbandonata', [['fabbrica', 'reparto'], ['studio_cine', 'set_film', 'sala_proiezione']], 'ruin'],
    ['M', 0, 'La folla', 'folla', [['festa_folla', 'palco']], 'mind'],
    ['M', 1, 'L’impostore', 'ufficio', [['esame', 'riunione'], ['complimento', 'sportello']], 'mind'],
    ['M', 2, 'Le domande', 'stanza_domande', [['specchio_parla', 'confessionale'], ['bivio']], 'mind'],
    ['M', 3, 'Il sogno', 'dormiveglia', [['madre_sogno', 'casa_mai', 'voce_telefono'], ['bambino_sconosciuto', 'festa_mai', 'padre_treno']], 'dream'],
    ['M', 4, 'Le cose ritrovate', 'cassetto', [['oggetto_perduto', 'quaderno', 'giocattolo'], ['spiaggia_foto', 'canzone']], 'dream'],
    ['M', 5, 'I ritorni', 'sala_ritorni', [['amico_perso', 'nonno_orto', 'massimo_partita']], 'dream'],
    ['M', 7, 'L’immaginato', 'teatro_vuoto', [['corridoio_compleanni', 'pioggia_casa', 'ascensore', 'stanza_rovescia'], ['paese_bambini', 'neve_agosto', 'figlio_grande', 'biblioteca_lettere']], 'dream'],
    ['M', 6, 'La testa', 'fuori_posto', [['impazzito', 'sbagliato_tutto'], ['pensieri_neri']], 'mind'],
    ['U1', 0, 'La grotta', 'grotta', [], 'under'],
    ['U1', 1, 'La cantina', 'cantina', [], 'under'],
    ['U1', 2, 'I volti', 'volti', [['voce_persa']], 'under'],
    ['U1', 3, 'Il pianto', 'pianto', [['pavimento', 'vuoto'], ['dolore', 'rabbia']], 'under'],
    ['U1', 4, 'Il buio', 'buio', [['incubo', 'voci', 'urlare'], ['pozzo']], 'under'],
    ['U1', 5, 'Le cripte', 'cripta', [['rinnegare', 'colpa', 'catacombe'], ['giudizio', 'ossario']], 'under'],
    ['U1', 6, 'Sotto la città', 'metro', [['rifugio']], 'under'],
    ['U2', 0, 'Il fondo del mare', 'affondati', [['relitto']], 'deep'],
    ['U2', 1, 'Sotto il lago', 'paese_sommerso', [], 'deep'],
    ['U2', 3, 'Il mondo sommerso', 'sommerso', [], 'deep'],
    ['U2', 4, 'Il fiume', 'lete', [['silenzio'], ['dimenticarsi']], 'deep'],
    ['U3', 3, 'Il grembo', 'grembo', [['primo_ricordo']], 'deep']
  ];
  // le porte: tra livelli diversi, e tra la terra e la mente
  const PORTALS = [
    ['rinascita', 'pace'], ['mare_stelle', 'osservatorio'], ['empireo', 'luna_piena'], ['aurora_boreale', 'nuvole'],
    ['vetta', 'baita'], ['tetti', 'finestre'], ['ultimo_piano', 'dormitorio'], ['campanile', 'chiesa'], ['aquilone', 'respiro_lungo'],
    ['sentiero', 'bosco'], ['mano_nonno', 'giorni_nonni'], ['torre', 'soglia'], ['scale_orfano', 'orfanotrofio'], ['ospedale', 'manicomio'], ['germoglio', 'centro'],
    ['mare_aperto', 'affondati'], ['cascata', 'grotta'], ['lago', 'paese_sommerso'], ['sottoscala', 'cantina'], ['fotografie', 'volti'], ['famiglia_spezzata', 'pianto'],
    ['stanza_specchi', 'buio'], ['lavatoio', 'pozzo'], ['funerale', 'cripta'], ['cabina', 'metro'], ['vuoto', 'lete'], ['sommerso', 'grembo'],
    ['letto', 'incubo'], ['veglia', 'pianto'], ['pavimento', 'silenzio'], ['oltre', 'ultimo_respiro'], ['rinascita', 'alba'], ['grembo', 'sala_parto'],
    ['trono', 'giudizio'], ['crocevia', 'sommerso'], ['dimenticarsi', 'primo_ricordo'], ['urlare', 'dubbio'], ['rabbia', 'risalita'], ['capovolta', 'biblioteca'],
    ['mare_stelle', 'stelle'], ['pozzo', 'sommerso'],
    ['folla', 'centro'], ['festa_folla', 'festa_finita'], ['palco', 'sala_proiezione'], ['ufficio', 'stazione'], ['riunione', 'pronto_soccorso'],
    ['stanza_domande', 'dubbio'], ['specchio_parla', 'stanza_specchi'], ['confessionale', 'chiesa'], ['bivio', 'strada_nulla'], ['bivio', 'crocevia'],
    ['dormiveglia', 'letto'], ['dormiveglia', 'insonnia'], ['cassetto', 'ripostiglio'], ['sala_ritorni', 'cimitero'], ['fuori_posto', 'insonnia'],
    ['impazzito', 'voci'], ['sbagliato_tutto', 'occasioni'], ['pensieri_neri', 'pensieri'], ['pensieri_neri', 'respiro_lungo'],
    ['obitorio', 'ultimo_respiro'], ['casa_mare_inverno', 'spiaggia_inverno'], ['uovo_pasqua', 'letto_nonni'], ['letterina', 'figlio'], ['seduta', 'voci'],
    ['spartito', 'canzone'], ['teatro_vuoto', 'studio_cine'], ['neve_agosto', 'neve'], ['paese_bambini', 'parco_giochi'], ['figlio_grande', 'figlio'],
    ['biblioteca_lettere', 'lettera_mai'], ['stanza_rovescia', 'capovolta'], ['pioggia_casa', 'pioggia'], ['ascensore', 'ufficio'], ['notte_finestra', 'letto'],
    ['casa_vandali', 'casa'], ['giorgio_moto', 'strade_nebbia'], ['corridoio_compleanni', 'compleanno_solo'], ['giorgio_moto', 'fuochi_fatui'], ['nostalgia', 'canzone'], ['paura_perdere', 'figlio'], ['stupore', 'stelle'], ['calma_dopo', 'alba'], ['vergogna', 'folla'], ['autogrill', 'treno_notte'], ['edicola', 'paese_bambini'], ['cinema_paese', 'sala_proiezione'], ['tuffi', 'estate'], ['domenica_sera', 'giorni_uguali']
  ];

  // quanto bisogna restare per scoprire un luogo nascosto
  const LINGER = Object.assign({}, ATH.LINGER_EXTRA || {});
  ATH.PLACES.forEach(p => p.exits.forEach(e => { if (typeof e !== 'string' && e.linger) LINGER[e.id] = Math.max(LINGER[e.id] || 0, e.linger); }));
  const isGen = id => typeof id === 'string' && id.indexOf('x:') === 0;
  const GEN = {};
  ATH.PLACES.forEach(p => { GEN[p.id] = p.exits.filter(e => isGen(typeof e === 'string' ? e : e.id)); p.exits = []; });
  GEN.bosco_profondo = ['x:bosco_profondo'];

  // —— geometria
  const SW = 166, RH = 64, PAD = 92;
  const cols = 9;
  const colW = new Array(cols).fill(1);
  D.forEach(d => { colW[d[1]] = Math.max(colW[d[1]], Math.max(1, d[4].length)); });
  const colX = []; let cx = 40;
  for (let c = 0; c < cols; c++) { colX[c] = cx; cx += colW[c] * SW + 26; }
  const W = cx + 30;
  const rows = {}; BANDS.forEach(b => rows[b.id] = 0);
  D.forEach(d => { rows[d[0]] = Math.max(rows[d[0]], Math.max.apply(null, [0].concat(d[4].map(s => s.length)))); });
  const bandTop = {}, bandH = {}; let y = 10;
  BANDS.forEach(b => { bandH[b.id] = PAD + rows[b.id] * RH + (b.lv > 0 ? 104 : 72); bandTop[b.id] = y; y += bandH[b.id]; });
  const H = y + 10;
  const wob = (a, b) => Math.sin(a * 12.9898 + b * 78.233) * 0.5 + Math.sin(a * 3.7 + b * 1.3) * 0.5;

  const where = {};
  const P = id => { const p = ATH.PLACE[id]; if (!p) console.warn('pianta: manca', id); return p; };
  const bi = id => BANDS.findIndex(b => b.id === id);
  D.forEach(([band, col, name, hub, spines]) => {
    const B = BANDS[bi(band)], up = B.lv > 0, k = bi(band);
    const w = colW[col] * SW, mid = colX[col] + w / 2;
    const hubY = (up ? bandTop[band] + bandH[band] - 80 : bandTop[band] + PAD + 8) + Math.round(wob(col, k) * 14);
    if (!P(hub)) return;
    where[hub] = { mx: mid + Math.round(wob(k, col) * 10), my: hubY, d: name, hub: true, band, col };
    spines.forEach((sp, si) => {
      const x = spines.length === 1 ? mid : mid + (si - (spines.length - 1) / 2) * SW;
      let yy = hubY;
      sp.forEach((id, j) => {
        yy += (up ? -1 : 1) * (RH + Math.round(wob(j + si * 3, col) * 8));
        if (P(id)) where[id] = { mx: x + Math.round(wob(j * 1.7 + si, col + k) * 18), my: yy, d: name, band, col };
      });
    });
  });
  ATH.PLACES.forEach(p => {
    const w = where[p.id];
    if (!w) { if (!p.offmap) console.warn('pianta: senza quartiere', p.id); return; }
    const B = BANDS[bi(w.band)];
    if (B.lv !== (p.level || 0)) console.warn('pianta: livello diverso', p.id, B.lv, p.level);
    p.mx = w.mx; p.my = w.my; p.district = w.d; p.isHub = !!w.hub; p.band = w.band;
    p.x = w.mx / 1000; p.y = w.my / 1000;
  });

  // —— le strade
  const ROADS = [], has = new Set();
  function link(a, b, kind, lingerOverride) {
    const A = ATH.PLACE[a], B = ATH.PLACE[b]; if (!A || !B || a === b) return;
    const key = [a, b].sort().join('|'); if (has.has(key)) return; has.add(key);
    const to = q => q.hidden ? { id: q.id, linger: lingerOverride !== undefined ? lingerOverride : (LINGER[q.id] || 30) } : q.id;
    A.exits.push(to(B)); B.exits.push(to(A));
    ROADS.push({ a, b, kind });
  }
  // le strade maestre tra piazze vicine della stessa fascia
  BANDS.forEach(B => {
    const ds = D.filter(d => d[0] === B.id).sort((p, q) => p[1] - q[1]);
    for (let i = 1; i < ds.length; i++) link(ds[i - 1][3], ds[i][3], 'via');
  });
  // i sentieri dentro ogni quartiere
  D.forEach(([, , , hub, spines]) => spines.forEach(sp => { let prev = hub; sp.forEach(id => { link(prev, id, 'lane'); prev = id; }); }));
  // la coda di un quartiere: il fondo del sentiero più lungo che non sia nascosto
  const tailOf = (d, side) => {
    const sp = d[4]; if (!sp.length) return d[3];
    const order = side === 'L' ? sp.map((s, i) => i) : side === 'R' ? sp.map((s, i) => sp.length - 1 - i) : sp.map((s, i) => i).sort((a, b) => sp[b].length - sp[a].length);
    for (const i of order) {
      const t = sp[i][sp[i].length - 1]; if (!ATH.PLACE[t].hidden) return t;
      if (side) { for (let j = sp[i].length - 2; j >= 0; j--) if (!ATH.PLACE[sp[i][j]].hidden) return sp[i][j]; }
    }
    return d[3];
  };
  // le fasce della terra cucite tra loro: dal fondo di un quartiere alla piazza di quello sotto
  [['T0', 'T1'], ['T1', 'T2']].forEach(([a, b]) => {
    D.filter(d => d[0] === a).forEach(d => { const e = D.find(x => x[0] === b && x[1] === d[1]); if (e) link(tailOf(d), e[3], 'row'); });
  });
  // e le scorciatoie in fondo, tra quartieri vicini
  BANDS.filter(B => B.lv <= 0).forEach(B => {
    const ds = D.filter(d => d[0] === B.id && d[4].length).sort((p, q) => p[1] - q[1]);
    for (let i = 1; i < ds.length; i++) if (ds[i][1] - ds[i - 1][1] === 1) link(tailOf(ds[i - 1], 'R'), tailOf(ds[i], 'L'), 'short');
  });
  // i ponti a metà strada: ogni tanto, tra due quartieri vicini, un passaggio di traverso
  BANDS.filter(B => B.lv <= 0).forEach(B => {
    const ds = D.filter(d => d[0] === B.id && d[4].length).sort((p, q) => p[1] - q[1]);
    for (let i = 1; i < ds.length; i++) {
      if (ds[i][1] - ds[i - 1][1] !== 1) continue;
      const L = ds[i - 1][4][ds[i - 1][4].length - 1], R = ds[i][4][0];
      if (L.length >= 3 && R.length >= 3 && ![L[0], L[1], R[0], R[1]].some(id => ATH.PLACE[id].hidden)) link(L[1], R[1], 'bridge');
    }
  });
  // le porte
  PORTALS.forEach(([a, b]) => link(a, b, 'portal'));
  // le capsule del tempo: porte nascoste verso i luoghi dove si possono trovare
  ATH.PLACES.forEach(p => { if (!p.secret) return; (p.secret.at || []).forEach(a => link(a, p.id, 'portal', p.secret.needs || !p.secret.linger ? 1e9 : p.secret.linger)); });
  // e le porte verso l'Altrove
  ATH.PLACES.forEach(p => (GEN[p.id] || []).forEach(g => p.exits.push(g)));

  ATH.PLAN = { W, H, SW, RH, bands: BANDS, bandTop, bandH, colX, colW, districts: D.map(d => ({ band: d[0], lv: BANDS[bi(d[0])].lv, col: d[1], name: d[2], hub: d[3], land: d[5], spines: d[4], ids: [d[3]].concat(...d[4]) })), roads: ROADS };

  ATH.START = 'soglia';
  ATH.SCENES = ATH.PLACES.slice().sort((a, b) => b.level - a.level);
})(window.ATH);
