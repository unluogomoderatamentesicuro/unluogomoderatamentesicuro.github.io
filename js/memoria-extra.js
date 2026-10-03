/* ATHANOR — MEMORIA (terza parte): fruscii, sussurri, candele, organo, bolle,
   pianto, cani, tuono, una voce che canticchia; passi sulle scale; il soffio
   di quando si sale o si scende.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const P = ATH.Memoria.prototype;
  const WHISPER = ['torna', 'chi c’è', 'resta', 'ascolta', 'dormi', 'ci sei', 'non sei solo', 'ricordi'];

  Object.assign(ATH.MEM_CAL, { m_fruscio: 1, m_sussurri: 1.2, m_candele: 3, m_organo: 0.25, m_bolle: 2.5, m_pianto: 1, m_cani: 1, m_tuono: 1, m_canto: 1.6 });

  const b0 = P.buildPlus, a0 = P.applyPlus, s0 = P.step;

  P.buildPlus = function () {
    b0.call(this);
    const c = this.c, G = this.G;
    // sussurri: solo fiato, niente voce
    this.whisperers = [-0.95, 0.9, -0.3, 0.4].map(pan => {
      const s = this.src(pick(['white', 'pink'])); const hp = this.filt('highpass', 500);
      const env = G(0), p = c.createStereoPanner(); p.pan.value = pan;
      const fs = [0, 1, 2].map(k => { const b = this.filt('bandpass', ATH.VOWELS[0][k] * 1.1, 7); const g = G([1, 0.8, 0.5][k]); hp.connect(b); b.connect(g); g.connect(env); return b; });
      s.connect(hp); s.start(0, rnd(0, 3));
      env.connect(p); p.connect(this.lv.m_sussurri);
      return { env, fs, p, pan, talking: false, next: 0, until: 0, ph: rnd(0, 6) };
    });
    // candele
    { const s = this.src('pink'); const hp = this.filt('highpass', 2500); this.candleG = G(0.06); this.chain([s, hp, this.candleG, this.lv.m_candele]); s.start(0, 0.9); this.candles = { next: 0 }; }
    // organo: quattro canne per nota, tremolo lento
    { this.organBus = G(0); const lp = this.filt('lowpass', 2200, 0.5); this.organBus.connect(lp); lp.connect(this.lv.m_organo);
      this.trem = c.createOscillator(); this.trem.frequency.value = 5.3; const tg = G(0.06); this.trem.connect(tg); tg.connect(this.organBus.gain); this.trem.start();
      this.pipes = [0, 1, 2, 3].map(() => {
        const g = G(0.18), oscs = [[1, 'sine', 1], [2, 'sine', 0.45], [4, 'sine', 0.2], [1, 'square', 0.08], [0.5, 'sine', 0.35]].map(([m, t, a]) => {
          const o = c.createOscillator(); o.type = t; o.frequency.value = 220 * m; const og = G(a); o.connect(og); og.connect(g); o.start(); return { o, m };
        });
        g.connect(this.organBus); return { g, oscs };
      });
      this.organ = { next: 0, deg: 0 }; }
    // pianto dietro una porta
    { this.cryOut = this.filt('lowpass', 1300, 0.6); this.cryOut.connect(this.lv.m_pianto);
      this.crier = this.makeVoice(300, this.cryOut, 0.25, false);
      this.cry = { next: 0, mode: 0, until: 0 }; }
    // voce che canticchia il ricordo
    { this.hummer = this.makeVoice(240, this.lv.m_canto, -0.1, false);
      this.hummer.fs.forEach((b, k) => { b.frequency.value = [320, 800, 2300][k]; b.Q.value = 7; });
      this.hum = { next: 0, i: 0, rest: 0 }; }
    this.dogs = { next: 0 }; this.thunder = { next: 0 }; this.bubbles = { next: 0 };
    this.rustle = { next: 0 };
  };

  // passi sulle scale, il soffio di quando si sale o si scende
  P.step = function (t, terrain, amp, pan, dest, k, dir) {
    if (terrain === 'scala') {
      const f = 150 + (k || 0) * 9 * (dir || 1);
      this.tone(dest, t, Math.max(70, f), 'sine', 0.35 * amp, 0.003, 0.03, 0.2, pan);
      this.burst(dest, t, 0.008, 0.45 * amp, 2200, pan);
      return;
    }
    if (terrain === 'corsa') { this.burst(dest, t, 0.01, 0.6 * amp, 1800, pan); this.tone(dest, t, 110, 'sine', 0.4 * amp, 0.002, 0.03, 0.15, pan); return; }
    if (terrain === 'foglie') { for (let i = 0; i < 5; i++) this.burst(dest, t + i * rnd(0.01, 0.03), rnd(0.03, 0.08), rnd(0.2, 0.45) * amp, rnd(1500, 4000), pan); return; }
    if (terrain === 'tegole') { this.tone(dest, t, rnd(380, 520), 'triangle', 0.25 * amp, 0.002, 0.03, 0.15, pan); this.burst(dest, t, 0.01, 0.3 * amp, 2500, pan); return; }
    if (terrain === 'nuvola') { this.burst(dest, t, 0.18, 0.18 * amp, 600, pan); return; }
    if (terrain === 'acqua') { const f = rnd(300, 600); this.chirp(t, f, f * 2.2, 0.08, 0.15 * amp, pan, dest); this.burst(dest, t, 0.15, 0.15 * amp, 800, pan); return; }
    return s0.call(this, t, terrain, amp, pan, dest);
  };
  P.walk = function (terrain, seconds, delay, dir) {
    const now = this.c.currentTime + (delay || 0) + 0.05;
    const gap = terrain === 'corsa' ? 0.28 : terrain === 'scala' ? 0.42 : 0.52;
    const n = Math.floor(seconds / gap);
    for (let i = 0; i < n; i++) this.step(now + i * gap + rnd(-0.02, 0.02), terrain, 0.55 * (i < 2 ? (i + 1) / 3 : 1), i % 2 ? 0.12 : -0.12, this.walkBus, i, dir);
  };
  P.whoosh = function (dir, seconds) {
    const c = this.c, t = c.currentTime + 0.05;
    const s = this.src('pink', false), bp = this.filt('bandpass', dir > 0 ? 300 : 2400, 1.5), g = this.G(0);
    bp.frequency.setValueAtTime(dir > 0 ? 300 : 2400, t); bp.frequency.exponentialRampToValueAtTime(dir > 0 ? 2600 : 220, t + seconds);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + seconds * 0.5); g.gain.linearRampToValueAtTime(0, t + seconds);
    this.chain([s, bp, g, this.walkBus]); s.start(t, rnd(0, 2), seconds + 0.1);
    const o = c.createOscillator(), og = this.G(0);
    o.frequency.setValueAtTime(dir > 0 ? 220 : 880, t); o.frequency.exponentialRampToValueAtTime(dir > 0 ? 880 : 110, t + seconds);
    og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(0.03, t + seconds * 0.6); og.gain.linearRampToValueAtTime(0, t + seconds);
    o.connect(og); og.connect(this.walkBus); o.start(t); o.stop(t + seconds + 0.1);
  };

  P.applyPlus = function (L, S, C, dt, root, scale, now, look) {
    a0.call(this, L, S, C, dt, root, scale, now, look);
    const T = (p, v, tau) => this.e.T(p, v, tau), t = this.t;

    // sussurri: frasi brevi, vicinissime, che si spostano
    if (L.m_sussurri > 0.01) this.whisperers.forEach(w => {
      if (now >= w.until) { w.talking = !w.talking; w.until = now + (w.talking ? rnd(0.8, 2.6) : rnd(1.5, 6)); }
      w.p.pan.setTargetAtTime(Math.max(-1, Math.min(1, w.pan + Math.sin(t * 0.3 + w.ph) * 0.35)), now, 0.3);
      if (w.talking && now >= w.next) {
        const st = now + 0.02, len = rnd(0.09, 0.2), vw = pick(ATH.VOWELS);
        w.fs.forEach((b, k) => b.frequency.setTargetAtTime(vw[k] * rnd(1, 1.2), st, 0.02));
        w.env.gain.setTargetAtTime(rnd(0.5, 0.9), st, 0.015); w.env.gain.setTargetAtTime(0.01, st + len * 0.6, 0.03);
        w.next = st + len + rnd(0.02, 0.1);
        if (Math.random() < (ATH.currentWhispers ? 0.14 : 0.04)) this.e.emit('mem', { kind: 'whisper', word: pick(ATH.currentWhispers || WHISPER), pan: w.pan, at: st });
      } else if (!w.talking) w.env.gain.setTargetAtTime(0, now, 0.1);
    });

    // fruscii: stoffa, lenzuola, carta, foglie
    if (L.m_fruscio > 0.01 && now >= this.rustle.next) {
      const st = now + 0.03, kind = Math.random(), pan = rnd(-0.8, 0.8);
      const s = this.src(Math.random() < 0.5 ? 'pink' : 'white', false), g = this.G(0), p = this.c.createStereoPanner(); p.pan.value = pan;
      let d;
      if (kind < 0.5) {            // stoffa, lenzuola
        d = rnd(0.4, 1.4); const bp = this.filt('bandpass', rnd(1500, 3500), 0.9);
        bp.frequency.setValueAtTime(bp.frequency.value, st); bp.frequency.linearRampToValueAtTime(bp.frequency.value * rnd(0.7, 1.4), st + d);
        g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(rnd(0.25, 0.45), st + d * 0.35); g.gain.linearRampToValueAtTime(0, st + d);
        this.chain([s, bp, g, p, this.lv.m_fruscio]);
      } else if (kind < 0.8) {     // una pagina che si gira
        d = rnd(0.25, 0.5); const hp = this.filt('highpass', 2000), bp = this.filt('bandpass', 4500, 1.2);
        g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(0.35, st + 0.04); g.gain.setTargetAtTime(0, st + 0.06, d / 3);
        this.chain([s, hp, bp, g, p, this.lv.m_fruscio]);
        this.burst(this.lv.m_fruscio, st + d * 0.8, 0.01, 0.2, 3500, pan);
      } else {                     // foglie
        d = rnd(0.3, 0.9); const bp = this.filt('bandpass', rnd(3000, 6000), 1.5);
        g.gain.setValueAtTime(0, st);
        for (let k = 0; k < 8; k++) g.gain.linearRampToValueAtTime(rnd(0.05, 0.4), st + d * (k + 0.5) / 8);
        g.gain.linearRampToValueAtTime(0, st + d);
        this.chain([s, bp, g, p, this.lv.m_fruscio]);
      }
      s.start(st, rnd(0, 3), d + 0.1);
      this.rustle.next = now + d + rnd(0.2, 2.5) * (1.3 - L.m_fruscio);
    }

    // candele: il respiro della fiamma e qualche scoppiettio
    T(this.candleG.gain, 0.05 * (0.6 + 0.4 * Math.sin(t * 7.3) * Math.sin(t * 2.1)), 0.05);
    if (L.m_candele > 0.01 && now >= this.candles.next) { this.burst(this.lv.m_candele, now + 0.03, 0.004, rnd(0.1, 0.3), 3000, rnd(-0.5, 0.5)); this.candles.next = now + rnd(0.5, 4); }

    // organo: accordi lunghi
    T(this.organBus.gain, L.m_organo > 0.01 ? 0.6 : 0, 0.8);
    if (L.m_organo > 0.01 && now >= this.organ.next) {
      const o = this.organ; o.deg = ((o.deg + pick([-3, -2, 2, 3, 4])) % scale.length + scale.length) % scale.length;
      let base = root; while (base < 110) base *= 2;
      const chord = [0, 2, 4, 7].map(k => base * ATH.ratioAt(scale, o.deg + k));
      this.pipes.forEach((p, i) => {
        p.g.gain.setTargetAtTime(0.02, now, 0.15);
        p.oscs.forEach(x => x.o.frequency.setValueAtTime(chord[i] * x.m, now + 0.45));
        p.g.gain.setTargetAtTime(0.18, now + 0.5, 0.6);
      });
      o.next = now + rnd(9, 16);
    }

    // pianto: singhiozzi, poi un lamento, poi silenzio
    if (L.m_pianto > 0.01) {
      const v = this.crier, cr = this.cry;
      if (now >= cr.until) { cr.mode = (cr.mode + 1) % 3; cr.until = now + [rnd(2, 4), rnd(2.5, 4.5), rnd(3, 8)][cr.mode]; }
      if (now >= cr.next) {
        const st = now + 0.02;
        if (cr.mode === 0) {          // singhiozzi
          v.fs.forEach((b, k) => b.frequency.setTargetAtTime([700, 1100, 2600][k], st, 0.02));
          v.o.frequency.setValueAtTime(v.f0 * rnd(1.1, 1.3), st); v.o.frequency.exponentialRampToValueAtTime(v.f0 * 0.9, st + 0.18);
          v.env.gain.setTargetAtTime(0.4, st, 0.01); v.env.gain.setTargetAtTime(0, st + 0.12, 0.04);
          cr.next = st + rnd(0.25, 0.45);
        } else if (cr.mode === 1) {   // lamento lungo che scende
          v.fs.forEach((b, k) => b.frequency.setTargetAtTime([650, 1050, 2500][k], st, 0.1));
          v.o.frequency.setValueAtTime(v.f0 * 1.35, st); v.o.frequency.exponentialRampToValueAtTime(v.f0 * 0.75, st + 1.6);
          v.env.gain.setTargetAtTime(0.32, st, 0.1); v.env.gain.setTargetAtTime(0, st + 1.4, 0.2);
          cr.next = st + rnd(2, 3);
        } else { v.env.gain.setTargetAtTime(0, now, 0.2); cr.next = now + 0.5; }
      }
    } else this.crier.env.gain.setTargetAtTime(0, now, 0.2);

    // la voce che canticchia la stessa melodia del carillon
    if (L.m_canto > 0.01) {
      const h = this.hum, v = this.hummer;
      if (now >= h.next) {
        if (h.rest > 0) { h.rest--; v.env.gain.setTargetAtTime(0, now, 0.4); h.next = now + 1.2; }
        else {
          h.i %= this.motif.length;
          const n = this.motif[h.i];
          let base = root; while (base < 190) base *= 2;
          const f = base * ATH.ratioAt(scale, n.d);
          v.o.frequency.setTargetAtTime(f, now, 0.07);
          v.env.gain.setTargetAtTime(n.rest ? 0.02 : 0.32, now, 0.12);
          h.next = now + 0.62 * n.dur * rnd(0.95, 1.1);
          h.i++;
          if (h.i >= this.motif.length) { h.i = 0; h.rest = 2 + Math.floor(Math.random() * 3); }
        }
      }
    } else this.hummer.env.gain.setTargetAtTime(0, now, 0.3);

    // cani lontani
    if (L.m_cani > 0.01 && now >= this.dogs.next) {
      const pan = rnd(-0.9, 0.9), f0 = rnd(380, 620), n = pick([1, 2, 2, 3]);
      for (let i = 0; i < n; i++) {
        const st = now + 0.05 + i * rnd(0.22, 0.32);
        const o = this.c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * 1.2, st); o.frequency.exponentialRampToValueAtTime(f0 * 0.7, st + 0.12);
        const bp = this.filt('bandpass', 900, 2), lp = this.filt('lowpass', 1600), g = this.G(0), p = this.c.createStereoPanner(); p.pan.value = pan;
        g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(0.25, st + 0.01); g.gain.setTargetAtTime(0, st + 0.04, 0.04);
        this.chain([o, bp, lp, g, p, this.lv.m_cani]); o.start(st); o.stop(st + 0.3);
        this.burst(this.lv.m_cani, st, 0.05, 0.08, 1200, pan);
      }
      this.dogs.next = now + rnd(3, 14);
    }

    // tuono
    if (L.m_tuono > 0.01 && now >= this.thunder.next) {
      if (this.thunder.next) {
        const st = now + 0.05, d = rnd(3, 7);
        const s = this.src('brown', false), lp = this.filt('lowpass', rnd(140, 320), 0.7), g = this.G(0), p = this.c.createStereoPanner(); p.pan.value = rnd(-0.7, 0.7);
        g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(1.4, st + rnd(0.1, 0.6));
        for (let k = 1; k < 6; k++) g.gain.linearRampToValueAtTime(rnd(0.4, 1.3) * (1 - k / 6), st + d * k / 6);
        g.gain.linearRampToValueAtTime(0, st + d);
        this.chain([s, lp, g, p, this.lv.m_tuono]); s.start(st, rnd(0, 2), d + 0.1);
        this.e.emit('mem', { kind: 'thunder', at: st });
      }
      this.thunder.next = now + rnd(12, 35);
    }

    // bolle
    if (L.m_bolle > 0.01 && now >= this.bubbles.next) {
      const n = Math.random() < 0.3 ? Math.floor(rnd(4, 10)) : 1, pan = rnd(-0.8, 0.8);
      for (let i = 0; i < n; i++) { const st = now + 0.03 + i * rnd(0.03, 0.09), f = rnd(250, 700); this.chirp(st, f, f * rnd(1.8, 2.6), rnd(0.03, 0.08), 0.18, pan, this.lv.m_bolle); }
      this.bubbles.next = now + rnd(0.15, 1.5);
      this.e.emit('mem', { kind: 'bubble', at: now });
    }
  };
})(window.ATH);
