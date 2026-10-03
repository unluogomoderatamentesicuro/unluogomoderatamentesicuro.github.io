/* ATHANOR — LA CASA E I MORTI. La casa vuota e le sue stanze, gli incubi, chi
   ti ha cresciuto, la mano del nonno, le occasioni perdute, il vuoto, la madre
   che non hai visto, il padre lontano, la vita che non hai avuto. E la pace.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const NEW = [
    // ——— LA CASA
    { id: 'casa_vuota', name: 'La casa vuota', kind: 'luogo', level: 0, x: 0.7, y: 0.3, terrain: 'legno', modus: 'eolio', hush: 0.5, swing: 50, lumina: 'soffuse',
      levels: { m_tubature: 0.45, m_scricchiolio: 0.35, m_ronzio: 0.2, m_pendolo: 0.3, m_goccia: 0.2, m_vento: 0.15 }, set: { lumen: 0.25, distantia: 0.5 }, libra: 0.65,
      pal: { bg: [11, 10, 9], accent: [214, 196, 166], second: [110, 98, 84] }, motif: { ruin: 0.4, motes: 0.5 },
      ora: 'Non c’è nessuno, eppure la casa parla: i tubi bussano, il legno si assesta, il frigorifero ronza. Poi, all’improvviso, tace.',
      allora: 'Era piena di voci, una volta. Le senti ancora, nei momenti in cui si zittisce tutto.',
      exits: ['casa', 'ripostiglio', 'letto_nonni', 'moquette', 'macchinina', 'occasioni'] },
    { id: 'ripostiglio', name: 'Il ripostiglio', kind: 'luogo', level: 0, x: 0.78, y: 0.2, terrain: 'legno', modus: 'insen', hush: 0.85, lumina: 'torcia',
      levels: { m_fruscio: 0.35, m_scricchiolio: 0.2, m_goccia: 0.08 }, set: { lumen: 0.2, oblio: 0.5, nastro: 0.4 }, libra: 0.8,
      pal: { bg: [10, 9, 8], accent: [210, 190, 160], second: [100, 88, 74] }, motif: { clutter: 1, motes: 1 },
      ora: 'Scatole su scatole, ammassate da anni. Una bicicletta senza ruote, un ventilatore, un sacco di vestiti che nessuno metterà più.',
      allora: 'Qui si mettono le cose che non si ha il coraggio di buttare. Anche certi ricordi stanno qui.',
      exits: ['casa_vuota', 'soffitta', 'macchinina'] },
    { id: 'letto_nonni', name: 'Il vecchio letto', kind: 'luogo', level: 0, x: 0.8, y: 0.36, terrain: 'legno', modus: 'pentatonico', hush: 0.9, peace: 70, lumina: 'soffuse',
      levels: { m_pendolo: 0.35, m_fruscio: 0.25, m_canto: 0.12, m_tubature: 0.08 }, set: { lumen: 0.3, velum: 0.4, oblio: 0.3 }, libra: 0.85,
      pal: { bg: [13, 11, 9], accent: [232, 206, 170], second: [140, 110, 86] }, motif: { motes: 0.6, wallpaper: 0.3 },
      ora: 'Il letto alto dei nonni, con la coperta all’uncinetto. Il materasso ha ancora la loro forma.',
      allora: 'Ci dormivi in mezzo, quando avevi paura dei temporali. Nessun posto al mondo è stato più sicuro.',
      exits: ['casa_vuota', 'moquette', 'mano_nonno', 'stanza_vuota'] },
    { id: 'moquette', name: 'La stanza della moquette', kind: 'luogo', level: 0, x: 0.86, y: 0.28, terrain: 'sabbia', modus: 'dorico', hush: 0.8, lumina: 'soffuse',
      levels: { m_radio: 0.12, m_pendolo: 0.2, m_fruscio: 0.2, m_ronzio: 0.1 }, set: { lumen: 0.25, nastro: 0.5, oblio: 0.4 }, libra: 0.8,
      pal: { bg: [13, 10, 8], accent: [214, 176, 130], second: [130, 90, 70] }, motif: { wallpaper: 1, motes: 0.4 },
      ora: 'La carta da parati a fiori si stacca in lunghe lingue. Sotto i piedi la moquette dei nonni, consumata dove passavano sempre.',
      allora: 'Seguivi i disegni della carta con il dito, cercando la fine del motivo. Non l’hai mai trovata.',
      exits: ['casa_vuota', 'letto_nonni', 'cucina'] },
    { id: 'macchinina', name: 'La macchinina rossa', kind: 'luogo', level: 0, x: 0.72, y: 0.12, terrain: 'legno', modus: 'lidio', hush: 0.92, lumina: 'soffuse',
      levels: { m_fruscio: 0.12, m_treno: 0.12, m_carillon: 0.12, m_pendolo: 0.12 }, set: { lumen: 0.3, oblio: 0.4, distantia: 0.5 }, libra: 0.85,
      pal: { bg: [10, 8, 8], accent: [236, 90, 70], second: [120, 60, 60] }, motif: { toycar: 1, motes: 0.4 },
      ora: 'Su una mensola, da sola, una macchinina rossa. Una Ferrari in miniatura, con la vernice consumata sugli spigoli.',
      allora: 'Te l’ha regalata tuo padre, una delle due o tre volte che l’hai visto. Di lui ricordi questo: le sue mani che te la porgevano.',
      exits: ['casa_vuota', 'ripostiglio', 'treno_notte', { id: 'citta_lontana', linger: 40 }] },
    { id: 'occasioni', name: 'Le occasioni perdute', kind: 'stato', level: 0, x: 0.66, y: 0.42, terrain: 'pietra', modus: 'dorico', hush: 0.5, lumina: 'soffuse',
      clues: ['Quella domenica in cui hai detto: la prossima volta.', 'La telefonata che hai lasciato squillare.', 'Il compleanno a cui non sei andato.', 'La passeggiata che ti aveva chiesto, e tu avevi da fare.', 'La domanda che non gli hai mai fatto.'],
      levels: { m_telefono: 0.4, m_treno: 0.3, m_pendolo: 0.35, m_vento: 0.2 }, set: { lumen: 0.25, nastro: 0.3 }, libra: 0.7,
      pal: { bg: [10, 10, 12], accent: [200, 200, 214], second: [100, 100, 120] }, motif: { train: 0.4 },
      ora: 'Il telefono squilla, il treno parte, l’orologio non si ferma. Tutte le volte che c’era tempo, e non l’hai preso.',
      allora: '',
      exits: ['mano_nonno', 'casa_vuota', 'ultimo_respiro', 'stazione'] },
    { id: 'risalita', name: 'Accettare', kind: 'stato', level: 0, x: 0.56, y: 0.16, terrain: 'erba', modus: 'lidio', hush: 0.7, peace: 90,
      levels: { m_vento: 0.2, m_respiro: 0.15, m_uccelli: 0.15, m_carezza: 0.2 }, set: { lumen: 0.4, velum: 0.6, chorus: 0.25 }, libra: 0.85,
      pal: { bg: [13, 13, 12], accent: [236, 220, 190], second: [170, 160, 150] }, motif: { sun: 0.3, purify: 0.3, haze: 0.4 },
      ora: 'Ti rialzi. Hai capito una cosa semplice e difficile: la rabbia non riporta indietro nessuno.',
      allora: 'Chi hai perso non torna. Puoi solo portarlo con te, e continuare a camminare anche per lui.',
      exits: ['rabbia', 'alba', 'pace', 'mano_nonno', 'vuoto'] },
    { id: 'venticinque', name: 'Venticinque anni dopo', kind: 'luogo', level: 0, x: 0.95, y: 0.7, terrain: 'ghiaia', modus: 'eolio', hush: 0.8, lumina: 'soffuse',
      levels: { m_vento: 0.4, m_passi: 0.15, m_campane: 0.1, m_fruscio: 0.12 }, set: { lumen: 0.3, distantia: 0.6, oblio: 0.4 }, libra: 0.8,
      pal: { bg: [10, 10, 11], accent: [214, 206, 190], second: [110, 110, 116] }, motif: { loculi: 1 },
      ora: 'Il muro dei loculi, file e file di fotografie ovali. Le guardi, e pensi che sono lì, proprio lì, dietro il marmo.',
      allora: 'Sono passati venticinque anni, forse di più. I fiori di plastica hanno perso il colore. Tu non hai perso niente di loro.',
      exits: ['cimitero', 'madre', 'vuoto', 'funerale'] },
    { id: 'madre', name: 'La madre che non hai visto', kind: 'stato', level: 0, x: 0.98, y: 0.82, terrain: 'ghiaia', modus: 'pentatonico', hush: 0.96, peace: 80, lumina: 'candele',
      levels: { m_canto: 0.25, m_vento: 0.2, m_carillon: 0.12, m_candele: 0.2 }, set: { lumen: 0.3, oblio: 0.5, distantia: 0.7, chorus: 0.2 }, libra: 0.9,
      pal: { bg: [10, 9, 10], accent: [230, 210, 200], second: [130, 110, 120] }, motif: { cameo: 1, candles: 0.4 },
      ora: 'Sulla lapide, una fotografia ovale. Una ragazza giovane, più giovane di quanto sei tu adesso. È tua madre.',
      allora: 'Avevi tre mesi. Non hai un ricordo, un odore, una voce. Hai solo questa fotografia, e la conosci a memoria.',
      exits: ['venticinque', 'cimitero', 'vita_mai', 'volti'] },
    { id: 'citta_lontana', name: 'La città lontana', kind: 'luogo', level: 0, x: 0.04, y: 0.36, terrain: 'pietra', modus: 'eolio', hush: 0.6, hidden: true, lumina: 'soffuse',
      levels: { m_treno: 0.2, m_voci: 0.2, m_campane: 0.25, m_vento: 0.3, m_passi: 0.2 }, set: { lumen: 0.3, distantia: 0.7 }, libra: 0.7,
      pal: { bg: [10, 10, 12], accent: [214, 200, 180], second: [100, 100, 120] }, motif: { city: 0.5, tombs: 0.3 },
      ora: 'Una città dove non conosci nessuno. Da qualche parte, in un cimitero che non sai trovare, c’è tuo padre.',
      allora: 'Per anni hai detto: un giorno ci vado. Poi hai capito che bisogna deciderlo, il viaggio. Non succede da solo.',
      exits: ['treno_notte', 'macchinina', 'vita_mai'] },

    // ——— LE TORRI
    { id: 'mano_nonno', name: 'La mano del nonno', kind: 'stato', level: 1, x: 0.5, y: 0.7, terrain: 'legno', modus: 'lidio', hush: 0.95, peace: 50, lumina: 'soffuse',
      levels: { m_carezza: 0.4, m_pendolo: 0.2, m_canto: 0.15, m_uccelli: 0.1 }, set: { lumen: 0.4, velum: 0.5, oblio: 0.35 }, libra: 0.9,
      pal: { bg: [14, 11, 9], accent: [246, 214, 170], second: [180, 140, 100] }, motif: { hand: 1, haze: 0.5 },
      ora: 'Una mano enorme, ruvida, calda, ti accarezza la testa. Non dice niente. Non serve.',
      allora: 'Poi sei cresciuto, e ti sei allontanato. Avevi sempre qualcosa da fare. Lui aspettava, e non te l’ha mai detto.',
      exits: ['letto_nonni', 'occasioni', 'ultimo_respiro', 'torre', 'ninna'] },
    { id: 'vita_mai', name: 'La vita che non hai avuto', kind: 'stato', level: 1, x: 0.14, y: 0.6, terrain: 'legno', modus: 'dorico', hush: 0.8, lumina: 'soffuse',
      clues: ['Come sarebbe stata la sua voce?', 'Ti avrebbero portato al mare, d’estate?', 'Avresti avuto i suoi occhi, o quelli di lui?', 'Chi saresti diventato?', 'Avrebbero capito le tue scelte?', 'Non c’è risposta. Non c’è mai stata.'],
      levels: { m_stoviglie: 0.25, m_voci: 0.25, m_bambini: 0.1, m_radio: 0.1 }, set: { lumen: 0.3, distantia: 0.85, oblio: 0.5 }, libra: 0.8,
      pal: { bg: [10, 10, 13], accent: [230, 214, 180], second: [120, 110, 140] }, motif: { windows: 0.4 },
      ora: 'Oltre il muro, una famiglia a tavola: una donna, un uomo, un bambino. Il bambino sei tu, in una vita che non è successa.',
      allora: '',
      exits: ['madre', 'citta_lontana', 'finestre', 'torre'] },

    // ——— I TETTI E L'EMPIREO
    { id: 'pensieri', name: 'Il silenzio dei pensieri', kind: 'stato', level: 2, x: 0.3, y: 0.3, terrain: 'tegole', modus: 'insen', hush: 1, peace: 40, lumina: 'soffuse',
      levels: { m_respiro: 0.1, m_carezza: 0.12, m_vento: 0.06 }, set: { lumen: 0.25, chorus: 0.1, velum: 0.4 }, libra: 0.95,
      pal: { bg: [9, 10, 13], accent: [210, 214, 230], second: [120, 126, 150] }, motif: { motes: 0.4, stars: 0.3 },
      ora: 'Nessun suono, tranne quello dei pensieri. Per una volta non fanno paura: passano, come nuvole.',
      allora: 'Credevi che il silenzio fosse vuoto. È pieno di te.',
      exits: ['tetti', 'pace', 'ultimo_piano'] },
    { id: 'pace', name: 'La pace', kind: 'stato', level: 3, x: 0.3, y: 0.75, terrain: 'nuvola', modus: 'pentatonico', hush: 1, peace: 90, lumina: 'soffuse',
      levels: { m_scacciapensieri: 0.3, m_carezza: 0.35, m_canto: 0.12, m_uccelli: 0.08, m_mare: 0.1 }, set: { lumen: 0.55, velum: 0.8, chorus: 0.35, aether: 0.85 }, libra: 0.98,
      pal: { bg: [14, 14, 16], accent: [236, 230, 214], second: [180, 190, 210] }, motif: { haze: 0.8, sun: 0.3, rose: 0.2 },
      ora: 'Non succede niente, e va tutto bene. Qualcosa ti accarezza piano, e il respiro trova da solo il suo ritmo.',
      allora: 'L’hai cercata tanto. Era qui, sotto tutto il rumore.',
      exits: ['pensieri', 'empireo', 'mare_stelle', 'risalita', 'giardino'] },

    // ——— IL SOTTOSUOLO
    { id: 'rabbia', name: 'La rabbia', kind: 'stato', level: -1, x: 0.4, y: 0.45, terrain: 'pietra', modus: 'insen', hush: 0, lumina: 'soffuse',
      levels: { m_cuore: 0.4, m_respiro: 0.3, m_tuono: 0.2 }, set: { calcinatio: 0.6, tempestas: 0.7, cinis: 0.6, crepitus: 0.55, lumen: 0.15 }, libra: 0.1, bpm: 0.7,
      pal: { bg: [16, 6, 4], accent: [230, 100, 60], second: [120, 40, 30] }, motif: { cracks: 1, fever: 0.3 },
      ora: 'Sei per terra, e sei arrabbiato con la vita. Per quello che ti ha tolto, per come te l’ha tolto, per quando.',
      allora: 'Hai urlato contro tutto. Il soffitto non ha risposto.',
      exits: ['risalita', 'urlare', 'dolore', 'vuoto'] },
    { id: 'incubo', name: 'L’incubo', kind: 'stato', level: -1, x: 0.2, y: 0.5, terrain: 'pietra', modus: 'insen', hush: 0.5, nightmare: 6, lumina: 'spente',
      levels: { m_sussurri: 0.3, m_cuore: 0.2, m_tubature: 0.2 }, set: { lumen: 0.15, distantia: 0.5 }, libra: 0.5, bpm: 0.6,
      pal: { bg: [6, 5, 8], accent: [190, 180, 214], second: [80, 70, 100] }, motif: { void: 0.4, whispers: 0.5 },
      ora: 'Ti svegli di colpo nel buio, con il cuore in gola. Eri sicuro di aver perso la persona che ami di più.',
      allora: 'Ti alzi a controllare che respiri. Respira. Torni a letto, ma non dormi più.',
      exits: ['letto', 'giudizio', 'buio', 'voci'] },
    { id: 'giudizio', name: 'Il giudizio', kind: 'stato', level: -1, x: 0.15, y: 0.15, terrain: 'legno', modus: 'eolio', hush: 0.4, lumina: 'candele',
      whisperWords: ['hai sbagliato', 'non ci hai ascoltato', 'non sei venuto', 'te l’avevamo detto', 'guarda cosa sei diventato', 'forse no', 'eri tu', 'va bene così'],
      levels: { m_sussurri: 0.5, m_voci: 0.15, m_pendolo: 0.3, m_candele: 0.2 }, set: { lumen: 0.2 }, libra: 0.55,
      pal: { bg: [10, 8, 7], accent: [220, 180, 130], second: [110, 80, 60] }, motif: { whispers: 1, candles: 0.4 },
      ora: 'Tornano quelli che ti hanno cresciuto. Si siedono intorno al tavolo ed elencano, uno per uno, gli errori che hai fatto da quando non ci sono più.',
      allora: 'Ma forse non hai sbagliato. Forse hai costruito la tua vita secondo le tue regole, non secondo le loro. Ti sei staccato da chi ti ha guidato. Si chiama crescere.',
      exits: ['incubo', 'colpa', 'trono', 'risalita'] },
    { id: 'vuoto', name: 'Il vuoto', kind: 'stato', level: -1, x: 0.6, y: 0.2, terrain: 'pietra', modus: 'insen', hush: 1, lumina: 'soffuse',
      levels: { m_pendolo: 0.2, m_acufene: 0.08 }, set: { lumen: 0.15, oblio: 0.5 }, libra: 0.92,
      pal: { bg: [8, 8, 9], accent: [196, 196, 204], second: [96, 96, 104] }, motif: { void: 0.8 },
      ora: 'Al posto di una persona, adesso, c’è una forma esatta di niente. Ci inciampi dieci volte al giorno.',
      allora: 'Ti dicono che col tempo passa. Non passa: impari a camminarci intorno.',
      exits: ['ultimo_respiro', 'funerale', 'stanza_vuota', 'pavimento', 'venticinque', 'rabbia'] }
  ];
  NEW.forEach(p => { ATH.PLACES.push(p); ATH.PLACE[p.id] = p; });

  const more = {
    letto: ['incubo'], casa: ['casa_vuota'], soffitta: ['ripostiglio'], cimitero: ['venticinque', 'madre'],
    treno_notte: [{ id: 'citta_lontana', linger: 35 }, 'macchinina'], ultimo_respiro: ['mano_nonno', 'vuoto'], funerale: ['vuoto'],
    tetti: ['pensieri'], empireo: ['pace'], giardino: ['pace'], finestre: ['vita_mai'], stanza_vuota: ['letto_nonni'],
    alba: ['risalita'], fotografie: ['madre'], dolore: ['rabbia'], urlare: ['rabbia']
  };
  Object.keys(more).forEach(id => { ATH.PLACE[id].exits = ATH.PLACE[id].exits.concat(more[id]); });

  // luoghi dove, restando, si scende lentamente nella pace
  const PEACE = { giardino: 60, neve: 80, ninna: 50, mare_stelle: 70, cappella: 70, alba: 60, primo_ricordo: 60, silenzio: 40, empireo: 80, oltre: 60, rinascita: 70, ultimo_piano: 70 };
  Object.keys(PEACE).forEach(id => { ATH.PLACE[id].peace = PEACE[id]; });
})(window.ATH);
