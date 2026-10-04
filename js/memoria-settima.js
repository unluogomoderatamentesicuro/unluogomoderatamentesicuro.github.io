/* ATHANOR — MEMORIA (settima parte): il ruscello tra i sassi, le foglie che si
   muovono, i campanacci di un pascolo, il ghiaccio del lago che canta quando
   si incrina, una voce lontana che chiama qualcuno nella notte.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const P = ATH.Memoria.prototype;
  Object.assign(ATH.MEM_CAL, { m_ruscello: 1.0, m_foglie: 0.45, m_campanacci: 1.0, m_ghiaccio: 1.4, m_richiamo: 1.1 });
  const b0 = P.buildPlus, a0 = P.applyPlus;

  P.buildPlus = function () {
    b0.call(this);
    const c = this.c, G = this.G;
    // ruscello: due correnti d'acqua che si rincorrono
    this.brook = [[1900, 1.1, 0.0], [650, 0.9, 1.3], [3600, 1.4, 2.2]].map(([f, q, off]) => {
      const s = this.src('pink'); const bp = this.filt('bandpass', f, q); const g = G(0);
      this.chain([s, bp, g, this.lv.m_ruscello]); s.start(0, off); return { g, bp, f, ph: rnd(0, 6) };
    });
    this.brookB = { next: 0 };
    // foglie: un fruscio alto che va e viene col vento
    { const s = this.src('white'); const hp = this.filt('highpass', 1400, 0.6), bp = this.filt('lowpass', 6500, 0.5);
      this.leafG = G(0); this.chain([s, hp, bp, this.leafG, this.lv.m_foglie]); s.start(0, 0.4); }
    this.leaf = { next: 0 };
    this.bells = { next: 0, herd: [rnd(560, 640), rnd(700, 780), rnd(880, 960), rnd(470, 520)] };
    this.ice = { next: 4 };
    this.call = { next: 6 };
  };

  P.applyPlus = function (L, S, C, dt, root, scale, now, look) {
    a0.call(this, L, S, C, dt, root, scale, now, look);
    const t = this.t, T = (p, v, tau) => this.e.T(p, v, tau);

    // —— ruscello
    if (L.m_ruscello > 0.01) {
      this.brook.forEach((b, i) => {
        const m = 0.55 + 0.25 * Math.sin(t * (1.7 + i * 0.9) + b.ph) + 0.2 * Math.sin(t * (4.3 + i * 1.3) + b.ph * 2);
        T(b.g.gain, (i === 1 ? 0.35 : 0.22) * m, 0.06);
        T(b.bp.frequency, b.f * (1 + 0.12 * Math.sin(t * (0.7 + i * 0.4) + b.ph)), 0.2);
      });
      if (now >= this.brookB.next) {
        const n = Math.floor(rnd(1, 4)), pan = rnd(-0.6, 0.6);
        for (let i = 0; i < n; i++) { const f = rnd(500, 1500), st = now + 0.03 + i * rnd(0.05, 0.15); this.glide(this.lv.m_ruscello, st, f, f * rnd(1.4, 2.2), 'sine', 0.05, 0.004, rnd(0.03, 0.07), pan); }
        this.brookB.next = now + rnd(0.15, 0.8);
      }
    } else this.brook.forEach(b => T(b.g.gain, 0, 0.3));

    // —— foglie
    if (L.m_foglie > 0.01) {
      const gust = Math.pow(0.5 + 0.5 * Math.sin(t * 0.23) * Math.sin(t * 0.071 + 1), 1.5);
      T(this.leafG.gain, 0.06 + gust * 0.28, 0.4);
      if (now >= this.leaf.next) {
        const n = Math.floor(rnd(3, 9)), pan = rnd(-0.8, 0.8);
        for (let i = 0; i < n; i++) this.burst(this.lv.m_foglie, now + 0.03 + i * rnd(0.01, 0.05), rnd(0.02, 0.06), rnd(0.05, 0.16) * (0.5 + gust), rnd(2500, 6000), pan + rnd(-0.1, 0.1));
        this.leaf.next = now + rnd(0.3, 2.2);
      }
    } else T(this.leafG.gain, 0, 0.4);

    // —— campanacci: la mandria si muove, ogni bestia col suo suono
    if (L.m_campanacci > 0.01 && now >= this.bells.next) {
      const herd = this.bells.herd, k = Math.floor(rnd(0, herd.length)), f = herd[k], pan = [-0.7, -0.2, 0.3, 0.75][k];
      const n = Math.floor(rnd(1, 4));
      for (let i = 0; i < n; i++) {
        const st = now + 0.04 + i * rnd(0.18, 0.4), a = rnd(0.5, 1);
        [1, 1.48, 2.37, 3.1].forEach((r, j) => this.tone(this.lv.m_campanacci, st, f * r, j ? 'sine' : 'triangle', [0.05, 0.03, 0.02, 0.012][j] * a, 0.002, [0.4, 0.25, 0.15, 0.08][j], 1.6, pan));
        this.burst(this.lv.m_campanacci, st, 0.01, 0.06 * a, 3000, pan);
      }
      this.bells.next = now + rnd(0.6, 3.5) * (1.3 - L.m_campanacci * 0.6);
    }

    // —— il ghiaccio che si incrina: un canto che scende veloce, poi il rimbombo
    if (L.m_ghiaccio > 0.01 && now >= this.ice.next) {
      const st = now + 0.03, pan = rnd(-0.7, 0.7);
      for (let i = 0; i < 3; i++) this.glide(this.lv.m_ghiaccio, st + i * 0.06, rnd(2500, 4200), rnd(220, 420), 'sine', 0.06 / (i + 1), 0.002, rnd(0.25, 0.5), pan);
      this.tone(this.lv.m_ghiaccio, st + 0.02, rnd(45, 70), 'sine', 0.25, 0.01, 0.4, 1.5, pan * 0.5);
      this.burst(this.lv.m_ghiaccio, st, 0.03, 0.12, 1800, pan);
      this.ice.next = now + rnd(5, 20) * (1.4 - L.m_ghiaccio * 0.6);
    }

    // —— una voce lontana che chiama: due sillabe, la seconda che scende
    if (L.m_richiamo > 0.01 && now >= this.call.next) {
      const c = this.c, st = now + 0.05, f0 = rnd(200, 300), pan = rnd(-0.8, 0.8);
      const o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0, st); o.frequency.linearRampToValueAtTime(f0 * 1.06, st + 0.5); o.frequency.setValueAtTime(f0 * 1.12, st + 0.75); o.frequency.exponentialRampToValueAtTime(f0 * 0.82, st + 1.8);
      const vib = c.createOscillator(), vg = this.G(f0 * 0.012); vib.frequency.value = 5.2; vib.connect(vg); vg.connect(o.frequency);
      const g = this.G(0), f1 = this.filt('bandpass', 650, 5), f2 = this.filt('bandpass', 1050, 6), mix = this.G(1), p = c.createStereoPanner(); p.pan.value = pan;
      g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(0.11, st + 0.12); g.gain.linearRampToValueAtTime(0.07, st + 0.6); g.gain.linearRampToValueAtTime(0.02, st + 0.72);
      g.gain.linearRampToValueAtTime(0.1, st + 0.85); g.gain.setTargetAtTime(0, st + 1.5, 0.25);
      o.connect(g); g.connect(f1); g.connect(f2); f1.connect(mix); f2.connect(mix); mix.connect(p); p.connect(this.lv.m_richiamo);
      o.start(st); vib.start(st); o.stop(st + 3); vib.stop(st + 3);
      o.onended = () => { try { g.disconnect(); mix.disconnect(); p.disconnect(); } catch (e) { } };
      this.call.next = now + rnd(14, 40);
    }
  };
})(window.ATH);
