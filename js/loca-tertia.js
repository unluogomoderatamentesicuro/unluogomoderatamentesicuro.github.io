/* ATHANOR — LA NASCITA E LA MORTE. Due livelli nuovi: in fondo il grembo,
   prima di ogni ricordo; in cima l'oltre, dopo l'ultimo. Tra i due, il lutto,
   le fotografie, i volti e le voci che si dimenticano, i profumi di una volta,
   il dubbio, l'urlo, l'orfanotrofio fino all'ultimo piano, il risveglio.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  ATH.LEVELS.unshift({ n: 4, name: 'L’oltre', gloss: 'dopo l’ultimo respiro' });
  ATH.LEVELS.push({ n: -3, name: 'Il grembo', gloss: 'prima del primo ricordo' });

  ATH.SCENTS = ['pane caldo', 'cera d’api', 'naftalina', 'mosto', 'fieno tagliato', 'brodo della domenica', 'la colonia del nonno', 'gesso', 'zucchero filato', 'terra bagnata', 'caffè sul fuoco', 'sapone di Marsiglia', 'legna bruciata', 'mandarini', 'incenso', 'inchiostro', 'basilico', 'fiori di tiglio', 'cuoio', 'lenzuola stese al sole'];

  const NEW = [
    // ——— L'OLTRE
    { id: 'oltre', name: 'Dall’altra parte', kind: 'stato', level: 4, x: 0.35, y: 0.5, terrain: 'nuvola', modus: 'armonici', hush: 0.95, lumina: 'accese', hidden: true,
      levels: { m_canto: 0.25, m_campane: 0.1 }, set: { lumen: 0.8, chorus: 0.7, aether: 1, velum: 0.9, distantia: 0.8, cantus: 0.3 }, libra: 0.98,
      pal: { bg: [20, 20, 22], accent: [250, 248, 240], second: [200, 205, 225] }, motif: { rose: 0.6, purify: 1, haze: 0.5 },
      ora: 'Non pesi più niente. Non fa più male niente. Una luce bianca, e dentro, lontanissime, delle voci che conosci.',
      allora: 'Ti avevano detto che saresti stato accolto. Non avevano detto da chi.',
      exits: ['empireo', 'rinascita', 'ultimo_respiro'] },
    { id: 'rinascita', name: 'La rinascita', kind: 'stato', level: 4, x: 0.72, y: 0.5, terrain: 'erba', modus: 'lidio', hush: 0.8,
      levels: { m_uccelli: 0.4, m_canto: 0.3, m_carillon: 0.2, m_vagito: 0.08 }, set: { lumen: 0.65, velum: 0.9, chorus: 0.4, aether: 0.85 }, libra: 0.9,
      pal: { bg: [14, 16, 10], accent: [230, 255, 190], second: [150, 220, 170] }, motif: { sun: 0.8, purify: 0.6, field: 0.5 },
      ora: 'Tutto ricomincia. Non sai ancora il tuo nome, ma senti già il caldo sulla pelle.',
      allora: 'Ogni volta che sei caduto, da qualche parte, qualcosa è ricresciuto.',
      exits: ['oltre', 'grembo', 'alba', 'giardino'] },

    // ——— I TETTI
    { id: 'ultimo_piano', name: 'L’ultimo piano', kind: 'stato', level: 2, x: 0.92, y: 0.75, terrain: 'legno', modus: 'lidio', hush: 0.9, lumina: 'accese', ascend: true, hidden: true,
      levels: { m_vento: 0.4, m_canto: 0.25, m_uccelli: 0.2, m_fruscio: 0.15 }, set: { lumen: 0.5, chorus: 0.5, aether: 0.95, velum: 0.85, oblio: 0.05 }, libra: 0.92,
      pal: { bg: [14, 14, 16], accent: [245, 238, 225], second: [180, 190, 210] }, motif: { purify: 1, beam: 0.25 },
      ora: 'Le finestre sono rotte e il vento entra pulito. La luce riempie la stanza piano, come acqua. Lasci andare.',
      allora: 'Hai attraversato tutti i piani. Ogni gradino era una cosa che non avevi mai detto. Adesso non pesa più.',
      exits: ['dormitorio', 'scale_orfano', 'campanile', { id: 'empireo', linger: 40 }, 'alba'] },

    // ——— LE TORRI
    { id: 'sala_parto', name: 'La nascita', kind: 'stato', level: 1, x: 0.06, y: 0.15, terrain: 'pietra', modus: 'ionio', hush: 0.6, lumina: 'accese',
      levels: { m_vagito: 0.55, m_monitor: 0.2, m_voci: 0.2, m_passi: 0.15, m_cuore: 0.2 }, set: { lumen: 0.55, chorus: 0.3, velum: 0.7 }, libra: 0.8, bpm: 0.55,
      pal: { bg: [16, 14, 16], accent: [255, 236, 226], second: [220, 180, 200] }, motif: { sun: 0.4, haze: 0.6, meet: 0.4 },
      ora: 'Un grido, il primo. Qualcuno piange e ride insieme. Una vita intera comincia in questo esatto momento.',
      allora: 'Non lo ricordi, nessuno lo ricorda. Ma è successo anche a te, ed era la cosa più grande del mondo.',
      exits: ['grembo', 'ospedale', 'ninna', 'alba'] },
    { id: 'ospedale', name: 'L’ospedale di notte', kind: 'luogo', level: 1, x: 0.36, y: 0.15, terrain: 'pietra', modus: 'dorico', hush: 0.5, lumina: 'soffuse',
      levels: { m_ronzio: 0.35, m_monitor: 0.25, m_passi: 0.25, m_voci: 0.1, m_telefono: 0.08 }, set: { lumen: 0.25, distantia: 0.5 }, libra: 0.7,
      pal: { bg: [8, 12, 12], accent: [190, 230, 220], second: [80, 120, 120] }, motif: { monitor: 0.5, windows: 0.3 },
      ora: 'Il corridoio verde, le sedie di plastica, il distributore che ronza. Da una porta si nasce, da un’altra si muore.',
      allora: 'Hai imparato qui che il tempo può fermarsi del tutto, alle quattro del mattino.',
      exits: ['sala_parto', 'ultimo_respiro', 'torre', 'veglia', 'male'] },
    { id: 'ultimo_respiro', name: 'L’ultimo respiro', kind: 'stato', level: 1, x: 0.36, y: 0.85, terrain: 'legno', modus: 'eolio', hush: 0.9, lumina: 'soffuse', flatline: 45,
      levels: { m_monitor: 0.4, m_respiro: 0.4, m_pendolo: 0.2, m_fruscio: 0.1 }, set: { lumen: 0.25, velum: 0.25, chorus: 0.15, respiratio: 0.3 }, libra: 0.85, bpm: 0.3,
      pal: { bg: [8, 9, 12], accent: [200, 210, 230], second: [90, 100, 130] }, motif: { monitor: 1 },
      ora: 'Gli tieni la mano. Il respiro si allunga, si allunga ancora. Tra un respiro e l’altro c’è tutto il silenzio del mondo.',
      allora: 'Volevi dire ancora una cosa. Te la porti dietro da allora.',
      exits: ['ospedale', 'funerale', 'veglia', { id: 'oltre', linger: 48 }] },
    { id: 'scale_orfano', name: 'Le scale dell’orfanotrofio', kind: 'luogo', level: 1, x: 0.66, y: 0.85, terrain: 'scala', modus: 'eolio', hush: 0.8, lumina: 'torcia',
      levels: { m_scricchiolio: 0.4, m_goccia: 0.3, m_vento: 0.35, m_respiro: 0.2 }, set: { lumen: 0.15, distantia: 0.6 }, libra: 0.7,
      pal: { bg: [6, 6, 8], accent: [210, 205, 190], second: [80, 80, 90] }, motif: { stairs: 0.6, ruin: 0.6 },
      ora: 'Una sola luce, la tua. I gradini scricchiolano. A ogni piano il silenzio è più grande e la paura più piccola.',
      allora: 'Di notte qualcuno saliva queste scale contando i gradini, per non pensare ad altro.',
      exits: ['orfanotrofio', 'dormitorio', { id: 'ultimo_piano', linger: 25 }] },
    { id: 'dormitorio', name: 'Il dormitorio', kind: 'luogo', level: 1, x: 0.9, y: 0.85, terrain: 'legno', modus: 'insen', hush: 0.85, lumina: 'torcia',
      levels: { m_carillon: 0.35, m_vento: 0.3, m_scricchiolio: 0.2, m_bambini: 0.08, m_sussurri: 0.1 }, set: { lumen: 0.2, oblio: 0.6, distantia: 0.8 }, libra: 0.75,
      pal: { bg: [8, 8, 10], accent: [196, 200, 214], second: [90, 90, 110] }, motif: { ruin: 0.6, motes: 0.6 },
      ora: 'Trenta letti di ferro in fila. Su uno c’è ancora un nome inciso, con la punta di una forchetta.',
      allora: 'Si addormentavano raccontandosi le famiglie che avrebbero avuto, un giorno.',
      exits: ['scale_orfano', { id: 'ultimo_piano', linger: 20 }, 'stanza'] },

    // ——— LA TERRA
    { id: 'funerale', name: 'Il giorno del funerale', kind: 'stato', level: 0, x: 0.84, y: 0.5, terrain: 'pietra', modus: 'eolio', hush: 0.6, lumina: 'soffuse',
      levels: { m_campane: 0.45, m_voci: 0.25, m_passi: 0.3, m_pioggia: 0.2, m_stoviglie: 0.1, m_organo: 0.2 }, set: { lumen: 0.25, chorus: 0.3, distantia: 0.5 }, libra: 0.7,
      pal: { bg: [9, 9, 10], accent: [200, 196, 190], second: [90, 90, 96] }, motif: { haze: 0.3, scents: 0.3 },
      ora: 'Tutti vestiti di scuro, tutti gentili. Qualcuno ti stringe la mano e dice una frase che non ascolti.',
      allora: 'La sera, a casa, qualcuno ha apparecchiato anche per chi non c’era più. Nessuno ha avuto il coraggio di dirlo.',
      exits: ['ultimo_respiro', 'cimitero', 'chiesa', 'stanza_vuota', 'fotografie'] },
    { id: 'stanza_vuota', name: 'La stanza di chi non c’è più', kind: 'luogo', level: 0, x: 0.68, y: 0.38, terrain: 'legno', modus: 'dorico', hush: 0.85, lumina: 'soffuse',
      levels: { m_pendolo: 0.35, m_fruscio: 0.2, m_radio: 0.08, m_canto: 0.12 }, set: { lumen: 0.25, oblio: 0.45, distantia: 0.6, nastro: 0.4 }, libra: 0.8,
      pal: { bg: [12, 10, 9], accent: [226, 206, 176], second: [130, 110, 90] }, motif: { motes: 0.8, scents: 0.6 },
      ora: 'Gli occhiali sul comodino, la giacca sulla sedia. L’orologio va ancora avanti, e nessuno sa perché.',
      allora: 'Per mesi non avete toccato niente. Poi un giorno qualcuno ha aperto la finestra, e l’odore è andato via.',
      exits: ['funerale', 'cucina', 'fotografie', 'voce_persa', 'volti', 'soffitta'] },
    { id: 'cucina', name: 'I profumi di una volta', kind: 'luogo', level: 0, x: 0.5, y: 0.06, terrain: 'legno', modus: 'lidio', hush: 0.75, lumina: 'accese',
      levels: { m_stoviglie: 0.45, m_radio: 0.2, m_camino: 0.25, m_voci: 0.15, m_canto: 0.15, m_pendolo: 0.1 }, set: { lumen: 0.4, velum: 0.6, nastro: 0.35 }, libra: 0.75,
      pal: { bg: [18, 14, 9], accent: [255, 214, 150], second: [210, 140, 80] }, motif: { scents: 1, haze: 0.6 },
      ora: 'Il sugo sul fuoco dalla mattina, il pane nel forno, la radio accesa piano. Nessuno ti chiede niente.',
      allora: 'Certi profumi non li hai più sentiti da allora. Se ne sentissi uno adesso, piangeresti.',
      exits: ['estate', 'stanza_vuota', 'domenica', 'campagna', 'festa_finita'] },
    { id: 'fotografie', name: 'Le fotografie', kind: 'luogo', level: 0, x: 0.57, y: 0.57, terrain: 'legno', modus: 'insen', hush: 0.85, lumina: 'soffuse',
      levels: { m_fruscio: 0.4, m_grammofono: 0.2, m_pendolo: 0.15 }, set: { lumen: 0.3, oblio: 0.5, nastro: 0.55, distantia: 0.5 }, libra: 0.8,
      pal: { bg: [14, 11, 8], accent: [230, 200, 150], second: [140, 110, 80] }, motif: { face: 0.6, motes: 0.5 },
      ora: 'Una scatola di fotografie. Sorridono tutti. Di metà di loro non sai più il nome.',
      allora: 'Dietro, a matita, una data e una parola: “felici”. Non sai chi l’ha scritta.',
      exits: ['stanza_vuota', 'volti', 'funerale', 'soglia', 'casa'] },
    { id: 'dubbio', name: 'Il dubbio', kind: 'stato', level: 0, x: 0.42, y: 0.47, terrain: 'pietra', modus: 'armonici', hush: 0.3, doubt: true,
      levels: { m_pendolo: 0.25, m_sussurri: 0.15, m_vento: 0.2 }, set: { lumen: 0.3, mercurius: 0.8, halitus: 0.7, aurora: 0.9 }, libra: 0.55,
      pal: { bg: [10, 10, 12], accent: [200, 200, 220], second: [140, 120, 160] }, motif: { doubt: 1 },
      ora: 'Ogni strada sembra giusta e ogni strada sembra sbagliata. Resti fermo, e anche restare è una scelta.',
      allora: 'Quella volta hai scelto. Ti chiedi ancora cosa sarebbe successo dall’altra parte.',
      exits: ['soglia', 'centro', 'chiesa', 'urlare', 'letto', 'rinnegare'] },
    { id: 'ospedale_abb', name: 'L’ospedale abbandonato', kind: 'luogo', level: 0, x: 0.66, y: 0.78, terrain: 'pietra', modus: 'insen', hush: 0.9, lumina: 'torcia',
      levels: { m_goccia: 0.45, m_scricchiolio: 0.35, m_vento: 0.3, m_ronzio: 0.08 }, set: { lumen: 0.15, distantia: 0.7, crypta: 0.9 }, libra: 0.75,
      pal: { bg: [5, 6, 6], accent: [200, 215, 205], second: [70, 90, 80] }, motif: { ruin: 1, void: 0.3 },
      ora: 'Il fascio della torcia trova una sedia a rotelle, un registro aperto, una porta che non dovrebbe essere aperta. Poi solo silenzio.',
      allora: 'Ci sei entrato per avere paura. Hai trovato qualcosa di più strano: una pace enorme.',
      exits: ['casa', 'orfanotrofio', 'veglia', 'buio'] },
    { id: 'treno_notte', name: 'Il treno di notte', kind: 'luogo', level: 0, x: 0.14, y: 0.44, terrain: 'legno', modus: 'dorico', hush: 0.55, lumina: 'soffuse',
      levels: { m_treno: 0.5, m_respiro: 0.15, m_voci: 0.08, m_vento: 0.15 }, set: { lumen: 0.25, distantia: 0.5 }, libra: 0.7,
      pal: { bg: [7, 8, 12], accent: [240, 210, 150], second: [80, 90, 130] }, motif: { train: 1, stars: 0.3 },
      ora: 'Lo scompartimento al buio, le luci delle stazioni che passano senza fermarsi. Non sai dove scenderai.',
      allora: 'Partivi con una valigia sola e la certezza che sarebbe cambiato tutto. Ed è cambiato tutto.',
      exits: ['stazione', 'periferia', 'risveglio', 'mare'] },
    { id: 'risveglio', name: 'Risvegliarsi', kind: 'stato', level: 0, x: 0.26, y: 0.88, terrain: 'legno', modus: 'pentatonico', hush: 0.9, lumina: 'spente', wake: 10,
      levels: { m_respiro: 0.3, m_fruscio: 0.3, m_pendolo: 0.15 }, set: { lumen: 0.2, oblio: 0.6, distantia: 0.6 }, libra: 0.85,
      pal: { bg: [6, 6, 8], accent: [200, 200, 210], second: [100, 100, 120] }, motif: { void: 0.4 },
      ora: 'Gli occhi pesano. Ti lasci andare. Quando li riapri, non sai dove sei.',
      allora: 'Da bambino ti addormentavi in macchina e ti svegliavi nel tuo letto. Non hai mai capito come.',
      exits: ['letto', 'treno_notte', 'soglia'] },
    { id: 'festa_finita', name: 'Dopo la festa', kind: 'luogo', level: 0, x: 0.76, y: 0.08, terrain: 'pietra', modus: 'eolio', hush: 0.6, lumina: 'soffuse',
      levels: { m_stoviglie: 0.3, m_festa: 0.12, m_vento: 0.2, m_voci: 0.08, m_carillon: 0.15 }, set: { lumen: 0.3, distantia: 0.6, nastro: 0.4 }, libra: 0.7,
      pal: { bg: [12, 8, 14], accent: [240, 180, 200], second: [140, 100, 160] }, motif: { lights: 0.4, motes: 0.4 },
      ora: 'Bicchieri a metà, coriandoli per terra, la musica ancora accesa in una stanza vuota. Tutti sono andati via.',
      allora: 'Era la festa più bella. Te ne sei accorto solo quando è finita.',
      exits: ['fiera', 'felicita', 'cucina', 'amore'] },

    // ——— IL SOTTOSUOLO
    { id: 'urlare', name: 'Chiudersi a urlare', kind: 'stato', level: -1, x: 0.3, y: 0.12, terrain: 'pietra', modus: 'insen', hush: 0.6, lumina: 'spente', scream: true,
      levels: { m_ronzio: 0.2, m_respiro: 0.35, m_cuore: 0.3 }, set: { lumen: 0.15, crypta: 0.6 }, libra: 0.6, bpm: 0.6,
      pal: { bg: [10, 5, 5], accent: [230, 100, 80], second: [110, 40, 40] }, motif: { cracks: 0.3 },
      ora: 'Hai chiuso la porta a chiave. Nessuno può sentirti. Puoi urlare finché ne hai.',
      allora: 'Speravi che nessuno sentisse. Una parte di te sperava il contrario.',
      exits: ['voci', 'buio', 'pavimento', 'colpa', 'dubbio'] },
    { id: 'volti', name: 'I volti che non ricordi', kind: 'stato', level: -1, x: 0.7, y: 0.12, terrain: 'pietra', modus: 'insen', hush: 0.9, lumina: 'soffuse', faceFade: 70,
      levels: { m_fruscio: 0.2, m_canto: 0.15, m_pendolo: 0.15 }, set: { lumen: 0.3, oblio: 0.6, nastro: 0.6, distantia: 0.7 }, libra: 0.85,
      pal: { bg: [9, 9, 11], accent: [220, 210, 200], second: [120, 110, 120] }, motif: { face: 1 },
      ora: 'Ricordi la sua sciarpa, la sua risata, il modo in cui diceva il tuo nome. Il volto no. Il volto non lo ricordi più.',
      allora: 'Ti sei accorto un giorno, all’improvviso, che dovevi guardare una fotografia per ricordarlo. Quel giorno è stato il secondo lutto.',
      exits: ['fotografie', 'voce_persa', 'lete', { id: 'dimenticarsi', linger: 50 }, 'stanza_vuota'] },
    { id: 'voce_persa', name: 'La voce che non ricordi', kind: 'stato', level: -1, x: 0.56, y: 0.62, terrain: 'legno', modus: 'dorico', hush: 0.9, lumina: 'soffuse',
      fadeOut: { ids: ['m_canto', 'm_voci'], secs: 75, end: 'Adesso non la ricordi più. Ricordi solo che c’era.' },
      levels: { m_canto: 0.55, m_voci: 0.25, m_pioggia: 0.15 }, set: { lumen: 0.3, oblio: 0.2, nastro: 0.3, distantia: 0.3 }, libra: 0.85,
      pal: { bg: [10, 10, 13], accent: [210, 200, 230], second: [120, 110, 150] }, motif: { haze: 0.3, motes: 0.3 },
      ora: 'Una voce canticchia. È la sua, ne sei sicuro. Ascolta bene, adesso, perché sta già andando via.',
      allora: 'Hai tenuto un vecchio messaggio in segreteria per anni, solo per sentirla. Poi il telefono si è rotto.',
      exits: ['volti', 'stanza_vuota', 'pianto'] },

    // ——— L'ABISSO
    { id: 'dimenticarsi', name: 'Dimenticarsi', kind: 'stato', level: -2, x: 0.1, y: 0.8, terrain: 'neve', modus: 'insen', hush: 0.95, lumina: 'soffuse', erode: 60, hidden: true,
      levels: { m_acufene: 0.15, m_vento: 0.2 }, set: { lumen: 0.2, oblio: 0.95, distantia: 0.9, nastro: 0.8 }, libra: 0.9,
      pal: { bg: [10, 10, 10], accent: [190, 190, 190], second: [110, 110, 110] }, motif: { void: 0.6, river: 0.4 },
      ora: 'Le parole perdono le lettere. I nomi perdono le facce. Alla fine ti dimentichi anche di te, e non fa male.',
      allora: 'Avevi paura di dimenticare. Adesso non ricordi più di cosa avessi paura.',
      exits: ['lete', 'volti', 'primo_ricordo', 'silenzio'] },

    // ——— IL GREMBO
    { id: 'grembo', name: 'Prima di nascere', kind: 'stato', level: -3, x: 0.35, y: 0.5, terrain: 'acqua', modus: 'pentatonico', hush: 0.98, lumina: 'soffuse',
      levels: { m_cuore: 0.5, m_bolle: 0.15, m_mare: 0.2, m_canto: 0.15 }, set: { lumen: 0.3, oblio: 0.95, distantia: 0.3, velum: 0.1 }, libra: 0.95, bpm: 0.2,
      pal: { bg: [16, 4, 6], accent: [255, 120, 110], second: [140, 40, 60] }, motif: { womb: 1 },
      ora: 'Buio caldo. Un cuore che non è il tuo batte sopra di te. Arriva, attutita, una voce che canta.',
      allora: 'Non c’è ancora un allora. C’è solo questo, e va bene così.',
      exits: ['primo_ricordo', 'sala_parto', 'sommerso'] },
    { id: 'primo_ricordo', name: 'Il primo ricordo', kind: 'luogo', level: -3, x: 0.7, y: 0.5, terrain: 'erba', modus: 'lidio', hush: 0.95, lumina: 'soffuse',
      levels: { m_carillon: 0.3, m_uccelli: 0.15, m_canto: 0.2, m_fruscio: 0.15 }, set: { lumen: 0.4, oblio: 0.8, nastro: 0.7, velum: 0.6, distantia: 0.7 }, libra: 0.9,
      pal: { bg: [16, 14, 12], accent: [255, 230, 190], second: [200, 170, 160] }, motif: { haze: 1, sun: 0.4, motes: 0.5 },
      ora: 'Una finestra, una tenda che si muove, una macchia di sole sul pavimento. Nient’altro. È il primo.',
      allora: 'Non sai se lo ricordi davvero o se te l’hanno raccontato. Lo tieni lo stesso.',
      exits: ['grembo', 'dimenticarsi', 'stanza', 'ninna'] }
  ];
  NEW.forEach(p => { ATH.PLACES.push(p); ATH.PLACE[p.id] = p; });

  const more = {
    soglia: ['dubbio', 'fotografie'], letto: ['risveglio'], pavimento: ['risveglio'], silenzio: ['dimenticarsi'],
    veglia: ['ospedale', 'ultimo_respiro'], orfanotrofio: ['scale_orfano', 'ospedale_abb'], casa: ['ospedale_abb', 'fotografie'],
    cimitero: ['funerale'], chiesa: ['funerale', 'dubbio'], estate: ['cucina'], domenica: ['cucina'], fiera: ['festa_finita'],
    felicita: ['festa_finita'], alba: [{ id: 'rinascita', linger: 60 }], giardino: ['rinascita'], empireo: ['oltre'],
    lete: ['volti', 'dimenticarsi'], sommerso: ['grembo'], stanza: ['primo_ricordo', 'dormitorio'], soffitta: ['stanza_vuota'],
    ninna: ['sala_parto', 'primo_ricordo'], male: ['ospedale'], voci: ['urlare'], buio: ['urlare', 'ospedale_abb'],
    pianto: ['voce_persa'], stazione: ['treno_notte'], amore: ['festa_finita'], colpa: ['urlare'], centro: ['dubbio'],
    campagna: ['cucina'], periferia: ['treno_notte'], torre: ['ospedale'], rinnegare: ['dubbio']
  };
  Object.keys(more).forEach(id => { ATH.PLACE[id].exits = ATH.PLACE[id].exits.concat(more[id]); });

  // nell'orfanotrofio si sale fino all'ultimo piano
  ATH.PLACE.orfanotrofio.ora = 'Le brande sono ancora in fila. Una finestra sbatte da sola. In fondo al corridoio, una scala sale nel buio.';

  ATH.SCENES = ATH.PLACES.slice().sort((a, b) => b.level - a.level);
})(window.ATH);
