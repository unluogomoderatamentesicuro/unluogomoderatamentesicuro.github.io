/* ATHANOR — L'ATLANTE. La mappa come un vecchio libro di carte: sette tavole,
   una pagina per regione (i cieli, le torri, il Nord, le case, il Sud, la
   mente, ciò che sta sotto). In ogni tavola le contrade sono disposte in due
   colonne, con la loro piazza in alto e i sentieri che scendono. Le posizioni
   di qui decidono anche le frecce: ciò che sulla carta sta a destra, nel
   cammino è a destra.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  // gli strati, dall'alto in basso: un'unica carta che si scorre, con un nome per ogni strato
  const PAGES = [
    { n: 'I', title: 'I cieli', sub: 'dove la città finisce nell’aria', bands: ['L4', 'L3', 'L2'] },
    { n: 'II', title: 'Le torri', sub: 'i piani alti dei ricordi', bands: ['L1'] },
    { n: 'III', title: 'La terra · i campi', sub: 'l’acqua, i boschi, il mare', bands: ['T0'] },
    { n: 'IV', title: 'La terra · le case', sub: 'dove sei cresciuto', bands: ['T1'] },
    { n: 'V', title: 'La terra · la città', sub: 'e i suoi morti', bands: ['T2'] },
    { n: 'VI', title: 'La mente', sub: 'sogni, domande, paure', bands: ['M'] },
    { n: 'VII', title: 'Sotto', sub: 'il sottosuolo, l’abisso, il grembo', bands: ['U1', 'U2', 'U3'] }
  ];
  const NC = 3, M = 70, COLW = 430, GAP = 40, RH = 66, HEAD = 120;
  const PW = M * 2 + NC * COLW + (NC - 1) * GAP;
  const PL = ATH.PLAN;
  const wob = (a, b) => Math.sin(a * 12.9898 + b * 78.233) * 0.5 + Math.sin(a * 3.7 + b * 1.3) * 0.5;
  const pos = {};
  let Y = 0;
  PAGES.forEach((pg, pi) => {
    pg.cells = []; pg.sections = []; pg.top = Y;
    let y = Y + HEAD;
    pg.bands.forEach(bid => {
      const band = PL.bands.find(b => b.id === bid);
      if (pg.bands.length > 1) { pg.sections.push({ name: band.name, gloss: band.gloss, y }); y += 54; }
      const ds = PL.districts.filter(d => d.band === bid).sort((a, b) => a.col - b.col);
      const colY = new Array(NC).fill(y);
      ds.forEach((d, i) => {
        const spines = d.spines.map(sp => sp.filter(id => ATH.PLACE[id]));
        const rows = Math.max(0, ...spines.map(s => s.length));
        const h = 140 + rows * RH;
        let col = 0; for (let c = 1; c < NC; c++) if (colY[c] < colY[col] - 1) col = c;
        const x0 = M + col * (COLW + GAP), y0 = colY[col];
        colY[col] += h + 22;
        const cell = { x: x0, y: y0, w: COLW, h, col, name: d.name, land: d.land, hub: d.hub, lv: d.lv, band: bid };
        pg.cells.push(cell);
        const hubX = x0 + COLW / 2 + Math.round(wob(pi, i) * 14), hubY = y0 + 106;
        pos[d.hub] = { page: pi, x: hubX, y: hubY, hub: true, cell };
        spines.forEach((sp, si) => {
          const sx = spines.length === 1 ? x0 + 130 : x0 + 28 + si * 218;
          sp.forEach((id, k) => {
            pos[id] = { page: pi, x: sx + Math.round(wob(k * 1.7 + si, i + pi) * 16), y: hubY + (k + 1) * RH + Math.round(wob(k, si + i) * 6), cell };
          });
        });
      });
      y = Math.max(...colY) + 10;
    });
    pg.h = y - Y + 40; Y += pg.h;
  });
  const TOTAL = Y;
  // —— le strade seguono la carta: si tolgono quelle di prima tra le contrade e si rifanno guardando le tavole
  const R = PL.roads, drop = new Set(['via', 'row', 'short', 'bridge']);
  const unlink = (a, b) => { const A = ATH.PLACE[a], B = ATH.PLACE[b]; A.exits = A.exits.filter(e => ATH.exitId(e) !== b); B.exits = B.exits.filter(e => ATH.exitId(e) !== a); };
  for (let i = R.length - 1; i >= 0; i--) if (drop.has(R[i].kind)) { unlink(R[i].a, R[i].b); R.splice(i, 1); }
  const has = new Set(R.map(r => [r.a, r.b].sort().join('|')));
  const link = (a, b, kind) => {
    if (!a || !b || a === b) return; const key = [a, b].sort().join('|'); if (has.has(key)) return; has.add(key);
    const A = ATH.PLACE[a], B = ATH.PLACE[b];
    const to = q => q.hidden ? { id: q.id, linger: (ATH.LINGER_EXTRA || {})[q.id] || 30 } : q.id;
    A.exits.push(to(B)); B.exits.push(to(A)); R.push({ a, b, kind });
  };
  const spinesOf = hub => PL.districts.find(d => d.hub === hub).spines;
  const lastVisible = sp => { for (let k = sp.length - 1; k >= 0; k--) if (!ATH.PLACE[sp[k]].hidden) return sp[k]; return null; };
  const tail = (hub, side) => {
    const sp = spinesOf(hub); if (!sp.length) return hub;
    if (side === 'L') return lastVisible(sp[0]) || hub;
    if (side === 'R') return lastVisible(sp[sp.length - 1]) || hub;
    const order = sp.slice().sort((a, b) => b.length - a.length);
    for (const s2 of order) { const t = lastVisible(s2); if (t && t === s2[s2.length - 1]) return t; }
    return lastVisible(order[0]) || hub;
  };
  PAGES.forEach(pg => {
    const cols = Array.from({ length: NC }, (_, c) => pg.cells.filter(x => x.col === c));
    // in verticale, nella stessa colonna: dal fondo di una contrada alla piazza di quella sotto
    cols.forEach(cs => { for (let i = 1; i < cs.length; i++) if (cs[i].band === cs[i - 1].band) link(tail(cs[i - 1].hub), cs[i].hub, 'row'); });
    // in orizzontale: la strada maestra tra le piazze affiancate, e una scorciatoia in fondo
    for (let c = 0; c < NC - 1; c++) cols[c].forEach(L => {
      let best = null, bo = 0;
      cols[c + 1].forEach(Rc => { if (Rc.band !== L.band) return; const o = Math.min(L.y + L.h, Rc.y + Rc.h) - Math.max(L.y, Rc.y); if (o > bo) { bo = o; best = Rc; } });
      if (!best) return;
      if (Math.abs(L.y - best.y) < 180) link(L.hub, best.hub, 'via');
      const a = tail(L.hub, 'R'), b = tail(best.hub, 'L');
      if (a !== L.hub && b !== best.hub && Math.abs(pos[a].y - pos[b].y) < 150) link(a, b, 'short');
    });
  });
  // da una fascia della terra alla successiva, colonna per colonna
  [[2, 3], [3, 4]].forEach(([a, b]) => {
    const A = PAGES[a], B = PAGES[b];
    for (let c = 0; c < NC; c++) {
      const ca = A.cells.filter(x => x.col === c), cb = B.cells.filter(x => x.col === c);
      if (ca.length && cb.length) link(tail(ca[ca.length - 1].hub), cb[0].hub, 'row');
    }
  });

  ATH.PLACES.forEach(p => {
    const q = pos[p.id]; if (!q) return;
    p.page = q.page; p.ax = q.x; p.ay = q.y;
    // le frecce seguono la carta; tra una tavola e l'altra si va in su o in giù
    p.x = q.x / 1000; p.y = q.y / 1000;
  });
  ATH.ATLAS = { pages: PAGES, pos, PW, H: TOTAL };
})(window.ATH);
