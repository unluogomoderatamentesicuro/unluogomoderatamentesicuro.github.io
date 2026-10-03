/* ATHANOR — MEMORIA (quinta parte): suoni che accarezzano. Campanelli a vento
   sotto un portico, una carezza di vetro, e i tubi di una casa vecchia.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const P = ATH.Memoria.prototype;
  Object.assign(ATH.MEM_CAL, { m_scacciapensieri: 1, m_carezza: 1, m_tubature: 1 });
  const b0 = P.buildPlus, a0 = P.applyPlus;

  P.buildPlus = function () {
    b0.call(this);
    const c = this.c, G = this.G;
    this.chimes = { next: 0 };
    // carezza: armoniche alte che salgono e scendono lentissime, come un dito su un bicchiere
    this.glass = [0, 1, 2, 3, 4].map(i => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 880;
      const g = G(0), p = c.createStereoPanner(); p.pan.value = [-0.6, 0.5, -0.2, 0.75, 0.1][i];
      o.connect(g); g.connect(p); p.connect(this.lv.m_carezza); o.start();
      return { o, g, ph: rnd(0, 6.28), sp: rnd(0.04, 0.09) };
    });
    { const s = this.src('pink'); const bp = this.filt('bandpass', 2600, 0.6); this.caressAir = G(0.04); this.chain([s, bp, this.caressAir, this.lv.m_carezza]); s.start(0, 2.2); }
    this.pipes2 = { next: 0 };
    // il fruscio dell'acqua nei tubi
    { const s = this.src('pink'); const bp = this.filt('bandpass', 700, 2); this.flowG = G(0); this.chain([s, bp, this.flowG, this.lv.m_tubature]); s.start(0, 1.1); this.flowT = 0; }
  };

  P.applyPlus = function (L, S, C, dt, root, scale, now, look) {
    a0.call(this, L, S, C, dt, root, scale, now, look);
    const t = this.t, T = (p, v, tau) => this.e.T(p, v, tau);
    let base = root; while (base < 500) base *= 2;

    // campanelli a vento: note della scala, a grappoli, quando il vento si alza
    if (L.m_scacciapensieri > 0.01 && now >= this.chimes.next) {
      const n = Math.random() < 0.4 ? Math.floor(rnd(2, 6)) : 1;
      for (let i = 0; i < n; i++) {
        const st = now + 0.03 + i * rnd(0.08, 0.3), f = base * ATH.ratioAt(scale, Math.floor(rnd(0, scale.length * 2))), pan = rnd(-0.8, 0.8);
        this.tone(this.lv.m_scacciapensieri, st, f, 'sine', 0.07, 0.002, 1.6, 7, pan);
        this.tone(this.lv.m_scacciapensieri, st, f * 2.76, 'sine', 0.018, 0.001, 0.5, 2.5, pan);
        if (Math.random() < 0.5) this.e.emit('mem', { kind: 'carillon', freq: f, pan, at: st });
      }
      this.chimes.next = now + rnd(1.5, 6) * (1.3 - L.m_scacciapensieri);
    }

    // carezza
    this.glass.forEach((v, i) => {
      const f = base * ATH.ratioAt(scale, [0, 2, 4, 5, 7][i]);
      T(v.o.frequency, f, 2);
      const sw = Math.pow(0.5 + 0.5 * Math.sin(t * v.sp + v.ph), 2);
      T(v.g.gain, 0.05 * sw, 0.4);
    });

    // tubature: colpi secchi, poi l'acqua che scorre
    if (L.m_tubature > 0.01 && now >= this.pipes2.next) {
      const n = Math.floor(rnd(1, 5)), pan = rnd(-0.6, 0.6);
      for (let i = 0; i < n; i++) {
        const st = now + 0.05 + i * rnd(0.12, 0.35);
        this.tone(this.lv.m_tubature, st, rnd(90, 160), 'sine', 0.35, 0.002, 0.05, 0.3, pan);
        this.tone(this.lv.m_tubature, st, rnd(600, 1200), 'triangle', 0.05, 0.001, 0.03, 0.2, pan);
      }
      if (Math.random() < 0.4) this.flowT = rnd(2, 6);
      this.pipes2.next = now + rnd(3, 12);
    }
    this.flowT = Math.max(0, this.flowT - dt);
    T(this.flowG.gain, this.flowT > 0 ? 0.25 : 0, 0.5);
  };
})(window.ATH);
