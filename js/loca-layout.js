/* ATHANOR — LA PIANTA DELLA CITTÀ. Le posizioni sulla mappa (da cui dipendono
   le frecce) e le strade rese percorribili in entrambi i sensi: se da A si va
   a B, da B si torna sempre ad A.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const LAYOUT = {
    oltre: [0.425, 0.5],
    rinascita: [0.645, 0.5],
    empireo: [0.509, 0.383],
    trono: [0.95, 0.05],
    mare_stelle: [0.05, 0.285],
    pace: [0.225, 0.95],
    tetti: [0.437, 0.712],
    campanile: [0.767, 0.366],
    capovolta: [0.05, 0.722],
    ultimo_piano: [0.95, 0.95],
    pensieri: [0.428, 0.05],
    torre: [0.426, 0.438],
    finestre: [0.16, 0.371],
    biblioteca: [0.777, 0.462],
    ninna: [0.619, 0.243],
    sala_parto: [0.113, 0.05],
    ospedale: [0.352, 0.178],
    ultimo_respiro: [0.314, 0.688],
    scale_orfano: [0.677, 0.95],
    dormitorio: [0.95, 0.95],
    mano_nonno: [0.585, 0.656],
    vita_mai: [0.05, 0.617],
    soglia: [0.356, 0.552],
    stelle: [0.31, 0.256],
    lorenzo: [0.27, 0.123],
    mare: [0.288, 0.357],
    faro: [0.086, 0.108],
    campagna: [0.484, 0.395],
    estate: [0.464, 0.2],
    domenica: [0.633, 0.246],
    fiera: [0.95, 0.148],
    casa: [0.645, 0.549],
    soffitta: [0.794, 0.396],
    stanza: [0.95, 0.448],
    orfanotrofio: [0.646, 0.656],
    cappella: [0.646, 0.757],
    pioggia: [0.491, 0.706],
    neve: [0.482, 0.807],
    stazione: [0.202, 0.591],
    letto: [0.341, 0.654],
    attesa: [0.178, 0.702],
    amore: [0.331, 0.754],
    male: [0.383, 0.91],
    veglia: [0.556, 0.95],
    alba: [0.797, 0.7],
    felicita: [0.95, 0.346],
    incontro: [0.95, 0.549],
    centro: [0.497, 0.501],
    periferia: [0.05, 0.534],
    chiesa: [0.353, 0.451],
    cimitero: [0.796, 0.6],
    bosco: [0.154, 0.204],
    giardino: [0.95, 0.053],
    fuga: [0.05, 0.634],
    crocevia: [0.79, 0.923],
    salvezza: [0.799, 0.813],
    funerale: [0.793, 0.499],
    stanza_vuota: [0.641, 0.346],
    cucina: [0.617, 0.05],
    fotografie: [0.501, 0.604],
    dubbio: [0.207, 0.493],
    ospedale_abb: [0.639, 0.859],
    treno_notte: [0.122, 0.406],
    risveglio: [0.168, 0.803],
    festa_finita: [0.781, 0.098],
    casa_vuota: [0.483, 0.297],
    ripostiglio: [0.786, 0.196],
    letto_nonni: [0.793, 0.295],
    moquette: [0.95, 0.246],
    macchinina: [0.619, 0.148],
    occasioni: [0.638, 0.447],
    risalita: [0.454, 0.099],
    venticinque: [0.95, 0.651],
    madre: [0.95, 0.755],
    citta_lontana: [0.127, 0.304],
    pozzo: [0.95, 0.642],
    dolore: [0.23, 0.862],
    cripta: [0.596, 0.292],
    pavimento: [0.292, 0.587],
    voci: [0.531, 0.528],
    buio: [0.117, 0.407],
    pianto: [0.461, 0.77],
    colpa: [0.77, 0.465],
    rinnegare: [0.636, 0.95],
    urlare: [0.413, 0.118],
    volti: [0.837, 0.222],
    voce_persa: [0.706, 0.707],
    rabbia: [0.356, 0.352],
    incubo: [0.05, 0.642],
    giudizio: [0.168, 0.164],
    vuoto: [0.653, 0.05],
    lete: [0.432, 0.367],
    sommerso: [0.95, 0.05],
    silenzio: [0.593, 0.95],
    dimenticarsi: [0.05, 0.816],
    grembo: [0.415, 0.5],
    primo_ricordo: [0.635, 0.5]
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
