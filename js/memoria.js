/* ATHANOR — MEMORIA. Le cose di cui sono fatti i ricordi, tutte sintetizzate
   (nessun campione). Qui: carillon, pianoforte, campanile, grilli, cicale, mare,
   pioggia, vento, camino, grammofono, pendolo. Le altre sono in memoria-plus.js.
   Il ricordo passa da un nastro stanco (Nastro), sbiadisce (Oblio), si
   allontana (Distantia) o entra nella fornace (Metamorphosis).
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function gateCurve(duty) {
    const n = 512, c = new Float32Array(n), th = 1 - 2 * duty;
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.max(0, Math.min(1, (x - th) * 12 + 0.5)); }
    return c;
  }

  ATH.gateCurve = gateCurve;
  const VOWELS = [[800, 1150, 2900], [400, 1600, 2700], [290, 2200, 3000], [450, 800, 2830], [325, 700, 2530], [600, 1000, 2600]];

  class Memoria {
    constructor(e) {
      this.e = e;
      const c = this.c = e.ctx;
      const G = this.G = v => { const g = c.createGain(); g.gain.value = v === undefined ? 1 : v; return g; };
      this.t = 0;
      this.noiseBuf = { white: e.noise.white.src.buffer, pink: e.noise.pink.src.buffer, brown: e.noise.brown.src.buffer };

      // —— catena del ricordo
      this.in = G(1);
      this.wow = c.createDelay(0.2); this.wow.delayTime.value = 0.02;
      this.wowLFO = c.createOscillator(); this.wowLFO.frequency.value = 0.45; this.wowG = G(0);
      this.flutLFO = c.createOscillator(); this.flutLFO.frequency.value = 6.3; this.flutG = G(0);
      this.wowLFO.connect(this.wowG); this.wowG.connect(this.wow.delayTime);
      this.flutLFO.connect(this.flutG); this.flutG.connect(this.wow.delayTime);
      this.wowLFO.start(); this.flutLFO.start();
      this.ageHP = c.createBiquadFilter(); this.ageHP.type = 'highpass'; this.ageHP.frequency.value = 30;
      this.ageLP = c.createBiquadFilter(); this.ageLP.type = 'lowpass'; this.ageLP.frequency.value = 16000;
      this.gap = G(1);
      this.in.connect(this.wow); this.wow.connect(this.ageHP); this.ageHP.connect(this.ageLP); this.ageLP.connect(this.gap);
      this.clean = G(0.7); this.dirty = G(0); this.far = G(0.3);
      this.gap.connect(this.clean); this.clean.connect(e.masterSum);
      this.gap.connect(this.dirty); this.dirty.connect(e.alembic);
      this.gap.connect(this.far); this.far.connect(e.crypta); this.far.connect(e.caelum);

      this.lv = {};
      ATH.MEM_IDS.forEach(id => { const g = G(0); g.connect(this.in); this.lv[id] = g; });

      this.buildContinuous();
      this.buildPlus();
      this.motif = this.makeMotif();
      this.car = { next: 0, i: 0, speed: 1 };
      this.pia = { next: 0, i: 0 };
      this.toll = { next: 0 };
      this.pend = { next: 0, tick: 0 };
      this.level = {};
      this.waveVal = 0;
      this.voiceAct = 0;
      this.gapUntil = 0;
    }

    src(kind, loop) {
      const s = this.c.createBufferSource(); s.buffer = this.noiseBuf[kind]; s.loop = loop !== false;
      return s;
    }
    filt(type, f, q) { const b = this.c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q || 0.7; return b; }
    chain(nodes) { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); return nodes[nodes.length - 1]; }
    gateLFO(freq, duty, target) {
      const o = this.c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq;
      const sh = this.c.createWaveShaper(); sh.curve = gateCurve(duty);
      o.connect(sh); sh.connect(target); o.start();
      return o;
    }

    buildContinuous() {
      const c = this.c, G = this.G;
      // grilli: portante acuta, battuta veloce, cantata a gruppi
      this.crickets = [0, 1, 2].map(i => {
        const o = c.createOscillator(); o.frequency.value = rnd(4200, 4900);
        const a = G(0), b = G(0), pan = c.createStereoPanner(); pan.pan.value = [-0.7, 0.4, 0.85][i];
        o.connect(a); a.connect(b); b.connect(pan); pan.connect(this.lv.m_grilli); o.start();
        this.gateLFO(rnd(26, 38), 0.5, a.gain);
        const slow = this.gateLFO(rnd(1.1, 2.2), rnd(0.25, 0.4), b.gain);
        return { o, slow };
      });
      // cicale: rumore filtrato acuto, modulato forte, che si gonfia e cala
      this.cicadas = [0, 1].map(i => {
        const s = this.src('white'); const bp = this.filt('bandpass', i ? 6900 : 5200, 3);
        const am = G(0), sw = G(0), pan = c.createStereoPanner(); pan.pan.value = i ? 0.55 : -0.5;
        this.chain([s, bp, am, sw, pan, this.lv.m_cicale]);
        this.gateLFO(rnd(160, 230), 0.45, am.gain);
        s.start(0, rnd(0, 3));
        return { sw, ph: rnd(0, TAU), sp: rnd(0.12, 0.25) };
      });
      // mare: due rive, rumore rosa che sale e si ritira
      this.sea = [0, 1].map(i => {
        const s = this.src(i ? 'pink' : 'brown'); const lp = this.filt('lowpass', 600, 0.5);
        const g = G(0), pan = c.createStereoPanner(); pan.pan.value = i ? 0.5 : -0.5;
        this.chain([s, lp, g, pan, this.lv.m_mare]); s.start(0, rnd(0, 3));
        return { lp, g };
      });
      // pioggia: fruscio + gocce
      { const s = this.src('pink'); const hp = this.filt('highpass', 1400), lp = this.filt('lowpass', 7000);
        this.rainHiss = G(0.35); this.chain([s, hp, lp, this.rainHiss, this.lv.m_pioggia]); s.start(0, 1.3); }
      // vento: due bande che vagano, una che fischia
      this.wind = [[0.9, 4], [1.6, 11]].map(([k, q], i) => {
        const s = this.src('pink'); const bp = this.filt('bandpass', 500 * k, q);
        const g = G(0), pan = c.createStereoPanner(); pan.pan.value = i ? 0.4 : -0.3;
        this.chain([s, bp, g, pan, this.lv.m_vento]); s.start(0, rnd(0, 3));
        return { bp, g, k, ph: rnd(0, TAU) };
      });
      // camino: il brontolio
      { const s = this.src('brown'); const lp = this.filt('lowpass', 380); this.fireRumble = G(0.6);
        this.chain([s, lp, this.fireRumble, this.lv.m_camino]); s.start(0, 0.7); }
      // grammofono: fruscio e rombo del piatto
      { const s = this.src('white'); const bp = this.filt('bandpass', 3200, 0.6); const g = G(0.05);
        this.chain([s, bp, g, this.lv.m_grammofono]); s.start(0, 2.1);
        const r = this.src('brown'); const lp = this.filt('lowpass', 70); const rg = G(0.5);
        this.chain([r, lp, rg, this.lv.m_grammofono]); r.start(0, 0.2); }
    }

    makeMotif() {
      const len = pick([6, 7, 8, 8, 10]);
      let d = Math.floor(rnd(3, 7));
      const m = [];
      for (let i = 0; i < len; i++) {
        d = Math.max(0, Math.min(11, d + pick([-2, -1, -1, 1, 1, 2, 0, 3])));
        m.push({ d, dur: pick([1, 1, 1, 2, 0.5, 1.5]), rest: Math.random() < 0.08 });
      }
      m[m.length - 1].dur = 3;
      return m;
    }
    newMemory() { this.motif = this.makeMotif(); this.car.i = 0; this.pia.i = 0; }
    mutate(amount) {
      if (Math.random() > amount) return;
      const n = this.motif[Math.floor(Math.random() * this.motif.length)];
      if (Math.random() < 0.2) n.rest = !n.rest;
      else n.d = Math.max(0, Math.min(11, n.d + pick([-2, -1, 1, 2])));
    }

    env(g, t, peak, att, tau) {
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + att);
      g.gain.setTargetAtTime(0, t + att, tau);
    }
    tone(dest, t, f, type, amp, att, tau, dur, pan) {
      const c = this.c;
      const o = c.createOscillator(); o.type = type; o.frequency.value = Math.min(17000, f);
      const g = this.G(0); this.env(g, t, amp, att, tau);
      if (pan !== undefined) { const p = c.createStereoPanner(); p.pan.value = pan; o.connect(g); g.connect(p); p.connect(dest); }
      else { o.connect(g); g.connect(dest); }
      o.start(t); o.stop(t + dur);
      o.onended = () => { try { g.disconnect(); } catch (e) { } };
    }
    burst(dest, t, dur, amp, hp, pan) {
      const s = this.src('white', false), f = this.filt('highpass', hp, 0.7), g = this.G(0), p = this.c.createStereoPanner();
      p.pan.value = pan;
      g.gain.setValueAtTime(amp, t); g.gain.setTargetAtTime(0, t, dur / 3);
      this.chain([s, f, g, p, dest]);
      s.start(t, rnd(0, 3), dur + 0.05);
    }

    playCarillon(t, f) {
      const pan = rnd(-0.3, 0.3);
      this.tone(this.lv.m_carillon, t, f, 'sine', 0.11, 0.002, 0.7, 3, pan);
      this.tone(this.lv.m_carillon, t, f * 2.002, 'sine', 0.025, 0.002, 0.3, 1.2, pan);
      this.tone(this.lv.m_carillon, t, f * 4.07, 'sine', 0.03, 0.001, 0.06, 0.4, pan);
      this.e.emit('mem', { kind: 'carillon', freq: f, pan, at: t });
    }
    playPiano(t, f) {
      const pan = rnd(-0.5, 0.5);
      this.tone(this.lv.m_piano, t, f, 'triangle', 0.13, 0.004, 1.3, 6, pan);
      this.tone(this.lv.m_piano, t, f * 2.003, 'sine', 0.04, 0.003, 0.7, 3, pan);
      this.tone(this.lv.m_piano, t, f * 0.998, 'sine', 0.07, 0.005, 1.8, 7, pan);
      this.e.emit('mem', { kind: 'piano', freq: f, pan, at: t });
    }
    stroke(t, f, pan) {
      const parts = [[0.5, 0.5, 4], [1, 1, 3], [1.19, 0.55, 2.2], [1.5, 0.35, 1.8], [2, 0.45, 1.5], [2.52, 0.18, 1], [3, 0.16, 0.8], [4.1, 0.08, 0.5]];
      const lp = this.filt('lowpass', 2600), p = this.c.createStereoPanner(); p.pan.value = pan;
      lp.connect(p); p.connect(this.lv.m_campane);
      parts.forEach(([r, a, tau]) => this.tone(lp, t, f * r, 'sine', a * 0.06, 0.004, tau, tau * 7));
      this.e.emit('mem', { kind: 'toll', freq: f, pan, at: t });
    }
    drop(t) {
      const f = rnd(1800, 5200), pan = rnd(-0.9, 0.9);
      const o = this.c.createOscillator(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.04);
      const g = this.G(0); this.env(g, t, rnd(0.01, 0.05), 0.001, 0.012);
      const p = this.c.createStereoPanner(); p.pan.value = pan;
      o.connect(g); g.connect(p); p.connect(this.lv.m_pioggia); o.start(t); o.stop(t + 0.12);
      if (Math.random() < 0.15) this.e.emit('mem', { kind: 'drop', pan, at: t });
    }
    tick(t, hi) {
      this.tone(this.lv.m_pendolo, t, hi ? 1900 : 1650, 'sine', 0.05, 0.001, 0.012, 0.1, hi ? 0.15 : -0.15);
      this.burst(this.lv.m_pendolo, t, 0.012, 0.06, 2500, hi ? 0.15 : -0.15);
      this.tone(this.lv.m_pendolo, t, hi ? 420 : 380, 'sine', 0.04, 0.002, 0.03, 0.2);
    }

    apply(L, S, C, dt, root) {
      const c = this.c, now = c.currentTime, t = (this.t += dt);
      const scale = ATH.SCALES[C.modus] || ATH.SCALES.pentatonico;
      const T = (p, v, tau) => this.e.T(p, v, tau);
      const lev = id => this.level[id] = L[id];

      ATH.MEM_IDS.forEach(id => T(this.lv[id].gain, Math.pow(L[id], 1.2) * 1.2 * (ATH.MEM_CAL[id] || 1), 0.3));

      // catena
      T(this.wowG.gain, L.nastro * 0.0045, 0.3);
      T(this.flutG.gain, L.nastro * 0.0006, 0.3);
      T(this.wowLFO.frequency, 0.3 + L.nastro * 0.5, 0.5);
      T(this.ageLP.frequency, 16000 * Math.pow(0.07, L.oblio), 0.3);
      T(this.ageHP.frequency, 30 + L.oblio * L.oblio * 300, 0.3);
      const m = L.memoria * L.memoria * 1.1;
      const meta = L.metamorphosis;
      T(this.clean.gain, m * (1 - meta * 0.9) * (1 - L.distantia * 0.55), 0.2);
      T(this.dirty.gain, m * meta * 1.3, 0.2);
      T(this.far.gain, m * (0.15 + L.distantia * 0.75), 0.2);
      // vuoti di memoria
      if (now > this.gapUntil && Math.random() < L.oblio * L.oblio * 0.25 * dt) {
        const d = rnd(0.3, 1.6);
        this.gapUntil = now + d + 2;
        this.gap.gain.setTargetAtTime(0.08, now, 0.08);
        this.gap.gain.setTargetAtTime(1, now + d, 0.3);
      }

      let base = root; while (base < 600) base *= 2;
      let low = root; while (low < 130) low *= 2;
      const look = now + 0.25;

      // carillon: si scarica lentamente e poi viene ricaricato
      if (L.m_carillon > 0.01) {
        const k = this.car;
        if (k.next < now) k.next = now + 0.05;
        k.speed -= dt / 90;
        if (k.speed < 0.55) { k.speed = 1; k.next = now + 1.2; this.burst(this.lv.m_carillon, now + 0.1, 0.4, 0.05, 1500, 0); }
        while (k.next < look) {
          k.i %= this.motif.length; const n = this.motif[k.i];
          if (!n.rest) this.playCarillon(k.next, base * ATH.ratioAt(scale, n.d) * (1 + rnd(-1, 1) * 0.002));
          k.next += 0.3 * n.dur / k.speed * rnd(0.96, 1.05);
          k.i++;
          if (k.i >= this.motif.length) { k.i = 0; k.next += 0.6 / k.speed; if (!S.fixa) this.mutate(L.oblio * 0.8); }
        }
      } else this.car.next = 0;

      // pianoforte: lo stesso ricordo, lento e grave, una nota sì e una no
      if (L.m_piano > 0.01) {
        const k = this.pia;
        if (k.next < now) k.next = now + 0.1;
        while (k.next < look) {
          k.i %= this.motif.length; const n = this.motif[k.i];
          if (!n.rest && (k.i % 2 === 0 || Math.random() < 0.3)) {
            const f = low * ATH.ratioAt(scale, n.d);
            this.playPiano(k.next, f);
            if (Math.random() < 0.35) this.playPiano(k.next + 0.02, f * ATH.ratioAt(scale, 2) / ATH.ratioAt(scale, 0) * 0.5);
          }
          k.next += 0.95 * n.dur * rnd(0.9, 1.2);
          k.i = (k.i + 1) % this.motif.length;
          if (k.i === 0) k.next += rnd(1.5, 4);
        }
      } else this.pia.next = 0;

      // campanile
      if (L.m_campane > 0.01) {
        if (!this.toll.next) this.toll.next = now + rnd(1, 4);
        if (now >= this.toll.next) {
          const n = Math.floor(rnd(3, 10)), gap = rnd(1.7, 2.6);
          let f = root; while (f < 170) f *= 2;
          const pan = rnd(-0.5, 0.5), two = Math.random() < 0.5;
          for (let i = 0; i < n; i++) this.stroke(now + 0.1 + i * gap, two && i % 2 ? f * 0.84 : f, pan);
          this.toll.next = now + n * gap + rnd(18, 55) * (1.3 - L.m_campane);
        }
      } else this.toll.next = 0;

      // grilli e cicale
      this.cicadas.forEach(k => T(k.sw.gain, 0.12 * Math.pow(0.5 + 0.5 * Math.sin(t * k.sp + k.ph), 1.5), 0.3));

      // mare
      const w = Math.pow(0.5 + 0.5 * Math.sin(t * 0.55) * 0.7 + 0.5 * Math.sin(t * 0.23 + 1.3) * 0.3, 2);
      this.waveVal = w;
      this.sea.forEach((s, i) => {
        const wi = Math.pow(0.5 + 0.5 * Math.sin(t * 0.55 - i * 0.6) * 0.7 + 0.5 * Math.sin(t * 0.23 + 1.3 + i) * 0.3, 2);
        T(s.g.gain, 0.2 + wi * 0.9, 0.15); T(s.lp.frequency, 280 + wi * 2200, 0.15);
      });

      // pioggia
      if (L.m_pioggia > 0.01) { const n = Math.floor(L.m_pioggia * 22 * dt + Math.random()); for (let i = 0; i < n; i++) this.drop(now + rnd(0.02, 0.2)); }

      // vento
      this.wind.forEach((v, i) => {
        const g = 0.5 + 0.5 * Math.sin(t * (0.13 + i * 0.07) + v.ph) * Math.sin(t * 0.051 + v.ph * 2);
        T(v.bp.frequency, (300 + 900 * g) * v.k, 0.4); T(v.g.gain, (i ? 0.25 : 0.8) * (0.2 + g), 0.4);
      });

      // camino: schiocchi a grappoli
      if (L.m_camino > 0.01 && Math.random() < 7 * dt) {
        const n = Math.random() < 0.3 ? Math.floor(rnd(2, 6)) : 1;
        for (let i = 0; i < n; i++) this.burst(this.lv.m_camino, now + 0.03 + i * rnd(0.01, 0.06), rnd(0.004, 0.02), rnd(0.15, 0.6), rnd(600, 2500), rnd(-0.6, 0.6));
        this.e.emit('mem', { kind: 'ember', at: now });
      }
      // grammofono: graffi
      if (L.m_grammofono > 0.01 && Math.random() < 9 * dt) this.burst(this.lv.m_grammofono, now + 0.02, 0.002, rnd(0.1, 0.5), 3000, rnd(-0.2, 0.2));

      // pendolo
      if (L.m_pendolo > 0.01) {
        const k = this.pend;
        if (k.next < now) k.next = now + 0.1;
        while (k.next < look) { this.tick(k.next, k.tick % 2 === 0); k.tick++; k.next += 1.0; }
      } else this.pend.next = 0;

      this.applyPlus(L, S, C, dt, root, scale, now, look);
    }
  }

  ATH.Memoria = Memoria;
  ATH.VOWELS = VOWELS;
})(window.ATH);
