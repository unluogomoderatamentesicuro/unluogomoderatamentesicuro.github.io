/* ATHANOR — definizione dei parametri, dei sigilli e delle fasi dell'Opera.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const pct = v => String(Math.round(v * 99)).padStart(2, '0');
  const db = v => v < 0.02 ? '−∞ dB' : (40 * Math.log10(v * 1.05)).toFixed(1) + ' dB';
  const hz = f => f >= 1000 ? (f / 1000).toFixed(f >= 10000 ? 0 : 1) + ' kHz' : Math.round(f) + ' Hz';

  // Diapason: 'libero' scorre continuo; '440'/'432' si aggancia ai semitoni;
  // le frequenze del Solfeggio si aggancia a quella nota, spostata d'ottava.
  ATH.diapason = 'libero';
  ATH.rootHz = v => {
    const raw = 30 * Math.pow(2, v * 3);                 // 30–240 Hz
    const d = ATH.diapason;
    if (!d || d === 'libero') return raw;
    if (d === '440' || d === '432') { const ref = +d; return ref * Math.pow(2, Math.round(12 * Math.log2(raw / ref)) / 12); }
    const f = +d; return f / Math.pow(2, Math.round(Math.log2(f / raw)));
  };
  ATH.cutoffHz = v => 40 * Math.pow(2, v * 9);           // 40 Hz – 20 kHz
  ATH.delaySec = v => 0.03 * Math.pow(2, v * 7);         // 30 ms – 3.8 s

  ATH.TABS = [
    { id: 'fornax', num: 'I', name: 'Fornax', gloss: 'il rumore' },
    { id: 'quies', num: 'II', name: 'Quies', gloss: 'la quiete' },
    { id: 'memoria', num: 'III', name: 'Memoria', gloss: 'i ricordi' },
    { id: 'visio', num: 'IV', name: 'Visio', gloss: 'la visione' }
  ];

  // span = colonne su 12 (schermo largo), md = schermo medio
  ATH.GROUPS = [
    { id: 'materia', tab: 'fornax', num: 'I', name: 'Materia Prima', gloss: 'ciò che arde', span: 4, md: 12 },
    { id: 'operationes', tab: 'fornax', num: 'II', name: 'Operationes', gloss: 'ciò che la ferisce', span: 3, md: 6 },
    { id: 'vas', tab: 'fornax', num: 'III', name: 'Vas Hermetis', gloss: 'il vaso che la contiene', span: 3, md: 6 },
    { id: 'spiritus', tab: 'fornax', num: 'IV', name: 'Spiritus', gloss: 'ciò che la muove', span: 2, md: 12 },
    { id: 'sigilla', tab: 'fornax', num: 'V', name: 'Sigilla', gloss: 'ciò che si apre e si chiude', span: 12, md: 12, kind: 'seals' },

    { id: 'lumen', tab: 'quies', num: 'I', name: 'Velum Lucis', gloss: 'accordi lenti come luce dietro una tenda', span: 5, md: 12 },
    { id: 'patera', tab: 'quies', num: 'II', name: 'Paterae', gloss: 'coppe che cantano', span: 4, md: 6 },
    { id: 'somnus', tab: 'quies', num: 'III', name: 'Somnus', gloss: 'il respiro e il sonno', span: 3, md: 6 },
    { id: 'diapason', tab: 'quies', num: 'IV', name: 'Diapason', gloss: 'su che cosa è accordato il mondo', span: 12, md: 12, kind: 'choices',
      note: 'Le frequenze del Solfeggio, il La a 432 e i battimenti binaurali vengono dalle tradizioni della meditazione: qui sono colori del suono e modi di accordarlo, non cure. Il battimento binaurale si sente solo in cuffia.' },

    { id: 'ricordi', tab: 'memoria', num: 'I', name: 'Atlas', gloss: 'i luoghi trovati finora: toccane uno per andarci', span: 12, md: 12, kind: 'scenes' },
    { id: 'natura', tab: 'memoria', num: 'II', name: 'Natura', gloss: 'fuori', span: 6, md: 12 },
    { id: 'domus', tab: 'memoria', num: 'III', name: 'Domus', gloss: 'dentro casa', span: 6, md: 12 },
    { id: 'homines', tab: 'memoria', num: 'IV', name: 'Homines', gloss: 'gli altri', span: 5, md: 12 },
    { id: 'corpus', tab: 'memoria', num: 'V', name: 'Corpus', gloss: 'il tuo corpo', span: 3, md: 6 },
    { id: 'oblivio', tab: 'memoria', num: 'VI', name: 'Oblivio', gloss: 'come il ricordo si consuma', span: 4, md: 6, action: { id: 'newMemory', label: 'Nuovo ricordo', title: 'Inventa una nuova melodia per carillon e pianoforte' } },

    { id: 'oculus', tab: 'visio', num: 'I', name: 'Oculus', gloss: 'come guardi', span: 7, md: 12 },
    { id: 'lumina', tab: 'visio', num: 'III', name: 'Lumina', gloss: 'quanta luce c’è', span: 12, md: 12, kind: 'choices' },
    { id: 'figurae', tab: 'visio', num: 'II', name: 'Figurae', gloss: 'che cosa compare', span: 5, md: 12, kind: 'seals' }
  ];

  // drift = quanto Spiritus fa vagare il parametro da solo
  ATH.PARAMS = [
    { id: 'aurum', group: 'materia', name: 'Aurum', glyph: '☉', gloss: 'l’oro del bordone', def: 0.55, drift: 0.12, fmt: pct },
    { id: 'radix', group: 'materia', name: 'Radix', glyph: '♄', gloss: 'la radice, quanto è profondo', def: 0.32, drift: 0.02, fmt: v => hz(ATH.rootHz(v)) },
    { id: 'mercurius', group: 'materia', name: 'Mercurius', glyph: '☿', gloss: 'le voci che non stanno ferme', def: 0.3, drift: 0.3, fmt: v => Math.round(v * 48) + ' ct' },
    { id: 'sal', group: 'materia', name: 'Sal', glyph: '⊖', gloss: 'il corpo dell’onda', def: 0.35, drift: 0.25, fmt: pct },
    { id: 'sulphur', group: 'materia', name: 'Sulphur', glyph: '♃', gloss: 'il fuoco dentro la voce', def: 0.12, drift: 0.22, fmt: pct },
    { id: 'putrefactio', group: 'materia', name: 'Putrefactio', glyph: '⊗', gloss: 'il colore del marcio', def: 0.22, drift: 0.25, fmt: v => v < 0.33 ? 'bruno' : v < 0.66 ? 'rosa' : 'bianco' },
    { id: 'cinis', group: 'materia', name: 'Cinis', glyph: '∴', gloss: 'la cenere', def: 0.38, drift: 0.2, fmt: pct },
    { id: 'saturnus', group: 'materia', name: 'Saturnus', glyph: '♄', gloss: 'campane di piombo', def: 0.22, drift: 0.2, fmt: v => (v * v * 3).toFixed(1) + '/s' },

    { id: 'calcinatio', group: 'operationes', name: 'Calcinatio', glyph: '△', gloss: 'ridurre in polvere col fuoco', def: 0.25, drift: 0.18, fmt: v => '×' + Math.round(1 + v * v * 40) },
    { id: 'plumbum', group: 'operationes', name: 'Plumbum', glyph: '♁', gloss: 'appesantire il metallo', def: 0.08, drift: 0.15, fmt: v => Math.round(16 - v * 14) + ' bit' },
    { id: 'contritio', group: 'operationes', name: 'Contritio', glyph: '⁂', gloss: 'frantumare il tempo', def: 0.05, drift: 0.15, fmt: v => '÷' + Math.floor(1 + v * v * 48) },
    { id: 'plica', group: 'operationes', name: 'Plica', glyph: '∿', gloss: 'piegare l’onda su sé stessa', def: 0.14, drift: 0.25, fmt: pct },
    { id: 'crepitus', group: 'operationes', name: 'Crepitus', glyph: '⁘', gloss: 'lo scoppiettio', def: 0.3, drift: 0.25, fmt: pct },
    { id: 'coniunctio', group: 'operationes', name: 'Coniunctio', glyph: '☌', gloss: 'le nozze chimiche', def: 0.1, drift: 0.25, fmt: pct },

    { id: 'solutio', group: 'vas', name: 'Solutio', glyph: '▽', gloss: 'sciogliere, aprire', def: 0.5, drift: 0.22, fmt: v => hz(ATH.cutoffHz(v)) },
    { id: 'draco', group: 'vas', name: 'Vox Draconis', glyph: '☊', gloss: 'la voce del drago', def: 0.28, drift: 0.2, fmt: v => 'Q ' + (0.5 + v * v * 22).toFixed(1) },
    { id: 'ouroboros', group: 'vas', name: 'Ouroboros', glyph: '◯', gloss: 'il serpente che si morde la coda', def: 0.42, drift: 0.15, fmt: pct },
    { id: 'tempus', group: 'vas', name: 'Tempus', glyph: '⧗', gloss: 'quanto tarda l’eco', def: 0.5, drift: 0.08, fmt: v => { const s = ATH.delaySec(v); return s < 1 ? Math.round(s * 1000) + ' ms' : s.toFixed(2) + ' s'; } },
    { id: 'crypta', group: 'vas', name: 'Crypta', glyph: '⌂', gloss: 'la cripta sotto il forno', def: 0.5, drift: 0.12, fmt: v => (2 + v * 9).toFixed(1) + ' s' },
    { id: 'sublimatio', group: 'vas', name: 'Sublimatio', glyph: '▲', gloss: 'salire senza passare dal liquido', def: 0.24, drift: 0.2, fmt: pct },

    { id: 'spiritus', group: 'spiritus', name: 'Spiritus', glyph: '≋', gloss: 'il soffio che muove tutto da sé', def: 0.45, drift: 0, fmt: pct },
    { id: 'anima', group: 'spiritus', name: 'Anima Mundi', glyph: '⊛', gloss: 'il respiro lento del mondo', def: 0.3, drift: 0.1, fmt: v => (0.01 + v * v * 0.6).toFixed(2) + ' Hz' },
    { id: 'tempestas', group: 'spiritus', name: 'Tempestas', glyph: 'ϟ', gloss: 'il caos, la tempesta', def: 0.2, drift: 0.1, fmt: pct },
    { id: 'lux', group: 'spiritus', name: 'Lux', glyph: '☼', gloss: 'quanta luce esce dal forno', def: 0.72, drift: 0, fmt: db },

    { id: 'lumen', group: 'lumen', name: 'Lumen', glyph: '✧', gloss: 'quanto è presente il velo di luce', def: 0.45, drift: 0.08, fmt: pct },
    { id: 'velum', group: 'lumen', name: 'Velum', glyph: '◌', gloss: 'quanto è chiaro il velo', def: 0.38, drift: 0.2, fmt: v => hz(300 + v * v * 6000) },
    { id: 'halitus', group: 'lumen', name: 'Halitus', glyph: '≈', gloss: 'il fiato tra le voci, come un coro', def: 0.35, drift: 0.15, fmt: v => Math.round(v * 16) + ' ct' },
    { id: 'aurora', group: 'lumen', name: 'Aurora', glyph: '⌒', gloss: 'ogni quanto cambia l’accordo', def: 0.4, drift: 0.1, fmt: v => Math.round(40 - v * 34) + ' s' },
    { id: 'aether', group: 'lumen', name: 'Aether', glyph: '○', gloss: 'l’alone che si allarga nel cielo', def: 0.55, drift: 0.1, fmt: pct },
    { id: 'chorus', group: 'lumen', name: 'Chorus', glyph: '⁑', gloss: 'voci acute come bambini lontani', def: 0.15, drift: 0.12, fmt: pct },

    { id: 'patera', group: 'patera', name: 'Patera', glyph: '◡', gloss: 'quante volte si colpiscono le coppe', def: 0.28, drift: 0.1, fmt: v => (v * v * 15).toFixed(1) + '/min' },
    { id: 'resonantia', group: 'patera', name: 'Resonantia', glyph: '◎', gloss: 'quanto a lungo vibra la coppa', def: 0.6, drift: 0.05, fmt: v => Math.round(6 + v * 22) + ' s' },
    { id: 'cantus', group: 'patera', name: 'Cantus', glyph: '∞', gloss: 'la coppa strofinata che canta senza fine', def: 0.1, drift: 0.1, fmt: pct },
    { id: 'altitudo', group: 'patera', name: 'Altitudo', glyph: '⇡', gloss: 'piccole coppe acute o grandi coppe gravi', def: 0.45, drift: 0.05, fmt: v => ['grave', 'media', 'acuta'][Math.min(2, Math.floor(v * 3))] },

    { id: 'silentium', group: 'somnus', name: 'Silentium', glyph: '∅', gloss: 'la fornace tace: restano i suoni leggeri', def: 0, drift: 0, fmt: pct },
    { id: 'somnus', group: 'somnus', name: 'Somnus', glyph: '☾', gloss: 'il battimento binaurale (solo in cuffia)', def: 0, drift: 0, fmt: pct },
    { id: 'respiratio', group: 'somnus', name: 'Respiratio', glyph: '◯', gloss: 'quanti respiri al minuto guida il suono', def: 0.5, drift: 0, fmt: v => (4 + v * 4).toFixed(1) + '/min' },
    { id: 'profunditas', group: 'somnus', name: 'Profunditas', glyph: '⌄', gloss: 'quanto il suono si gonfia e si svuota col respiro', def: 0.5, drift: 0, fmt: pct },

    { id: 'm_grilli', group: 'natura', name: 'Grilli', glyph: '⁖', gloss: 'i grilli nell’erba, la sera', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_cicale', group: 'natura', name: 'Cicale', glyph: '⋯', gloss: 'le cicale nel caldo del pomeriggio', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_uccelli', group: 'natura', name: 'Uccelli', glyph: '⌵', gloss: 'uccelli tra i rami', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_gabbiani', group: 'natura', name: 'Gabbiani', glyph: '⏜', gloss: 'gabbiani sopra il mare', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_mare', group: 'natura', name: 'Mare', glyph: '∽', gloss: 'le onde sulla riva', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_pioggia', group: 'natura', name: 'Pioggia', glyph: '⋮', gloss: 'la pioggia sul tetto e sui vetri', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_vento', group: 'natura', name: 'Vento', glyph: '⌇', gloss: 'il vento tra gli ulivi e nelle fessure', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_goccia', group: 'natura', name: 'Gocce', glyph: '◦', gloss: 'gocce che cadono in una stanza vuota', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_bolle', group: 'natura', name: 'Bolle', glyph: '∘', gloss: 'sott’acqua', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_tuono', group: 'natura', name: 'Tuono', glyph: 'ϟ', gloss: 'un temporale lontano', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_carillon', group: 'domus', name: 'Carillon', glyph: '✦', gloss: 'il carillon della cameretta', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_piano', group: 'domus', name: 'Pianoforte', glyph: '♩', gloss: 'un pianoforte in un’altra stanza', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_camino', group: 'domus', name: 'Camino', glyph: '✺', gloss: 'la legna che brucia', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_grammofono', group: 'domus', name: 'Grammofono', glyph: '◉', gloss: 'un disco che gira a vuoto', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_pendolo', group: 'domus', name: 'Pendolo', glyph: '◷', gloss: 'l’orologio a pendolo', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_scricchiolio', group: 'domus', name: 'Scricchiolii', glyph: '≀', gloss: 'il legno vecchio che cede', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_telefono', group: 'domus', name: 'Telefono', glyph: '☏', gloss: 'un telefono che squilla in un altro appartamento', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_radio', group: 'domus', name: 'Radio', glyph: '⌁', gloss: 'una radio che cerca una stazione', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_ronzio', group: 'domus', name: 'Ronzio', glyph: '≡', gloss: 'il ronzio di una lampada al neon', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_fruscio', group: 'domus', name: 'Fruscii', glyph: '≋', gloss: 'stoffa, carta, lenzuola, foglie', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_candele', group: 'domus', name: 'Candele', glyph: 'ı', gloss: 'fiammelle che respirano', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_organo', group: 'domus', name: 'Organo', glyph: '⌂', gloss: 'un organo in una chiesa vuota', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_stoviglie', group: 'domus', name: 'Stoviglie', glyph: '◡', gloss: 'piatti, bicchieri, una cucina di un’altra epoca', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_voci', group: 'homines', name: 'Voci lontane', glyph: '❝', gloss: 'voci di cortile, senza parole', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_bambini', group: 'homines', name: 'Bambini', glyph: '☺', gloss: 'bambini che giocano e ridono', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_passi', group: 'homines', name: 'Passi', glyph: '⁚', gloss: 'passi di qualcuno che passa, o i tuoi', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_campane', group: 'homines', name: 'Campanile', glyph: '∩', gloss: 'le campane del paese, da lontano', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_festa', group: 'homines', name: 'Festa di là', glyph: '♫', gloss: 'una festa oltre il muro', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_treno', group: 'homines', name: 'Treno', glyph: '═', gloss: 'un treno che passa lontano', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_canto', group: 'homines', name: 'Canto', glyph: '♪', gloss: 'una voce che canticchia il ricordo', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_sussurri', group: 'homines', name: 'Sussurri', glyph: '❞', gloss: 'voci di notte, voci nella testa', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_cani', group: 'homines', name: 'Cani', glyph: '⌒', gloss: 'cani che abbaiano lontano', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_cuore', group: 'corpus', name: 'Cuore', glyph: '♡', gloss: 'il tuo cuore', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_respiro', group: 'corpus', name: 'Respiro', glyph: '≈', gloss: 'il respiro di qualcuno nella stanza', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_acufene', group: 'corpus', name: 'Acufene', glyph: 'ı', gloss: 'il fischio nelle orecchie', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_monitor', group: 'corpus', name: 'Monitor', glyph: '⌇', gloss: 'il monitor accanto al letto', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_pianto', group: 'corpus', name: 'Pianto', glyph: '◟', gloss: 'un pianto soffocato dietro una porta', def: 0, drift: 0.05, fmt: pct },
    { id: 'm_vagito', group: 'corpus', name: 'Vagito', glyph: '◠', gloss: 'il primo pianto di qualcuno appena nato', def: 0, drift: 0.05, fmt: pct },
    { id: 'pulsus', group: 'corpus', name: 'Pulsus', glyph: '⌁', gloss: 'quanto batte forte il cuore', def: 0.25, drift: 0.03, fmt: v => Math.round(48 + v * 80) + ' bpm' },

    { id: 'memoria', group: 'oblivio', name: 'Memoria', glyph: '◈', gloss: 'quanto forte torna il ricordo', def: 0.7, drift: 0, fmt: db },
    { id: 'oblio', group: 'oblivio', name: 'Oblio', glyph: '⊘', gloss: 'il ricordo sbiadisce, perde pezzi e cambia note', def: 0.15, drift: 0.1, fmt: pct },
    { id: 'nastro', group: 'oblivio', name: 'Nastro', glyph: '⊷', gloss: 'il nastro stanco: oscilla e trascina', def: 0.25, drift: 0.1, fmt: pct },
    { id: 'distantia', group: 'oblivio', name: 'Distantia', glyph: '∘', gloss: 'quanto è lontano', def: 0.4, drift: 0.08, fmt: pct },
    { id: 'metamorphosis', group: 'oblivio', name: 'Metamorphosis', glyph: '⟳', gloss: 'il ricordo entra nella fornace e si trasforma', def: 0, drift: 0.08, fmt: pct },

    { id: 'somnium', group: 'oculus', name: 'Somnium', glyph: '◍', gloss: 'quanto è sognante l’immagine', def: 0.55, drift: 0.1, fmt: pct },
    { id: 'vestigium', group: 'oculus', name: 'Vestigium', glyph: '⋰', gloss: 'quanto restano le tracce', def: 0.5, drift: 0.05, fmt: pct },
    { id: 'velocitas', group: 'oculus', name: 'Velocitas', glyph: '⇝', gloss: 'quanto corre l’immagine', def: 0.5, drift: 0.05, fmt: pct },
    { id: 'claritas', group: 'oculus', name: 'Claritas', glyph: '☀', gloss: 'quanta luce', def: 0.5, drift: 0, fmt: pct },
    { id: 'color', group: 'oculus', name: 'Color', glyph: '◐', gloss: 'quanto è saturo il colore', def: 0.5, drift: 0, fmt: pct },
    { id: 'granum', group: 'oculus', name: 'Granum', glyph: '⁙', gloss: 'la grana della pellicola', def: 0.35, drift: 0, fmt: pct }
  ];

  ATH.SWITCHES = [
    { id: 'solve', group: 'sigilla', name: 'Solve', glyph: '⊻', gloss: 'solve et coagula: il filtro diventa una gola stretta', def: false },
    { id: 'luna', group: 'sigilla', name: 'Luna', glyph: '☽', gloss: 'le voci prendono intervalli scuri', def: false },
    { id: 'quinta', group: 'sigilla', name: 'Quinta Essentia', glyph: '✶', gloss: 'una quinta voce entra nel vaso', def: true },
    { id: 'crepusculum', group: 'sigilla', name: 'Crepusculum', glyph: '◐', gloss: 'una voce un’ottava sotto', def: false },
    { id: 'ignis', group: 'sigilla', name: 'Ignis', glyph: '△', gloss: 'il fuoco della calcinazione', def: true },
    { id: 'mortificatio', group: 'sigilla', name: 'Mortificatio', glyph: '✝', gloss: 'il suono muore e rinasce a scatti', def: false },
    { id: 'retro', group: 'sigilla', name: 'Retrogradatio', glyph: '♇', gloss: 'l’eco perde il passo', def: false },
    { id: 'vas', group: 'sigilla', name: 'Vas Clausum', glyph: '⊕', gloss: 'il vaso si chiude: l’eco resta prigioniera', def: false },
    { id: 'fulmen', group: 'sigilla', name: 'Fulmen', glyph: 'ϟ', gloss: 'i fulmini cadono da soli', def: true },
    { id: 'lapis', group: 'sigilla', name: 'Lapis', glyph: '◆', gloss: 'la pietra: tutto smette di vagare', def: false },
    { id: 'rota', group: 'sigilla', name: 'Rota', glyph: '☸', gloss: 'la ruota delle fasi gira', def: true },

    { id: 'spira', group: 'somnus', name: 'Spira', glyph: '◯', gloss: 'il suono respira lentamente e ti guida', def: false },
    { id: 'stasis', group: 'lumen', name: 'Stasis', glyph: '═', gloss: 'l’accordo resta fermo', def: false },
    { id: 'mutatio', group: 'oblivio', name: 'Vaga', glyph: '⟲', gloss: 'cammini da solo da un luogo all’altro', def: false },
    { id: 'fixa', group: 'oblivio', name: 'Memoria fixa', glyph: '⊡', gloss: 'la melodia del ricordo non cambia mai', def: false },

    { id: 'tinta', group: 'figurae', name: 'Tinta sonora', glyph: '◑', gloss: 'i colori seguono il suono', def: true },
    { id: 'crucibulum', group: 'figurae', name: 'Crucibulum', glyph: '◎', gloss: 'il crogiolo al centro', def: true },
    { id: 'imagines', group: 'figurae', name: 'Imagines', glyph: '❋', gloss: 'le figure dei ricordi: lucciole, onde, pioggia, braci', def: true },
    { id: 'constellatio', group: 'figurae', name: 'Constellatio', glyph: '✧', gloss: 'le note del carillon si uniscono in costellazioni', def: true },
    { id: 'velamen', group: 'figurae', name: 'Velamen', glyph: '◍', gloss: 'aurore e luci sfocate quando c’è quiete', def: true },
    { id: 'verba', group: 'figurae', name: 'Verba', glyph: '❡', gloss: 'le parole dei luoghi', def: true }
  ];

  ATH.CHOICES = [
    { id: 'diapason', group: 'diapason', name: 'Accordatura', def: 'libero', options: [
      { v: 'libero', label: 'Libera' }, { v: '440', label: 'La 440' }, { v: '432', label: 'La 432' },
      { v: '396', label: '396' }, { v: '417', label: '417' }, { v: '528', label: '528' },
      { v: '639', label: '639' }, { v: '741', label: '741' }, { v: '852', label: '852' }] },
    { id: 'modus', group: 'diapason', name: 'Modo', def: 'pentatonico', options: [
      { v: 'pentatonico', label: 'Pentatonico' }, { v: 'ionio', label: 'Ionio' }, { v: 'dorico', label: 'Dorico' },
      { v: 'lidio', label: 'Lidio' }, { v: 'eolio', label: 'Eolio' }, { v: 'hirajoshi', label: 'Hirajōshi' },
      { v: 'insen', label: 'In-sen' }, { v: 'armonici', label: 'Armonici' }] },
    { id: 'unda', group: 'diapason', name: 'Onda del sonno', def: 'theta', options: [
      { v: 'delta', label: 'δ 2 Hz' }, { v: 'theta', label: 'θ 6 Hz' }, { v: 'schumann', label: '7,83 Hz' },
      { v: 'alpha', label: 'α 10 Hz' }, { v: 'gamma', label: 'γ 40 Hz' }] },
    { id: 'lumina', group: 'lumina', name: 'Luci', def: 'luogo', options: [
      { v: 'luogo', label: 'Come il luogo' }, { v: 'accese', label: 'Accese' }, { v: 'soffuse', label: 'Soffuse' },
      { v: 'candele', label: 'Candele' }, { v: 'torcia', label: 'Una sola luce' }, { v: 'spente', label: 'Spente' }] }
  ];
  ATH.UNDA = { delta: 2, theta: 6, schumann: 7.83, alpha: 10, gamma: 40 };

  // scale come rapporti dentro l'ottava
  const et = a => a.map(n => Math.pow(2, n / 12));
  ATH.SCALES = {
    pentatonico: et([0, 2, 4, 7, 9]),
    ionio: et([0, 2, 4, 5, 7, 9, 11]),
    dorico: et([0, 2, 3, 5, 7, 9, 10]),
    lidio: et([0, 2, 4, 6, 7, 9, 11]),
    eolio: et([0, 2, 3, 5, 7, 8, 10]),
    hirajoshi: et([0, 2, 3, 7, 8]),
    insen: et([0, 1, 5, 7, 10]),
    armonici: [1, 9 / 8, 5 / 4, 11 / 8, 3 / 2, 13 / 8, 7 / 4]
  };
  ATH.ratioAt = (scale, idx) => {
    const n = scale.length, o = Math.floor(idx / n), i = ((idx % n) + n) % n;
    return scale[i] * Math.pow(2, o);
  };

  ATH.QUIES_PAL = { bg: [10, 11, 17], accent: [196, 200, 238], second: [128, 116, 178] };

  ATH.MEM_IDS = ATH.PARAMS.filter(p => p.id.indexOf('m_') === 0).map(p => p.id);

  // Le quattro fasi dell'Opera. Ogni fase spinge alcuni parametri e cambia la luce.
  ATH.PHASES = [
    {
      id: 'nigredo', name: 'Nigredo', glyph: '♄', gloss: 'l’opera al nero',
      bg: [11, 9, 8], accent: [184, 152, 112], second: [96, 72, 58],
      bias: { cinis: 0.14, putrefactio: -0.25, solutio: -0.14, crypta: 0.12, sal: 0.08, saturnus: -0.08, sublimatio: -0.1, velum: -0.12, distantia: 0.1 }
    },
    {
      id: 'albedo', name: 'Albedo', glyph: '☽', gloss: 'l’opera al bianco',
      bg: [13, 15, 17], accent: [214, 224, 230], second: [118, 140, 152],
      bias: { putrefactio: 0.32, sublimatio: 0.26, calcinatio: -0.18, solutio: 0.1, sal: -0.15, crepitus: 0.08, ouroboros: 0.08, aether: 0.15, velum: 0.12, chorus: 0.1 }
    },
    {
      id: 'citrinitas', name: 'Citrinitas', glyph: '☿', gloss: 'l’opera al giallo',
      bg: [16, 13, 6], accent: [236, 192, 52], second: [176, 104, 28],
      bias: { saturnus: 0.34, coniunctio: 0.2, sulphur: 0.16, mercurius: 0.12, draco: 0.1, cinis: -0.1, patera: 0.15, altitudo: 0.1 }
    },
    {
      id: 'rubedo', name: 'Rubedo', glyph: '☉', gloss: 'l’opera al rosso',
      bg: [19, 6, 6], accent: [222, 62, 36], second: [124, 22, 40],
      bias: { calcinatio: 0.3, plica: 0.18, ouroboros: 0.14, draco: 0.15, contritio: 0.06, plumbum: 0.08, tempestas: 0.12, nastro: 0.12, oblio: 0.1 }
    }
  ];
})(window.ATH);
