/* ATHANOR — LA CITTÀ VERTICALE. Sei livelli, dall'Empireo all'Abisso, nuovi
   luoghi, e l'Altrove: stanze generate all'infinito, dove ci si può perdere.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  ATH.LEVELS = [
    { n: 3, name: 'Empireo', gloss: 'sopra ogni cosa' },
    { n: 2, name: 'I tetti', gloss: 'dove la città finisce nel cielo' },
    { n: 1, name: 'Le torri', gloss: 'i piani alti dei ricordi' },
    { n: 0, name: 'La terra', gloss: 'dove si cammina' },
    { n: -1, name: 'Il sottosuolo', gloss: 'quello che non si dice' },
    { n: -2, name: 'L’abisso', gloss: 'dove si dimentica' }
  ];
  ATH.levelName = n => (ATH.LEVELS.find(l => l.n === n) || { name: 'Altrove' }).name;

  // —— i luoghi già esistenti: livello, quiete, luci, nuove strade
  const patch = {
    soglia: { exits: ['centro', 'chiesa'] },
    stelle: { hush: 0.5, exits: ['bosco', 'tetti'] },
    lorenzo: { hush: 0.4, exits: ['mare_stelle'] },
    mare: { hush: 0.2, exits: [{ id: 'sommerso', linger: 50 }] },
    faro: { hush: 0.35 },
    campagna: { hush: 0.2, exits: ['bosco', 'centro'] },
    estate: { hush: 0.35 },
    domenica: { hush: 0.25, exits: ['campanile'] },
    fiera: { hush: 0.1 },
    casa: { hush: 0.3, lumina: 'soffuse' },
    soffitta: { hush: 0.7, lumina: 'soffuse', exits: ['tetti', 'torre'] },
    stanza: { hush: 0.85, lumina: 'soffuse', exits: [{ id: 'ninna', linger: 30 }] },
    orfanotrofio: { hush: 0.3, lumina: 'soffuse', exits: ['cimitero'] },
    cappella: { hush: 0.75, lumina: 'candele', exits: ['cimitero', 'chiesa'] },
    pozzo: { level: -1, x: 0.94, y: 0.72, exits: ['cripta', 'sommerso'] },
    pioggia: { hush: 0.45, lumina: 'soffuse' },
    neve: { hush: 0.7 },
    stazione: { hush: 0.15, exits: ['periferia', 'fuga'] },
    letto: { hush: 0.75, lumina: 'spente', exits: [{ id: 'ninna', linger: 40 }, 'voci'] },
    attesa: { hush: 0.4, lumina: 'soffuse', urge: 90 },
    amore: { hush: 0.4, lumina: 'soffuse', exits: ['finestre', 'pianto'] },
    male: { hush: 0.3, lumina: 'soffuse' },
    veglia: { hush: 0.6, lumina: 'soffuse', exits: ['pianto'] },
    dolore: { level: -1, x: 0.08, y: 0.86, exits: ['rinnegare', 'pianto'] },
    alba: { hush: 0.6, exits: [{ id: 'giardino', linger: 30 }] },
    felicita: { hush: 0.4, exits: [{ id: 'giardino', linger: 40 }] },
    incontro: { hush: 0.5 }
  };
  Object.keys(patch).forEach(id => {
    const p = ATH.PLACE[id], d = patch[id];
    Object.keys(d).forEach(k => { if (k === 'exits') p.exits = p.exits.concat(d.exits); else p[k] = d[k]; });
  });
  ATH.PLACES.forEach(p => { if (p.level === undefined) p.level = 0; if (p.hush === undefined) p.hush = 0.15; });

  const NEW = [
    // ——— EMPIREO
    { id: 'empireo', name: 'La rosa di luce', kind: 'luogo', level: 3, x: 0.5, y: 0.5, terrain: 'nuvola', modus: 'lidio', hush: 0.8, lumina: 'accese',
      levels: { m_canto: 0.35, m_campane: 0.2 }, set: { lumen: 0.75, chorus: 0.6, aether: 0.95, velum: 0.85, cantus: 0.25 }, libra: 0.95,
      pal: { bg: [22, 20, 18], accent: [255, 250, 230], second: [230, 210, 160] }, motif: { rose: 1, haze: 0.6 },
      ora: 'Cerchi di luce dentro altri cerchi, e in mezzo qualcosa che non si può guardare a lungo.',
      allora: 'Ci credevi da bambino, a mani giunte, senza fare domande. Forse era più semplice.',
      exits: ['campanile', 'mare_stelle', { id: 'trono', linger: 35 }, 'chiesa'] },
    { id: 'trono', name: 'Sopra ogni cosa', kind: 'stato', level: 3, x: 0.84, y: 0.35, terrain: 'nuvola', modus: 'lidio', hush: 0.5, hidden: true,
      levels: { m_vento: 0.6 }, set: { lumen: 0.5, aether: 1, ouroboros: 0.7, tempus: 0.8, velum: 0.5, chorus: 0.2 }, libra: 0.75,
      pal: { bg: [10, 14, 20], accent: [236, 226, 196], second: [140, 170, 200] }, motif: { throne: 1 },
      ora: 'Sei più in alto di qualsiasi dolore. Da quassù non ti tocca niente. Non ti tocca nessuno.',
      allora: 'Volevi diventare così forte da non avere più bisogno di nessuno. Ci sei riuscito.',
      exits: ['empireo', 'colpa', 'rinnegare'] },
    { id: 'mare_stelle', name: 'Il mare di stelle', kind: 'luogo', level: 3, x: 0.18, y: 0.45, terrain: 'nuvola', modus: 'pentatonico', hush: 0.75,
      levels: { m_carillon: 0.25, m_canto: 0.12 }, set: { lumen: 0.55, chorus: 0.4, patera: 0.4, resonantia: 0.9, aether: 0.85 }, libra: 0.9,
      pal: { bg: [3, 4, 14], accent: [190, 210, 255], second: [150, 90, 210] }, motif: { stars: 1.8, nebula: 1 },
      ora: 'Non c’è più sotto né sopra. Galleggi in mezzo a luci che sono morte da migliaia di anni.',
      allora: 'Il soffitto della cameretta aveva stelle di plastica che brillavano al buio, per dieci minuti.',
      exits: ['tetti', 'empireo', 'stelle', 'lorenzo', 'crocevia'] },

    // ——— I TETTI
    { id: 'tetti', name: 'I tetti della città', kind: 'luogo', level: 2, x: 0.45, y: 0.5, terrain: 'tegole', modus: 'dorico', hush: 0.45,
      levels: { m_vento: 0.4, m_campane: 0.25, m_cani: 0.15, m_treno: 0.15, m_uccelli: 0.15 }, set: { lumen: 0.35, distantia: 0.5 }, libra: 0.65,
      pal: { bg: [10, 10, 16], accent: [230, 196, 150], second: [110, 100, 150] }, motif: { city: 1, stars: 0.4 },
      ora: 'Le tegole sono ancora tiepide. Sotto di te la città accende le finestre una alla volta.',
      allora: 'Ci salivi dall’abbaino per fumare la prima sigaretta, e ti sentivi padrone del mondo.',
      exits: ['torre', 'campanile', 'finestre', 'soffitta', 'mare_stelle', 'stelle', { id: 'capovolta', linger: 45 }] },
    { id: 'campanile', name: 'In cima al campanile', kind: 'luogo', level: 2, x: 0.75, y: 0.4, terrain: 'scala', modus: 'ionio', hush: 0.3,
      levels: { m_campane: 0.9, m_vento: 0.5, m_uccelli: 0.2 }, set: { lumen: 0.3, aether: 0.7 }, libra: 0.6,
      pal: { bg: [14, 12, 12], accent: [240, 210, 170], second: [160, 120, 110] }, motif: { city: 0.7, haze: 0.4 },
      ora: 'Le campane sono così vicine che il suono ti entra nelle ossa prima che nelle orecchie.',
      allora: 'Il sagrestano ti lasciava tirare la corda, e tu ti alzavi da terra appeso al suono.',
      exits: ['tetti', 'domenica', 'empireo', { id: 'trono', linger: 50 }] },
    { id: 'capovolta', name: 'La città capovolta', kind: 'luogo', level: 2, x: 0.12, y: 0.55, terrain: 'pietra', modus: 'insen', hush: 0.35, hidden: true,
      levels: { m_campane: 0.3, m_voci: 0.3, m_vento: 0.35, m_canto: 0.15 }, set: { lumen: 0.35, nastro: 0.85, oblio: 0.4 }, libra: 0.6,
      pal: { bg: [12, 8, 16], accent: [200, 180, 255], second: [120, 200, 190] }, motif: { cityFlip: 1, stars: 0.6 },
      ora: 'Le case pendono dal cielo come stalattiti. Le persone camminano a testa in giù e non se ne accorgono.',
      allora: 'Facevi la verticale contro il muro e il mondo, per un momento, era giusto così.',
      exits: ['tetti', 'mare_stelle', 'biblioteca', 'crocevia'] },

    // ——— LE TORRI
    { id: 'torre', name: 'La torre dei ricordi', kind: 'luogo', level: 1, x: 0.5, y: 0.5, terrain: 'scala', modus: 'eolio', hush: 0.6, lumina: 'soffuse',
      levels: { m_pendolo: 0.3, m_fruscio: 0.35, m_carillon: 0.3, m_piano: 0.25, m_voci: 0.1 }, set: { lumen: 0.35, oblio: 0.3, distantia: 0.45 }, libra: 0.7,
      pal: { bg: [12, 10, 10], accent: [226, 198, 160], second: [120, 96, 80] }, motif: { stairs: 1, motes: 0.5 },
      ora: 'Una scala a chiocciola senza fine. A ogni piano una porta, e dietro ogni porta un anno della tua vita.',
      allora: 'Il terzo piano era il 1994. Non hai avuto il coraggio di aprirlo.',
      exits: ['centro', 'finestre', 'biblioteca', 'tetti', 'soffitta', { id: 'ninna', linger: 35 }, 'x:torre'] },
    { id: 'finestre', name: 'Le finestre accese', kind: 'luogo', level: 1, x: 0.22, y: 0.45, terrain: 'pietra', modus: 'dorico', hush: 0.5, lumina: 'soffuse',
      levels: { m_voci: 0.25, m_radio: 0.2, m_piano: 0.2, m_cani: 0.1, m_fruscio: 0.15 }, set: { lumen: 0.3, distantia: 0.6 }, libra: 0.65,
      pal: { bg: [8, 9, 14], accent: [255, 210, 140], second: [100, 110, 160] }, motif: { windows: 1 },
      ora: 'Di fronte, cento finestre. In una qualcuno cucina, in un’altra qualcuno piange, in un’altra ballano.',
      allora: 'Ti chiedevi se anche loro, guardando la tua finestra, immaginavano la tua vita più bella di com’era.',
      exits: ['torre', 'periferia', 'tetti', 'amore'] },
    { id: 'biblioteca', name: 'La biblioteca dei nomi', kind: 'luogo', level: 1, x: 0.8, y: 0.5, terrain: 'legno', modus: 'insen', hush: 0.85, lumina: 'candele',
      levels: { m_fruscio: 0.5, m_pendolo: 0.25, m_sussurri: 0.12, m_candele: 0.3 }, set: { lumen: 0.3, chorus: 0.2, distantia: 0.5 }, libra: 0.8,
      pal: { bg: [12, 10, 8], accent: [236, 200, 140], second: [130, 100, 70] }, motif: { motes: 0.8, candles: 0.6 },
      ora: 'Scaffali fino al buio. In ogni libro c’è il nome di qualcuno che è stato dimenticato.',
      allora: 'Tua nonna scriveva i nomi dei morti dietro le fotografie, perché qualcuno se li ricordasse.',
      exits: ['torre', 'cimitero', { id: 'ninna', linger: 30 }, { id: 'capovolta', linger: 60 }] },
    { id: 'ninna', name: 'La ninna nanna', kind: 'luogo', level: 1, x: 0.95, y: 0.2, terrain: 'legno', modus: 'pentatonico', hush: 0.95, lumina: 'soffuse', hidden: true,
      levels: { m_canto: 0.6, m_carillon: 0.4, m_fruscio: 0.2, m_respiro: 0.1 }, set: { lumen: 0.3, velum: 0.3, oblio: 0.15, chorus: 0.1 }, libra: 0.9,
      pal: { bg: [10, 9, 14], accent: [240, 216, 230], second: [160, 140, 190] }, motif: { stars: 0.5, motes: 0.4 },
      ora: 'Qualcuno canticchia piano, senza parole, accanto al tuo letto. La voce va e viene come il respiro.',
      allora: 'Non ricordi il volto. Ricordi solo che con quella voce non poteva succederti niente.',
      exits: ['torre', 'biblioteca', 'letto', 'stanza'] },

    // ——— LA TERRA
    { id: 'centro', name: 'Il centro di tutto', kind: 'luogo', level: 0, x: 0.5, y: 0.4, terrain: 'pietra', modus: 'eolio', hush: 0,
      levels: { m_voci: 0.3, m_campane: 0.15, m_passi: 0.35, m_treno: 0.15, m_radio: 0.15, m_festa: 0.1, m_bambini: 0.15, m_carillon: 0.1, m_cani: 0.1, m_vento: 0.15 },
      set: { lumen: 0.2 }, libra: 0.4,
      pal: { bg: [12, 11, 10], accent: [230, 214, 190], second: [140, 120, 100] }, motif: { city: 0.5, lights: 0.3 },
      ora: 'Tutto passa di qui. Ogni voce, ogni passo, ogni treno. Sei il punto dove si incrociano tutte le strade.',
      allora: 'Credevi che il mondo girasse intorno a te. Per un po’, in effetti, girava.',
      exits: ['soglia', 'periferia', 'torre', 'cripta', 'chiesa', 'cimitero', 'campagna', 'stazione', { id: 'crocevia', linger: 40 }] },
    { id: 'periferia', name: 'La periferia', kind: 'luogo', level: 0, x: 0.06, y: 0.6, terrain: 'pietra', modus: 'eolio', hush: 0.15,
      levels: { m_ronzio: 0.4, m_cani: 0.4, m_treno: 0.35, m_vento: 0.35, m_radio: 0.15, m_voci: 0.1 }, set: { lumen: 0.2, distantia: 0.5 }, libra: 0.5,
      pal: { bg: [12, 9, 6], accent: [255, 170, 80], second: [90, 80, 110] }, motif: { windows: 0.6, city: 0.5 },
      ora: 'Palazzoni uguali, un lampione che sfarfalla, un cane che abbaia a niente. Qui finisce la città.',
      allora: 'Il campetto di cemento, la porta senza rete, le sere che sembravano infinite.',
      exits: ['centro', 'stazione', 'fuga', 'finestre', 'attesa'] },
    { id: 'chiesa', name: 'La chiesa di notte', kind: 'luogo', level: 0, x: 0.3, y: 0.4, terrain: 'pietra', modus: 'dorico', hush: 0.8, lumina: 'candele',
      levels: { m_organo: 0.5, m_candele: 0.4, m_fruscio: 0.12, m_sussurri: 0.08 }, set: { lumen: 0.45, chorus: 0.5, aether: 0.9, cantus: 0.2 }, libra: 0.85,
      pal: { bg: [10, 8, 8], accent: [255, 200, 130], second: [150, 90, 70] }, motif: { candles: 1, beam: 0.25 },
      ora: 'Le candele tremano davanti a santi che non guardano nessuno. L’organo suona da solo, piano.',
      allora: 'Chiedevi sempre la stessa cosa, ogni sera. Non sai più se ti è stata data.',
      exits: ['soglia', 'centro', 'cimitero', 'cappella', 'cripta', 'rinnegare', { id: 'empireo', linger: 50 }] },
    { id: 'cimitero', name: 'Il cimitero', kind: 'luogo', level: 0, x: 0.97, y: 0.6, terrain: 'ghiaia', modus: 'eolio', hush: 0.6, lumina: 'candele', candles: true,
      levels: { m_vento: 0.4, m_campane: 0.15, m_candele: 0.25, m_grilli: 0.15, m_passi: 0.1 }, set: { lumen: 0.3, distantia: 0.6, oblio: 0.3 }, libra: 0.75,
      pal: { bg: [8, 9, 10], accent: [255, 196, 120], second: [110, 120, 130] }, motif: { tombs: 1, candles: 0.8 },
      ora: 'I lumini rossi tra le lapidi. Cerchi un nome che avevi dimenticato, e ne trovi cento.',
      allora: 'La domenica si portavano i fiori. Tu correvi tra le tombe e non avevi paura di niente.',
      exits: ['chiesa', 'centro', 'orfanotrofio', 'cappella', 'biblioteca', 'cripta', { id: 'pianto', linger: 40 }] },
    { id: 'bosco', name: 'Il bosco di notte', kind: 'luogo', level: 0, x: 0.24, y: 0.22, terrain: 'foglie', modus: 'insen', hush: 0.4, lumina: 'spente',
      levels: { m_vento: 0.5, m_grilli: 0.3, m_fruscio: 0.45, m_scricchiolio: 0.15, m_sussurri: 0.1 }, set: { lumen: 0.25, distantia: 0.5 }, libra: 0.6,
      pal: { bg: [5, 8, 7], accent: [160, 200, 170], second: [60, 90, 80] }, motif: { forest: 1 },
      ora: 'Il sentiero si è perso da un pezzo. Ogni albero assomiglia a quello di prima.',
      allora: 'Ti avevano detto di non allontanarti. Non hai mai capito quanto lontano fosse lontano.',
      exits: ['stelle', 'campagna', 'fuga', 'buio', 'x:bosco'] },
    { id: 'giardino', name: 'Il giardino dove restare', kind: 'luogo', level: 0, x: 0.98, y: 0.04, terrain: 'erba', modus: 'lidio', hush: 0.85, stay: true, hidden: true,
      levels: { m_uccelli: 0.35, m_fruscio: 0.2, m_canto: 0.2, m_carillon: 0.15, m_vento: 0.12 }, set: { lumen: 0.55, velum: 0.8, chorus: 0.3, aether: 0.8 }, libra: 0.9,
      pal: { bg: [12, 15, 10], accent: [240, 236, 170], second: [150, 200, 140] }, motif: { sun: 0.6, haze: 0.8, field: 0.6 },
      ora: 'Non c’è nessun motivo per andare via. Più resti, più è bello. Le strade, piano piano, scompaiono.',
      allora: 'Hai sempre saputo che c’era un posto così. Non pensavi di trovarlo davvero.',
      exits: ['felicita', 'alba', 'incontro', 'fiera'] },
    { id: 'fuga', name: 'La fuga', kind: 'stato', level: 0, x: 0.06, y: 0.76, terrain: 'corsa', modus: 'eolio', hush: 0, bpm: 0.85,
      levels: { m_cuore: 0.5, m_respiro: 0.5, m_vento: 0.4, m_passi: 0.1 }, set: { tempestas: 0.5, lumen: 0.15, nastro: 0.4 }, libra: 0.25,
      pal: { bg: [14, 8, 8], accent: [240, 120, 90], second: [120, 50, 60] }, motif: { fever: 0.4, rain: 0 },
      ora: 'Corri senza sapere da cosa. Non ti volti. Se ti volti, è vero.',
      allora: 'Sei scappato tante volte, e ogni volta la cosa da cui scappavi correva con te.',
      exits: ['periferia', 'bosco', 'stazione', 'campagna', 'mare'] },
    { id: 'crocevia', name: 'Il crocevia dei mondi', kind: 'luogo', level: 0, x: 0.98, y: 0.97, terrain: 'pietra', modus: 'armonici', hush: 0.5, hidden: true,
      levels: { m_vento: 0.3, m_campane: 0.1, m_canto: 0.1, m_radio: 0.15 }, set: { lumen: 0.4, aether: 0.8, mercurius: 0.5, chorus: 0.3 }, libra: 0.7,
      pal: { bg: [8, 6, 14], accent: [210, 170, 255], second: [90, 200, 200] }, motif: { rose: 0.3, nebula: 0.6 },
      ora: 'Quattro strade, e nessuna va in questo mondo. Una porta sull’acqua, una sulle stelle, una sul silenzio.',
      allora: 'Hai sempre pensato che dietro lo specchio dell’armadio ci fosse un altro posto.',
      exits: ['centro', 'sommerso', 'mare_stelle', 'capovolta', 'silenzio', 'x:crocevia'] },
    { id: 'salvezza', name: 'Qualcuno è venuto', kind: 'stato', level: 0, x: 0.7, y: 0.99, terrain: 'erba', modus: 'ionio', hush: 0.8, hidden: true,
      levels: { m_passi: 0.2, m_canto: 0.3, m_uccelli: 0.2, m_carillon: 0.2 }, set: { lumen: 0.6, velum: 0.7, chorus: 0.35, aether: 0.85 }, libra: 0.9,
      pal: { bg: [16, 14, 12], accent: [255, 228, 190], second: [210, 170, 140] }, motif: { sun: 0.5, meet: 0.6, haze: 0.5 },
      ora: 'Una mano sulla spalla. Una voce che dice il tuo nome come se lo conoscesse da sempre. Sei al sicuro.',
      allora: 'Hai chiamato tante volte, nel buio. Questa volta qualcuno ha sentito.',
      exits: ['soglia', 'alba', 'incontro', 'letto'] },

    // ——— IL SOTTOSUOLO
    { id: 'cripta', name: 'Le cripte', kind: 'luogo', level: -1, x: 0.5, y: 0.3, terrain: 'pietra', modus: 'eolio', hush: 0.5, lumina: 'candele',
      levels: { m_goccia: 0.4, m_candele: 0.3, m_sussurri: 0.2, m_organo: 0.15, m_vento: 0.15 }, set: { lumen: 0.3, crypta: 0.95, distantia: 0.6, chorus: 0.25 }, libra: 0.65,
      pal: { bg: [9, 8, 8], accent: [230, 180, 120], second: [100, 80, 70] }, motif: { candles: 0.7, ruin: 0.5 },
      ora: 'Volte basse, ossa ordinate con cura. Ogni passo torna indietro tre volte prima di spegnersi.',
      allora: 'Il prete diceva che qui sotto dormono. Tu stavi attento a non svegliarli.',
      exits: ['centro', 'chiesa', 'cimitero', 'pavimento', 'voci', 'lete', 'pozzo'] },
    { id: 'pavimento', name: 'Il pavimento gelido', kind: 'stato', level: -1, x: 0.25, y: 0.6, terrain: 'pietra', modus: 'insen', hush: 0.95, lumina: 'spente', help: true,
      levels: { m_ronzio: 0.15, m_respiro: 0.3, m_cuore: 0.15, m_goccia: 0.15 }, set: { lumen: 0.18, velum: 0.15, oblio: 0.5, distantia: 0.7 }, libra: 0.85, bpm: 0.15,
      pal: { bg: [6, 8, 10], accent: [150, 170, 190], second: [60, 70, 90] }, motif: { void: 0.5 },
      ora: 'Ti sei steso per terra. Il pavimento è gelido contro la guancia. Non pensi più a niente. Va bene così.',
      allora: 'Anche allora ti eri steso così, dopo quella telefonata, e il freddo era l’unica cosa vera.',
      exits: ['cripta', 'pianto', 'letto', { id: 'silenzio', linger: 60 }] },
    { id: 'voci', name: 'Le voci nella testa', kind: 'stato', level: -1, x: 0.72, y: 0.55, terrain: 'pietra', modus: 'insen', hush: 0.1, lumina: 'spente', urge: 50,
      levels: { m_sussurri: 0.75, m_acufene: 0.25, m_cuore: 0.2, m_radio: 0.1 }, set: { lumen: 0.15, nastro: 0.6, mercurius: 0.7, halitus: 0.8 }, libra: 0.4, bpm: 0.55,
      pal: { bg: [8, 6, 10], accent: [200, 170, 220], second: [90, 60, 110] }, motif: { whispers: 1 },
      ora: 'Parlano tutte insieme, vicinissime, e nessuna dice qualcosa che si possa capire fino in fondo.',
      allora: 'Di notte, da piccolo, sentivi parlare dall’altra stanza e ti sembrava che parlassero di te.',
      exits: ['cripta', 'buio', 'fuga', 'colpa', 'letto'] },
    { id: 'buio', name: 'La paura del buio', kind: 'stato', level: -1, x: 0.1, y: 0.32, terrain: 'pietra', modus: 'insen', hush: 0.35, lumina: 'spente', help: true, urge: 60,
      levels: { m_scricchiolio: 0.4, m_respiro: 0.35, m_cuore: 0.3, m_sussurri: 0.2, m_goccia: 0.2 }, set: { lumen: 0.12, distantia: 0.5 }, libra: 0.5, bpm: 0.62,
      pal: { bg: [4, 4, 6], accent: [170, 170, 200], second: [70, 60, 90] }, motif: { void: 0.3 },
      ora: 'Non sai dove sei finito. Qualcosa scricchiola alla tua sinistra. Il tuo respiro è il rumore più forte.',
      allora: 'Lasciavano la porta socchiusa e la luce del corridoio accesa. Bastava quella striscia.',
      exits: ['bosco', 'voci', 'pianto', 'fuga'] },
    { id: 'pianto', name: 'Piangere', kind: 'stato', level: -1, x: 0.4, y: 0.88, terrain: 'legno', modus: 'eolio', hush: 0.85, lumina: 'soffuse', help: true,
      levels: { m_pianto: 0.45, m_pioggia: 0.35, m_piano: 0.3, m_respiro: 0.15 }, set: { lumen: 0.3, velum: 0.3, nastro: 0.3 }, libra: 0.8,
      pal: { bg: [8, 10, 14], accent: [170, 190, 220], second: [90, 100, 140] }, motif: { tears: 1, glass: 0.5 },
      ora: 'Piangi, e non riesci a smettere. Speri solo che qualcuno apra la porta e si sieda accanto a te.',
      allora: 'Dopo, ti sentivi leggero e vuoto, come la stanza dopo un temporale.',
      exits: ['pavimento', 'buio', 'dolore', 'veglia'] },
    { id: 'colpa', name: 'Essere il dolore di qualcuno', kind: 'stato', level: -1, x: 0.9, y: 0.3, terrain: 'legno', modus: 'eolio', hush: 0.3, lumina: 'soffuse',
      levels: { m_pianto: 0.3, m_pendolo: 0.35, m_ronzio: 0.2, m_cuore: 0.25 }, set: { lumen: 0.2, metamorphosis: 0.35, calcinatio: 0.3 }, libra: 0.45, bpm: 0.5,
      pal: { bg: [12, 6, 8], accent: [210, 110, 110], second: [100, 50, 70] }, motif: { cracks: 0.5 },
      ora: 'Dietro la porta qualcuno piange, e la ragione sei tu. Non entri. Non te ne vai.',
      allora: 'Hai detto una frase, una sola. Qualcuno la porta ancora con sé, dopo tutti questi anni.',
      exits: ['voci', 'trono', 'rinnegare', 'pianto'] },
    { id: 'rinnegare', name: 'Rinnegare', kind: 'stato', level: -1, x: 0.64, y: 0.9, terrain: 'pietra', modus: 'insen', hush: 0, lumina: 'candele',
      levels: { m_organo: 0.4, m_campane: 0.35, m_candele: 0.2, m_vento: 0.3 }, set: { metamorphosis: 0.75, calcinatio: 0.5, plumbum: 0.35, tempestas: 0.4, lumen: 0.2, cinis: 0.5 }, libra: 0.25,
      pal: { bg: [14, 6, 4], accent: [230, 120, 60], second: [110, 40, 30] }, motif: { cracks: 1, candles: 0.4 },
      ora: 'L’organo stona, le campane sono incrinate. Le candele si spengono una dopo l’altra, e sei tu a soffiare.',
      allora: 'Il giorno in cui hai smesso di pregare non è successo niente. È questo che ti ha fatto più paura.',
      exits: ['chiesa', 'colpa', 'dolore', 'lete'] },

    // ——— L'ABISSO
    { id: 'lete', name: 'Il fiume dell’oblio', kind: 'luogo', level: -2, x: 0.3, y: 0.45, terrain: 'sabbia', modus: 'insen', hush: 0.7, forget: 4,
      levels: { m_mare: 0.3, m_goccia: 0.3, m_canto: 0.15, m_vento: 0.15 }, set: { lumen: 0.3, oblio: 0.9, nastro: 0.6, distantia: 0.8 }, libra: 0.8,
      pal: { bg: [6, 8, 10], accent: [170, 200, 210], second: [70, 90, 110] }, motif: { river: 1 },
      ora: 'L’acqua è nera e lenta. Ti chini a bere, e qualcosa che sapevi non lo sai più.',
      allora: '…',
      exits: ['cripta', 'rinnegare', 'sommerso', { id: 'silenzio', linger: 40 }] },
    { id: 'sommerso', name: 'Il mondo sommerso', kind: 'luogo', level: -2, x: 0.72, y: 0.4, terrain: 'acqua', modus: 'pentatonico', hush: 0.7,
      levels: { m_bolle: 0.55, m_canto: 0.15, m_campane: 0.15, m_mare: 0.2 }, set: { lumen: 0.4, oblio: 0.75, distantia: 0.7, aether: 0.8, chorus: 0.2 }, libra: 0.8,
      pal: { bg: [3, 12, 16], accent: [120, 220, 220], second: [40, 100, 140] }, motif: { underwater: 1 },
      ora: 'Una città intera sott’acqua. Le campane suonano ancora, ma il suono arriva tondo e lento.',
      allora: 'Trattenevi il fiato in vasca per sentire il mondo diventare lontano.',
      exits: ['pozzo', 'lete', 'crocevia', 'mare'] },
    { id: 'silenzio', name: 'Il mondo senza suono', kind: 'luogo', level: -2, x: 0.52, y: 0.88, terrain: 'neve', modus: 'insen', hush: 1, hidden: true, lumina: 'soffuse',
      levels: { m_acufene: 0.25, m_cuore: 0.2 }, set: { lumen: 0.1, chorus: 0, patera: 0, cantus: 0.15 }, libra: 0.95, bpm: 0.2,
      pal: { bg: [5, 5, 6], accent: [220, 220, 230], second: [90, 90, 100] }, motif: { void: 1 },
      ora: 'Qui non c’è niente. Senti solo il fischio delle orecchie e il cuore. Non hai mai sentito il tuo cuore così.',
      allora: 'Il silenzio dopo la neve, dopo un funerale, dopo un “ti amo” detto per la prima volta.',
      exits: ['lete', 'pavimento', 'alba'] }
  ];
  NEW.forEach(p => { ATH.PLACES.push(p); ATH.PLACE[p.id] = p; });

  // —— l'Altrove: stanze generate all'infinito
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const NOUNS = ['Un corridoio', 'Una stanza', 'Una scala', 'Un cortile', 'Una galleria', 'Un giardino', 'Una strada', 'Un ponte', 'Una sala d’attesa', 'Un pianerottolo', 'Una cucina', 'Un’aula', 'Una corsia d’ospedale', 'Una piscina vuota', 'Un teatro', 'Una serra', 'Un ascensore', 'Una cantina', 'Una spiaggia', 'Una piazza'];
  const QUALS = ['senza finestre', 'che sale', 'che scende', 'allagata', 'con un pianoforte', 'piena di sedie vuote', 'dove piove dentro', 'con tutte le luci accese', 'che non finisce', 'di specchi', 'che hai già visto', 'con il tuo nome sulla porta', 'coperta di neve', 'di un’altra casa', 'dove qualcuno ha appena smesso di cantare', 'piena di orologi fermi', 'tutta bianca', 'al contrario', 'piena di fotografie senza volti', 'dove è sempre domenica', 'con una sola candela', 'che profuma di cera e di arance'];
  const ORA = ['Non riconosci niente, eppure sai dove sono gli interruttori.', 'Una porta si chiude, da qualche parte, piano.', 'C’è una sedia rivolta verso il muro, come se qualcuno ci fosse appena stato in castigo.', 'Il pavimento è caldo, come se qualcuno ci avesse dormito.', 'Senti un carillon che hai già sentito, ma non sai dove.', 'Ogni passo ti allontana da dove eri. Ogni passo ti avvicina a qualcosa.', 'Qualcuno ha lasciato una luce accesa per te. O per qualcun altro.', 'Le pareti sono coperte di disegni di bambino. Uno ti somiglia.', 'L’aria sa di un’estate precisa, ma l’anno ti sfugge.', 'Da lontano qualcuno chiama un nome. Forse il tuo.', 'Il tempo qui va più lento. Lo senti nelle ginocchia.', 'Non c’è nessuno, ma ci sono tazze ancora tiepide sul tavolo.'];
  const ALLORA = ['Forse ci sei già stato, in sogno.', 'Era la casa di qualcuno che hai amato. O che avresti potuto amare.', 'In un’altra vita, qui c’era una festa.', 'Ti avevano promesso che saresti tornato. Non avevano detto quando.', 'Non è un ricordo. È un ricordo di un ricordo.', 'Qualcuno, qui, ha aspettato a lungo una persona che non è venuta.', 'Ricordi la forma della maniglia, non il resto.', 'Hai pianto qui, una volta. Non ricordi perché.'];
  const FIXED = () => ATH.PLACES.filter(p => !p.hidden && p.id !== 'salvezza');

  ATH.genPlace = function (id) {
    const parts = id.split(':');             // x:<seme o luogo>:<profondità>:<da dove>
    const from = ATH.PLACE[parts[1]] ? parts[1] : (parts[3] || 'soglia');
    const seed = ATH.PLACE[parts[1]] ? hash(parts[1]) : (+parts[1] >>> 0);
    const depth = +parts[2] || 1;
    const r = rng(seed * 31 + depth);
    const pick = a => a[Math.floor(r() * a.length)];
    const fx = FIXED(), A = pick(fx), B = pick(fx);
    const levels = {};
    ATH.MEM_IDS.forEach(m => { const v = ((A.levels[m] || 0) + (B.levels[m] || 0)) * 0.5; if (v > 0.03) levels[m] = v; });
    if (r() < 0.5) levels.m_canto = 0.15 + r() * 0.2;
    if (r() < 0.35) levels.m_sussurri = 0.1 + r() * 0.25 * Math.min(1, depth / 4);
    const mix = (a, b) => a.map((v, i) => Math.round(v * 0.5 + b[i] * 0.5));
    const fade = Math.min(0.6, depth * 0.08), grey = c => c.map(v => Math.round(v * (1 - fade) + 140 * fade * (v > 60 ? 1 : 0.1)));
    const motif = Object.assign({}, A.motif); Object.keys(motif).forEach(k => motif[k] *= 0.7);
    const lost = depth >= 4;
    const exits = [];
    const nx = 2 + (r() < 0.4 ? 1 : 0);
    for (let k = 0; k < nx; k++) exits.push('x:' + ((seed * 7 + k * 104729 + depth * 13) >>> 0) + ':' + (depth + 1) + ':' + from);
    if (!lost && r() < 0.55 - depth * 0.12) exits.push(from);
    if (!lost && r() < 0.25) exits.push(pick(fx).id);
    const lumina = pick(['soffuse', 'soffuse', 'candele', 'spente', 'accese']);
    return {
      id, gen: true, depth, from, name: pick(NOUNS) + ' ' + pick(QUALS), kind: 'altrove', level: pick([-2, -1, 0, 0, 1, 2]),
      x: 0.5, y: 0.5, terrain: pick(['pietra', 'legno', 'erba', 'neve', 'ghiaia', 'scala']), modus: pick(['insen', 'eolio', 'dorico', 'pentatonico', 'lidio', 'hirajoshi']),
      levels, set: { lumen: 0.3 + r() * 0.3, oblio: Math.min(0.9, 0.2 + depth * 0.1), distantia: Math.min(0.9, 0.3 + depth * 0.08), nastro: Math.min(0.85, 0.2 + depth * 0.08), chorus: r() * 0.4 },
      libra: 0.6 + r() * 0.3, hush: 0.4 + r() * 0.55, lumina, help: lost,
      pal: { bg: grey(mix(A.pal.bg, B.pal.bg)), accent: grey(mix(A.pal.accent, B.pal.accent)), second: grey(mix(A.pal.second, B.pal.second)) },
      motif, ora: pick(ORA), allora: pick(ALLORA), exits,
      lostText: lost ? 'Non sai più come tornare indietro.' : ''
    };
  };
  const genCache = {};
  ATH.getPlace = id => ATH.PLACE[id] || (typeof id === 'string' && id.indexOf('x:') === 0 ? (genCache[id] = genCache[id] || ATH.genPlace(id)) : null);
  ATH.exitId = e => {
    const id = typeof e === 'string' ? e : e.id;
    if (id.indexOf('x:') === 0 && id.split(':').length === 2) return id + ':1:' + id.split(':')[1];
    return id;
  };

  // nomi sulle lapidi: inventati, come le vite di cui nessuno si ricorda più
  ATH.TOMB_NAMES = ['Elvira', 'Nello', 'Ada', 'Guido', 'Rina', 'Teresa', 'Augusto', 'Iolanda', 'Primo', 'Settimia', 'Dante', 'Lucia', 'Ettore', 'Gemma', 'Oreste', 'Nives', 'Bruno', 'Annunziata', 'Livio', 'Clelia', 'Tullio', 'Bianca', 'Aldo', 'Ines', 'un bambino senza nome', 'una donna di cui resta solo la data'];
  ATH.SCENES = ATH.PLACES.slice().sort((a, b) => b.level - a.level);
})(window.ATH);
