/* ATHANOR — LA PIANTA DELLA CITTÀ. Le posizioni sulla mappa (da cui dipendono
   le frecce) e le strade rese percorribili in entrambi i sensi: se da A si va
   a B, da B si torna sempre ad A.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const LAYOUT = {
    oltre: [0.435, 0.5],
    rinascita: [0.635, 0.5],
    empireo: [0.507, 0.456],
    trono: [0.707, 0.392],
    mare_stelle: [0.307, 0.452],
    tetti: [0.376, 0.099],
    campanile: [0.734, 0.05],
    capovolta: [0.05, 0.239],
    ultimo_piano: [0.95, 0.95],
    torre: [0.443, 0.427],
    finestre: [0.122, 0.451],
    biblioteca: [0.73, 0.432],
    ninna: [0.603, 0.196],
    sala_parto: [0.05, 0.05],
    ospedale: [0.265, 0.221],
    ultimo_respiro: [0.242, 0.691],
    scale_orfano: [0.664, 0.95],
    dormitorio: [0.95, 0.95],
    soglia: [0.422, 0.561],
    stelle: [0.355, 0.238],
    lorenzo: [0.265, 0.055],
    mare: [0.245, 0.322],
    faro: [0.123, 0.111],
    campagna: [0.535, 0.354],
    estate: [0.508, 0.157],
    domenica: [0.755, 0.233],
    fiera: [0.831, 0.131],
    casa: [0.635, 0.446],
    soffitta: [0.693, 0.339],
    stanza: [0.95, 0.412],
    orfanotrofio: [0.734, 0.536],
    cappella: [0.677, 0.64],
    pioggia: [0.519, 0.654],
    neve: [0.455, 0.758],
    stazione: [0.197, 0.539],
    letto: [0.364, 0.664],
    attesa: [0.206, 0.654],
    amore: [0.273, 0.754],
    male: [0.437, 0.95],
    veglia: [0.544, 0.863],
    alba: [0.777, 0.728],
    felicita: [0.848, 0.325],
    incontro: [0.836, 0.623],
    centro: [0.48, 0.461],
    periferia: [0.05, 0.491],
    chiesa: [0.387, 0.373],
    cimitero: [0.889, 0.517],
    bosco: [0.198, 0.213],
    giardino: [0.925, 0.225],
    fuga: [0.064, 0.602],
    crocevia: [0.823, 0.919],
    salvezza: [0.703, 0.841],
    funerale: [0.79, 0.43],
    stanza_vuota: [0.597, 0.25],
    cucina: [0.566, 0.05],
    fotografie: [0.578, 0.55],
    dubbio: [0.323, 0.475],
    ospedale_abb: [0.615, 0.745],
    treno_notte: [0.179, 0.426],
    risveglio: [0.356, 0.849],
    festa_finita: [0.668, 0.138],
    pozzo: [0.95, 0.625],
    dolore: [0.138, 0.95],
    cripta: [0.506, 0.323],
    pavimento: [0.246, 0.403],
    voci: [0.696, 0.517],
    buio: [0.05, 0.213],
    pianto: [0.182, 0.673],
    colpa: [0.768, 0.252],
    rinnegare: [0.57, 0.845],
    urlare: [0.312, 0.128],
    volti: [0.576, 0.05],
    voce_persa: [0.441, 0.597],
    lete: [0.411, 0.366],
    sommerso: [0.95, 0.05],
    silenzio: [0.561, 0.95],
    dimenticarsi: [0.05, 0.81],
    grembo: [0.425, 0.5],
    primo_ricordo: [0.625, 0.5]
  };
  Object.keys(LAYOUT).forEach(id => { const p = ATH.PLACE[id]; if (p) { p.x = LAYOUT[id][0]; p.y = LAYOUT[id][1]; } });

  // strade a doppio senso (le stanze dell'Altrove restano a senso unico: lì ci si perde)
  const isGen = id => typeof id === 'string' && id.indexOf('x:') === 0;
  ATH.PLACES.forEach(p => p.exits.forEach(e => {
    const id = ATH.exitId(e); if (isGen(id)) return;
    const q = ATH.PLACE[id]; if (!q) return;
    if (!q.exits.some(x => ATH.exitId(x) === p.id)) q.exits.push(p.id);
  }));

  // partenza: ogni volta dalla soglia
  ATH.START = 'soglia';
  ATH.SCENES = ATH.PLACES.slice().sort((a, b) => b.level - a.level);
})(window.ATH);
