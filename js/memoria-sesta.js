/* ATHANOR — MEMORIA (sesta parte): le vetrate che tremano nella pioggia, le
   rane della palude, la civetta, il canto del mare profondo, il proiettore di
   uno studio chiuso, i giochi elettronici, le macchine di una fabbrica, un'auto
   nella nebbia, l'altalena che cigola da sola.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const P = ATH.Memoria.prototype;
  Object.assign(ATH.MEM_CAL, { m_vetrate: 1.1, m_rane: 0.9, m_civetta: 0.9, m_balena: 0.35, m_proiettore: 1.0, m_arcade: 0.8, m_macchine: 0.6, m_motore: 0.95, m_altalena: 1.2 });
  const b0 = P.buildPlus, a0 = P.applyPlus;

  P.buildPlus = function () {
    b0.call(this);
    const c = this.c, G = this.G;
    // —— vetrate: il vento che preme sui vetri, la pioggia che li batte
    { const s = this.src('pink'); const bp = this.filt('bandpass', 420, 0.9); this.glassWind = G(0); this.chain([s, bp, this.glassWind, this.lv.m_vetrate]); s.start(0, 0.7); }
    { const s = this.src('white'); const hp = this.filt('highpass', 3200, 0.7); this.glassRain = G(0.05); this.chain([s, hp, this.glassRain, this.lv.m_vetrate]); s.start(0, 1.9); }
    this.vetr = { next: 0, gust: 0 };
    // —— rane, civetta
    this.frogs = { next: 0 }; this.owl = { next: 0 };
    // —— il mare profondo: un canto lento che sale e scende
    { const o = c.createOscillator(), o2 = c.createOscillator(); o.type = 'triangle'; o2.type = 'sine';
      const lp = this.filt('lowpass', 500, 2); this.whaleG = G(0); this.whaleO = o; this.whaleO2 = o2;
      o.frequency.value = 90; o2.frequency.value = 180; const g2 = G(0.3);
      o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(this.whaleG); this.whaleG.connect(this.lv.m_balena); o.start(); o2.start(); }
    { const s = this.src('brown'); const lp = this.filt('lowpass', 160, 0.7); this.deepG = G(0.25); this.chain([s, lp, this.deepG, this.lv.m_balena]); s.start(0, 3.1); }
    this.whale = { next: 0, until: 0 };
    // —— proiettore: lo scatto della pellicola, ventiquattro volte al secondo
    { const s = this.src('white'); const bp = this.filt('bandpass', 2600, 1.4); const gate = G(0);
      const lfo = c.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 24; const lg = G(0.5);
      lfo.connect(lg); lg.connect(gate.gain); lfo.start(); this.projClick = G(0.22);
      this.chain([s, bp, gate, this.projClick, this.lv.m_proiettore]); s.start(0, 0.3); this.projLfo = lfo; }
    { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 50; const lp = this.filt('lowpass', 180, 1); this.projHum = G(0.05); this.chain([o, lp, this.projHum, this.lv.m_proiettore]); o.start(); }
    this.proj = { next: 0 };
    // —— la sala giochi
    this.arc = { next: 0 };
    // —— la fabbrica: un rombo di fondo, i colpi della pressa
    { const s = this.src('brown'); const lp = this.filt('lowpass', 220, 1.2); this.facG = G(0.35); this.chain([s, lp, this.facG, this.lv.m_macchine]); s.start(0, 4.2); }
    this.fac = { next: 0, steam: 0 };
    // —— l'auto nella nebbia
    { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 45; const s = this.src('pink');
      const lp = this.filt('lowpass', 300, 1.5); const ng = G(0.5); this.carG = G(0); this.carPan = c.createStereoPanner();
      o.connect(lp); s.connect(ng); ng.connect(lp); lp.connect(this.carG); this.carG.connect(this.carPan); this.carPan.connect(this.lv.m_motore);
      o.start(); s.start(0, 2.6); this.carO = o; this.carLP = lp; }
    this.car = { next: 4, t: -1, dur: 8, dir: 1 };
    // —— l'altalena
    this.swingS = { next: 0, side: 0, amp: 1 };
  };

  // un tono con la frequenza che scivola
  P.glide = function (dest, t, f0, f1, type, amp, att, dur, pan) {
    const c = this.c, o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = this.G(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + att); g.gain.setTargetAtTime(0, t + dur * 0.6, dur * 0.2);
    const p = c.createStereoPanner(); p.pan.value = pan || 0;
    o.connect(g); g.connect(p); p.connect(dest); o.start(t); o.stop(t + dur * 1.6 + 0.1);
    o.onended = () => { try { g.disconnect(); p.disconnect(); } catch (e) { } };
  };

  P.applyPlus = function (L, S, C, dt, root, scale, now, look) {
    a0.call(this, L, S, C, dt, root, scale, now, look);
    const t = this.t, T = (p, v, tau) => this.e.T(p, v, tau);

    // —— vetrate: raffiche, e i vetri piombati che battono nel telaio
    if (L.m_vetrate > 0.01) {
      const v = this.vetr;
      v.gust = Math.max(0, v.gust - dt * 0.35);
      if (now >= v.next) {
        v.gust = rnd(0.5, 1); v.next = now + rnd(2.5, 9) * (1.25 - L.m_vetrate * 0.5);
        const n = Math.floor(rnd(4, 14) * v.gust), pan = rnd(-0.7, 0.7);
        for (let i = 0; i < n; i++) {
          const st = now + 0.05 + i * rnd(0.03, 0.11) + (i > n / 2 ? rnd(0.1, 0.4) : 0), a = v.gust * rnd(0.3, 1);
          this.burst(this.lv.m_vetrate, st, rnd(0.01, 0.03), 0.35 * a, rnd(1500, 3500), pan + rnd(-0.15, 0.15));
          if (Math.random() < 0.35) this.tone(this.lv.m_vetrate, st, rnd(2200, 4200), 'triangle', 0.035 * a, 0.001, 0.05, 0.3, pan);
          if (Math.random() < 0.2) this.tone(this.lv.m_vetrate, st, rnd(70, 110), 'sine', 0.25 * a, 0.002, 0.04, 0.25, pan);
        }
      }
      T(this.glassWind.gain, 0.12 + v.gust * 0.5, 0.4);
    } else T(this.glassWind.gain, 0, 0.5);

    // —— rane: un coro a impulsi, ognuna col suo passo
    if (L.m_rane > 0.01 && now >= this.frogs.next) {
      const voices = 1 + Math.floor(Math.random() * 3);
      for (let v = 0; v < voices; v++) {
        const f = rnd(260, 520) * (Math.random() < 0.2 ? 0.35 : 1), pulses = Math.floor(rnd(5, 16)), rate = rnd(16, 32), pan = rnd(-0.85, 0.85), st0 = now + 0.05 + v * rnd(0.1, 0.6);
        for (let i = 0; i < pulses; i++) this.tone(this.lv.m_rane, st0 + i / rate, f * (1 + i * 0.004), 'square', 0.035, 0.002, 0.008, 0.05, pan);
      }
      this.frogs.next = now + rnd(0.6, 2.4) * (1.4 - L.m_rane);
    }

    // —— civetta: due, tre richiami bassi e lontani
    if (L.m_civetta > 0.01 && now >= this.owl.next) {
      const f = rnd(340, 420), pan = rnd(-0.8, 0.8), n = Math.random() < 0.5 ? 2 : 3;
      for (let i = 0; i < n; i++) {
        const st = now + 0.05 + i * (i === 1 ? 0.55 : 0.4);
        this.glide(this.lv.m_civetta, st, f * (i === n - 1 ? 1.04 : 1), f * 0.92, 'sine', 0.13, 0.06, i === n - 1 ? 0.7 : 0.35, pan);
      }
      this.owl.next = now + rnd(7, 22);
    }

    // —— il canto del mare profondo
    if (L.m_balena > 0.01) {
      const w = this.whale;
      if (now >= w.next) {
        const dur = rnd(2.5, 6), f0 = rnd(55, 110), f1 = f0 * rnd(1.4, 2.6), st = now + 0.05;
        this.whaleO.frequency.setValueAtTime(f0, st); this.whaleO.frequency.exponentialRampToValueAtTime(f1, st + dur * 0.55); this.whaleO.frequency.exponentialRampToValueAtTime(f0 * rnd(0.8, 1.2), st + dur);
        this.whaleO2.frequency.setValueAtTime(f0 * 2.01, st); this.whaleO2.frequency.exponentialRampToValueAtTime(f1 * 2.01, st + dur * 0.55); this.whaleO2.frequency.exponentialRampToValueAtTime(f0 * 2.1, st + dur);
        w.until = now + dur; w.next = now + dur + rnd(3, 12);
        if (Math.random() < 0.3) this.tone(this.lv.m_balena, now + dur + 0.5, rnd(900, 1400), 'sine', 0.05, 0.003, 1.2, 5, rnd(-0.5, 0.5));
      }
      T(this.whaleG.gain, now < w.until ? 0.32 : 0, 0.6);
    }

    // —— proiettore: e a volte la coda della pellicola che sbatte
    if (L.m_proiettore > 0.01) {
      this.projLfo.frequency.value = 24 + Math.sin(t * 0.3) * 0.4;
      if (now >= this.proj.next) {
        if (Math.random() < 0.3) { let st = now + 0.05, gap = 0.08; for (let i = 0; i < 18; i++) { this.burst(this.lv.m_proiettore, st, 0.02, 0.3, 900, 0.2); st += gap; gap *= 1.08; } }
        this.proj.next = now + rnd(10, 30);
      }
    }

    // —— sala giochi: arpeggi quadrati, una moneta, un colpo che scende
    if (L.m_arcade > 0.01 && now >= this.arc.next) {
      let base = root; while (base < 260) base *= 2;
      const r = Math.random(), pan = rnd(-0.6, 0.6);
      if (r < 0.5) { const n = Math.floor(rnd(4, 9)), sp = rnd(0.06, 0.11), off = Math.floor(rnd(0, 4)); for (let i = 0; i < n; i++) this.tone(this.lv.m_arcade, now + 0.05 + i * sp, base * ATH.ratioAt(scale, off + (i % 4) * 2), 'square', 0.03, 0.002, 0.04, 0.12, pan); }
      else if (r < 0.75) { this.tone(this.lv.m_arcade, now + 0.05, base * 3.8, 'square', 0.03, 0.002, 0.05, 0.1, pan); this.tone(this.lv.m_arcade, now + 0.13, base * 5.07, 'square', 0.03, 0.002, 0.25, 0.6, pan); }
      else this.glide(this.lv.m_arcade, now + 0.05, rnd(900, 1600), rnd(120, 200), 'square', 0.025, 0.003, rnd(0.2, 0.5), pan);
      this.arc.next = now + rnd(0.8, 3.5) * (1.3 - L.m_arcade * 0.6);
    }

    // —— fabbrica: la pressa, i colpi di metallo, il vapore
    if (L.m_macchine > 0.01) {
      const f = this.fac;
      if (now >= f.next) {
        const st = now + 0.03;
        this.tone(this.lv.m_macchine, st, 48, 'sine', 0.5, 0.002, 0.08, 0.5, 0);
        this.burst(this.lv.m_macchine, st, 0.06, 0.25, 600, rnd(-0.2, 0.2));
        if (Math.random() < 0.5) { const fm = rnd(300, 900); this.tone(this.lv.m_macchine, st + 0.35, fm, 'triangle', 0.08, 0.001, 0.12, 0.6, rnd(-0.7, 0.7)); this.tone(this.lv.m_macchine, st + 0.35, fm * 2.73, 'sine', 0.03, 0.001, 0.08, 0.4, rnd(-0.7, 0.7)); }
        if (Math.random() < 0.08) this.burst(this.lv.m_macchine, st + 0.5, 1.6, 0.12, 2500, rnd(-0.5, 0.5));
        f.next = now + 1.15 + Math.sin(t * 0.05) * 0.1;
      }
    }

    // —— l'auto che passa nella nebbia: arriva, è vicina, se ne va
    {
      const k = this.car;
      if (L.m_motore > 0.01 && k.t < 0 && now >= k.next) { k.t = 0; k.dur = rnd(6, 11); k.dir = Math.random() < 0.5 ? -1 : 1; }
      if (k.t >= 0) {
        k.t += dt; const x = Math.min(1, k.t / k.dur), near = Math.pow(Math.sin(Math.PI * x), 2.2);
        T(this.carG.gain, near * 0.55, 0.1);
        T(this.carPan.pan, k.dir * (x * 2 - 1) * 0.9, 0.1);
        T(this.carLP.frequency, 180 + near * 900, 0.1);
        T(this.carO.frequency, 44 * (1 + 0.06 * (0.5 - x)), 0.2);
        if (x >= 1) { k.t = -1; k.next = now + rnd(14, 40) * (1.3 - L.m_motore * 0.6); T(this.carG.gain, 0, 0.3); }
      }
    }

    // —— altalena: cigola avanti e indietro, sempre più piano, poi qualcuno (il vento) la rispinge
    if (L.m_altalena > 0.01) {
      const s = this.swingS;
      if (now >= s.next) {
        s.side = 1 - s.side; s.amp *= 0.93; if (s.amp < 0.25 && Math.random() < 0.3) s.amp = 1;
        const st = now + 0.03, f0 = s.side ? rnd(900, 1050) : rnd(700, 820), pan = s.side ? 0.25 : -0.15;
        this.glide(this.lv.m_altalena, st, f0, f0 * 1.35, 'sawtooth', 0.025 * s.amp, 0.04, 0.22, pan);
        this.glide(this.lv.m_altalena, st + 0.02, f0 * 2.02, f0 * 2.6, 'sine', 0.015 * s.amp, 0.04, 0.18, pan);
        if (Math.random() < 0.5) this.burst(this.lv.m_altalena, st + 0.1, 0.04, 0.08 * s.amp, 4000, pan);
        s.next = now + 1.55 + rnd(-0.05, 0.05);
      }
    }
  };
})(window.ATH);
