/* ATHANOR — LOCA. Il mondo che si attraversa: luoghi fuori, stanze dentro,
   stati dell'animo. Ogni luogo ha i suoi suoni, la sua luce, le sue figure,
   due frasi (ora e allora) e le soglie verso altri luoghi. Alcune soglie si
   aprono solo se resti abbastanza a lungo.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  // x, y = posizione sulla mappa (0–1). linger = secondi di permanenza per scoprire la soglia nascosta.
  ATH.PLACES = [
    { id: 'soglia', name: 'La soglia', kind: 'luogo', x: 0.5, y: 0.5, terrain: 'pietra', modus: 'pentatonico',
      levels: { m_vento: 0.22 }, set: { lumen: 0.4, patera: 0.3, chorus: 0.12 }, libra: 0.5,
      pal: { bg: [12, 10, 12], accent: [214, 196, 168], second: [120, 100, 128] }, motif: {},
      ora: 'Sei sulla soglia. Il fuoco è acceso alle tue spalle.',
      allora: 'Da qui si va dove si è già stati, e anche dove non si è mai stati.',
      exits: ['stelle', 'campagna', 'casa', 'letto', 'mare'] },

    { id: 'stelle', name: 'Sotto le stelle', kind: 'luogo', x: 0.32, y: 0.12, terrain: 'erba', modus: 'pentatonico',
      levels: { m_grilli: 0.55, m_vento: 0.15 }, set: { lumen: 0.48, chorus: 0.35, velum: 0.35 }, libra: 0.7,
      pal: { bg: [4, 6, 16], accent: [176, 196, 255], second: [90, 82, 180] }, motif: { stars: 1 },
      ora: 'L’erba è fredda sotto la schiena. Il cielo non finisce da nessuna parte.',
      allora: 'Qualcuno ti indicava l’Orsa Maggiore, e tu facevi finta di vederla.',
      exits: ['lorenzo', 'campagna', 'mare', 'letto', { id: 'faro', linger: 40 }] },

    { id: 'lorenzo', name: 'Notte di San Lorenzo', kind: 'luogo', x: 0.18, y: 0.06, terrain: 'sabbia', modus: 'pentatonico',
      levels: { m_grilli: 0.6, m_mare: 0.22, m_carillon: 0.28, m_vento: 0.1 }, set: { lumen: 0.42 }, libra: 0.65,
      pal: { bg: [5, 7, 18], accent: [172, 192, 255], second: [92, 80, 176] }, motif: { stars: 1.4 },
      ora: 'Una scia, poi un’altra. Non fai in tempo a esprimere niente.',
      allora: 'Agosto, il mare in fondo, una voce che contava le stelle cadenti ad alta voce.',
      exits: ['stelle', 'mare', { id: 'faro', linger: 25 }] },

    { id: 'mare', name: 'In riva al mare', kind: 'luogo', x: 0.1, y: 0.3, terrain: 'sabbia', modus: 'lidio',
      levels: { m_mare: 0.8, m_gabbiani: 0.32, m_vento: 0.3, m_voci: 0.2, m_bambini: 0.18 }, set: { lumen: 0.35, velum: 0.55 }, libra: 0.6,
      pal: { bg: [5, 14, 17], accent: [142, 222, 212], second: [58, 130, 152] }, motif: { haze: 0.5 },
      ora: 'L’acqua torna sempre allo stesso punto, e ogni volta è diversa.',
      allora: 'Il secchiello, il sale sulle labbra, qualcuno che ti chiamava per il pranzo.',
      exits: ['stelle', 'campagna', 'stazione', { id: 'faro', linger: 30 }] },

    { id: 'faro', name: 'Il faro', kind: 'luogo', hidden: true, x: 0.04, y: 0.12, terrain: 'pietra', modus: 'eolio',
      levels: { m_mare: 0.6, m_vento: 0.55, m_gabbiani: 0.1 }, set: { lumen: 0.3, velum: 0.25, cantus: 0.35 }, libra: 0.65,
      pal: { bg: [6, 9, 13], accent: [250, 236, 190], second: [70, 96, 120] }, motif: { beam: 1 },
      ora: 'La luce gira e passa su di te ogni dodici secondi. Poi torna il buio.',
      allora: 'Da bambino ci avresti voluto vivere, con un gatto e un cannocchiale.',
      exits: ['mare', 'stelle', 'lorenzo'] },

    { id: 'campagna', name: 'Strada di campagna', kind: 'luogo', x: 0.42, y: 0.3, terrain: 'ghiaia', modus: 'lidio',
      levels: { m_passi: 0.45, m_cicale: 0.42, m_uccelli: 0.45, m_vento: 0.3, m_campane: 0.22 }, set: { lumen: 0.3, velum: 0.6 }, libra: 0.6,
      pal: { bg: [17, 14, 8], accent: [238, 206, 128], second: [150, 140, 70] }, motif: { field: 1, haze: 0.5 },
      ora: 'La ghiaia, i cipressi in fila, un cane che abbaia due poderi più in là.',
      allora: 'Tornavi da scuola a piedi e ogni sasso calciato era un pianeta.',
      exits: ['estate', 'domenica', 'casa', 'stelle', 'soglia', 'mare'] },

    { id: 'estate', name: 'Estate dai nonni', kind: 'luogo', x: 0.6, y: 0.18, terrain: 'ghiaia', modus: 'lidio',
      levels: { m_cicale: 0.62, m_grilli: 0.2, m_campane: 0.4, m_vento: 0.3, m_voci: 0.25 }, set: { lumen: 0.3 }, libra: 0.6,
      pal: { bg: [19, 14, 8], accent: [244, 196, 116], second: [204, 120, 60] }, motif: { haze: 1 },
      ora: 'Le persiane accostate, il caldo che ronza. In cucina qualcuno taglia il pane.',
      allora: 'Il pomeriggio non finiva mai. Adesso vorresti che non fosse mai finito.',
      exits: ['campagna', 'soffitta', 'domenica'] },

    { id: 'domenica', name: 'Domenica al paese', kind: 'luogo', x: 0.74, y: 0.28, terrain: 'pietra', modus: 'ionio',
      levels: { m_campane: 0.85, m_voci: 0.4, m_vento: 0.15, m_bambini: 0.25 }, set: { lumen: 0.3 }, libra: 0.6,
      pal: { bg: [17, 11, 12], accent: [248, 198, 190], second: [190, 120, 142] }, motif: { haze: 0.8 },
      ora: 'Le campane a festa. La piazza si riempie di vestiti buoni.',
      allora: 'Le paste incartate, la messa lunghissima, la libertà del dopo.',
      exits: ['campagna', 'estate', 'incontro', { id: 'fiera', linger: 30 }] },

    { id: 'fiera', name: 'La fiera di paese', kind: 'luogo', hidden: true, x: 0.88, y: 0.18, terrain: 'pietra', modus: 'ionio',
      levels: { m_carillon: 0.55, m_voci: 0.55, m_bambini: 0.5, m_festa: 0.3, m_campane: 0.15 }, set: { lumen: 0.35, chorus: 0.2 }, libra: 0.65,
      pal: { bg: [14, 8, 16], accent: [255, 196, 120], second: [220, 90, 140] }, motif: { lights: 1 },
      ora: 'Le luci della giostra continuano a girare anche quando chiudi gli occhi.',
      allora: 'Un gettone, un cavallo bianco, la paura bellissima di cadere.',
      exits: ['domenica', 'felicita'] },

    { id: 'casa', name: 'La casa abbandonata', kind: 'luogo', x: 0.62, y: 0.46, terrain: 'legno', modus: 'eolio',
      levels: { m_vento: 0.42, m_scricchiolio: 0.5, m_goccia: 0.4, m_pendolo: 0.12, m_radio: 0.18 }, set: { lumen: 0.22, velum: 0.25, oblio: 0.4 }, libra: 0.55,
      pal: { bg: [11, 10, 9], accent: [196, 178, 150], second: [96, 88, 76] }, motif: { ruin: 1, motes: 0.6 },
      ora: 'La carta da parati si stacca a lembi. C’è ancora un calendario appeso, fermo a marzo.',
      allora: 'Qui qualcuno ha apparecchiato la tavola per sei, ogni sera, per anni.',
      exits: ['soffitta', 'orfanotrofio', 'campagna', 'pioggia', { id: 'stanza', linger: 45 }] },

    { id: 'soffitta', name: 'La soffitta', kind: 'luogo', x: 0.78, y: 0.42, terrain: 'legno', modus: 'ionio',
      levels: { m_grammofono: 0.62, m_pendolo: 0.5, m_carillon: 0.6, m_scricchiolio: 0.2 }, set: { lumen: 0.2, nastro: 0.5 }, libra: 0.6,
      pal: { bg: [16, 12, 9], accent: [226, 192, 142], second: [142, 100, 68] }, motif: { motes: 1 },
      ora: 'Un baule, un grammofono, un carillon che riparte da solo quando lo sfiori.',
      allora: 'Ci salivi di nascosto a cercare le cose dei grandi, e trovavi solo polvere e meraviglia.',
      exits: ['casa', 'estate', { id: 'stanza', linger: 30 }] },

    { id: 'stanza', name: 'La stanza che non ricordavi', kind: 'luogo', hidden: true, x: 0.9, y: 0.52, terrain: 'legno', modus: 'insen',
      levels: { m_carillon: 0.55, m_grammofono: 0.3, m_pendolo: 0.2, m_bambini: 0.12 }, set: { lumen: 0.3, oblio: 0.75, nastro: 0.7, distantia: 0.6 }, libra: 0.65,
      pal: { bg: [10, 9, 14], accent: [210, 190, 255], second: [140, 110, 170] }, motif: { motes: 0.8, stars: 0.4 },
      ora: 'Una porta che prima non c’era. Dentro, i tuoi giocattoli, messi in ordine da qualcuno.',
      allora: 'Non sei sicuro che sia successo davvero. Ma la stanza sì, quella la ricordi.',
      exits: ['soffitta', 'casa'] },

    { id: 'orfanotrofio', name: 'L’orfanotrofio', kind: 'luogo', x: 0.72, y: 0.62, terrain: 'pietra', modus: 'eolio',
      levels: { m_goccia: 0.5, m_vento: 0.5, m_scricchiolio: 0.3, m_carillon: 0.32, m_bambini: 0.2, m_campane: 0.1 }, set: { lumen: 0.2, oblio: 0.6, distantia: 0.75, velum: 0.2 }, libra: 0.6,
      pal: { bg: [9, 10, 12], accent: [170, 184, 196], second: [80, 90, 104] }, motif: { ruin: 1, motes: 0.5 },
      ora: 'Le brande sono ancora in fila. Una finestra sbatte da sola, a intervalli regolari.',
      allora: 'Qualcuno, qui, ha imparato presto a non aspettare più nessuno.',
      exits: ['casa', { id: 'cappella', linger: 35 }, { id: 'pozzo', linger: 50 }] },

    { id: 'cappella', name: 'La cappella sconsacrata', kind: 'luogo', hidden: true, x: 0.86, y: 0.72, terrain: 'pietra', modus: 'dorico',
      levels: { m_goccia: 0.22, m_campane: 0.3, m_vento: 0.2 }, set: { lumen: 0.65, chorus: 0.6, velum: 0.3, aether: 0.85, cantus: 0.3 }, libra: 0.85,
      pal: { bg: [10, 9, 12], accent: [240, 222, 190], second: [130, 110, 160] }, motif: { beam: 0.5, motes: 1 },
      ora: 'Non c’è più l’altare, ma la voce rimbalza sulle volte come se pregasse da sola.',
      allora: 'Ti sei inginocchiato una volta sola, e non sapevi bene per chi.',
      exits: ['orfanotrofio', 'neve'] },

    { id: 'pozzo', name: 'Il pozzo', kind: 'luogo', hidden: true, x: 0.62, y: 0.78, terrain: 'pietra', modus: 'insen',
      levels: { m_goccia: 0.7, m_vento: 0.2 }, set: { lumen: 0.2, distantia: 0.9, ouroboros: 0.7, tempus: 0.62 }, libra: 0.6,
      pal: { bg: [5, 8, 10], accent: [150, 200, 220], second: [40, 70, 90] }, motif: { well: 1 },
      ora: 'Lasci cadere un sasso e conti. Non arriva mai in fondo.',
      allora: 'Ti dicevano che in fondo c’era la luna, e ci hai creduto per anni.',
      exits: ['orfanotrofio'] },

    { id: 'pioggia', name: 'Pioggia sul tetto', kind: 'luogo', x: 0.5, y: 0.66, terrain: 'legno', modus: 'dorico',
      levels: { m_pioggia: 0.75, m_camino: 0.35, m_piano: 0.5, m_pendolo: 0.22 }, set: { lumen: 0.25 }, libra: 0.6,
      pal: { bg: [9, 12, 15], accent: [164, 194, 214], second: [84, 104, 124] }, motif: { glass: 0.7 },
      ora: 'Piove forte, e la casa sembra più piccola e più tua.',
      allora: 'Un plaid, un libro che non leggevi, il pianoforte di là che sbagliava sempre la stessa nota.',
      exits: ['casa', 'letto', 'attesa', 'neve'] },

    { id: 'neve', name: 'La prima neve', kind: 'luogo', x: 0.38, y: 0.78, terrain: 'neve', modus: 'insen',
      levels: { m_vento: 0.35, m_carillon: 0.45, m_camino: 0.42, m_piano: 0.2 }, set: { lumen: 0.45 }, libra: 0.65,
      pal: { bg: [11, 13, 18], accent: [236, 242, 255], second: [150, 170, 204] }, motif: { snow: 1 },
      ora: 'Il mondo ha smesso di fare rumore. Si sente solo il fuoco.',
      allora: 'Ti svegliavi e capivi che aveva nevicato dal silenzio, prima ancora di guardare.',
      exits: ['pioggia', 'campagna', 'letto'] },

    { id: 'stazione', name: 'La stazione deserta', kind: 'luogo', x: 0.2, y: 0.52, terrain: 'pietra', modus: 'eolio',
      levels: { m_treno: 0.6, m_vento: 0.3, m_ronzio: 0.28, m_voci: 0.12, m_pioggia: 0.3 }, set: { lumen: 0.25, distantia: 0.6 }, libra: 0.6,
      pal: { bg: [9, 10, 12], accent: [232, 214, 160], second: [80, 100, 110] }, motif: { train: 1 },
      ora: 'Il tabellone gira le lettere per un treno che non passa più.',
      allora: 'Lì hai detto arrivederci, intendevi addio, e lo sapevate tutti e due.',
      exits: ['mare', 'attesa', 'letto'] },

    { id: 'letto', name: 'Prima di dormire', kind: 'stato', x: 0.36, y: 0.6, terrain: 'legno', modus: 'pentatonico', bpm: 0.12, spira: true,
      levels: { m_pendolo: 0.42, m_cuore: 0.3, m_vento: 0.1, m_respiro: 0.2 }, set: { lumen: 0.2, velum: 0.18, respiratio: 0.25 }, libra: 0.8,
      pal: { bg: [5, 6, 10], accent: [170, 176, 210], second: [70, 72, 110] }, motif: { ceiling: 1 },
      ora: 'Sei fermo, al buio. Il soffitto si accende per un attimo: una macchina che passa.',
      allora: 'Da piccolo contavi i fari sul soffitto finché non dimenticavi il numero.',
      exits: ['stelle', 'attesa', 'male', 'veglia', 'soglia', 'pioggia'] },

    { id: 'attesa', name: 'L’attesa', kind: 'stato', x: 0.26, y: 0.72, terrain: 'pietra', modus: 'dorico', bpm: 0.35,
      levels: { m_pendolo: 0.5, m_pioggia: 0.4, m_telefono: 0.35, m_passi: 0.25, m_cuore: 0.18 }, set: { lumen: 0.22 }, libra: 0.65,
      pal: { bg: [8, 10, 13], accent: [186, 196, 214], second: [92, 100, 126] }, motif: { glass: 1 },
      ora: 'Doveva essere qui alle otto. Sono le nove e venti. Ogni passo per strada sembra il suo.',
      allora: 'Hai imparato l’ora esatta in cui una persona smette di arrivare.',
      exits: ['amore', 'stazione', 'letto', 'pioggia'] },

    { id: 'amore', name: 'Amore non corrisposto', kind: 'stato', x: 0.14, y: 0.86, terrain: 'pietra', modus: 'eolio', bpm: 0.5,
      levels: { m_festa: 0.38, m_pioggia: 0.28, m_piano: 0.5, m_cuore: 0.32, m_voci: 0.22 }, set: { lumen: 0.3, velum: 0.3 }, libra: 0.62,
      pal: { bg: [12, 7, 12], accent: [232, 150, 176], second: [110, 70, 120] }, motif: { glass: 0.7 },
      ora: 'Di là ridono. Tu hai scritto e cancellato lo stesso messaggio undici volte.',
      allora: 'Bastava uno sguardo per decidere il colore di tutta la giornata.',
      exits: ['attesa', 'incontro', 'letto'] },

    { id: 'male', name: 'Stare male', kind: 'stato', x: 0.48, y: 0.9, terrain: 'legno', modus: 'insen', bpm: 0.6,
      levels: { m_acufene: 0.35, m_cuore: 0.42, m_respiro: 0.45, m_ronzio: 0.15 }, set: { lumen: 0.2, nastro: 0.65, oblio: 0.35, mercurius: 0.6, halitus: 0.7 }, libra: 0.45,
      pal: { bg: [12, 10, 6], accent: [214, 200, 120], second: [130, 100, 60] }, motif: { fever: 1 },
      ora: 'La febbre fa ondeggiare la stanza. I rumori arrivano da lontanissimo.',
      allora: 'Una mano fresca sulla fronte, e la certezza che tutto si sarebbe sistemato.',
      exits: ['veglia', 'letto', 'dolore'] },

    { id: 'veglia', name: 'La veglia', kind: 'stato', x: 0.6, y: 0.94, terrain: 'legno', modus: 'dorico', bpm: 0.28,
      levels: { m_monitor: 0.42, m_ronzio: 0.32, m_pendolo: 0.28, m_respiro: 0.3, m_pioggia: 0.18 }, set: { lumen: 0.2, velum: 0.2 }, libra: 0.7,
      pal: { bg: [6, 10, 10], accent: [140, 220, 190], second: [60, 100, 100] }, motif: { monitor: 1 },
      ora: 'Non dormi. Ascolti il suo respiro e conti: uno, due, ancora uno.',
      allora: 'Una volta vegliavano te, sulla stessa sedia scomoda, con la stessa luce accesa.',
      exits: ['male', 'letto', { id: 'alba', linger: 40 }] },

    { id: 'dolore', name: 'Il dolore', kind: 'stato', x: 0.36, y: 0.96, terrain: 'pietra', modus: 'insen', bpm: 0.78,
      levels: { m_cuore: 0.5, m_acufene: 0.3, m_respiro: 0.3 },
      set: { tempestas: 0.6, calcinatio: 0.55, ouroboros: 0.7, metamorphosis: 0.7, cinis: 0.55, lumen: 0.15 }, libra: 0.12,
      pal: { bg: [18, 5, 5], accent: [222, 62, 36], second: [120, 20, 40] }, motif: { fever: 0.6 },
      ora: 'Qui non ci sono parole. Solo il fuoco, e tu dentro.',
      allora: 'Anche questo è passato. O passerà. Da qui non si vede, ma succede.',
      exits: ['male', { id: 'alba', linger: 45 }] },

    { id: 'alba', name: 'L’alba', kind: 'stato', hidden: true, x: 0.8, y: 0.86, terrain: 'erba', modus: 'lidio',
      levels: { m_uccelli: 0.55, m_campane: 0.2, m_vento: 0.12 }, set: { lumen: 0.6, velum: 0.75, chorus: 0.3 }, libra: 0.85,
      pal: { bg: [16, 12, 14], accent: [255, 206, 170], second: [200, 140, 170] }, motif: { sun: 0.7, haze: 0.6 },
      ora: 'La finestra si schiarisce. È passata la notte, anche questa.',
      allora: 'Ogni volta hai pensato che non sarebbe arrivata. Ogni volta è arrivata.',
      exits: ['felicita', 'campagna', 'veglia'] },

    { id: 'felicita', name: 'La felicità', kind: 'stato', x: 0.92, y: 0.36, terrain: 'erba', modus: 'lidio', bpm: 0.4,
      levels: { m_uccelli: 0.5, m_bambini: 0.45, m_campane: 0.35, m_carillon: 0.3, m_voci: 0.3 }, set: { lumen: 0.55, velum: 0.8, chorus: 0.3 }, libra: 0.85,
      pal: { bg: [18, 15, 8], accent: [255, 220, 130], second: [240, 150, 90] }, motif: { sun: 1, haze: 0.8 },
      ora: 'Ridi senza un motivo preciso, e il motivo è tutto quello che hai intorno.',
      allora: 'Un pomeriggio qualunque. È rimasto per sempre.',
      exits: ['incontro', 'campagna', 'mare', { id: 'fiera', linger: 20 }] },

    { id: 'incontro', name: 'L’incontro', kind: 'stato', x: 0.9, y: 0.66, terrain: 'pietra', modus: 'ionio', bpm: 0.45,
      levels: { m_passi: 0.38, m_voci: 0.35, m_cuore: 0.28, m_piano: 0.32 }, set: { lumen: 0.5, velum: 0.6 }, libra: 0.75,
      pal: { bg: [14, 10, 10], accent: [255, 190, 160], second: [180, 120, 150] }, motif: { meet: 1 },
      ora: 'Qualcuno si ferma davanti a te. Ha una voce che ti sembra di conoscere da sempre.',
      allora: 'Avete parlato finché non hanno spento le luci del bar, e anche dopo.',
      exits: ['felicita', 'amore', 'domenica'] }
  ];
  ATH.PLACE = {};
  ATH.PLACES.forEach(p => ATH.PLACE[p.id] = p);
  ATH.SCENES = ATH.PLACES;
  ATH.exitId = e => typeof e === 'string' ? e : e.id;
})(window.ATH);
