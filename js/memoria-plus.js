/* ATHANOR — MEMORIA (seconda parte): voci e bambini, uccelli, gabbiani, gocce,
   scricchiolii, telefono, radio, ronzio, treno, festa oltre il muro, passi,
   cuore, respiro, acufene, monitor. Tutto sintetizzato.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const P = ATH.Memoria.prototype;

  // calibrazione misurata: ogni sorgente a livello 0.6 esce con un volume simile
  ATH.MEM_CAL = {
    m_grilli: 0.14, m_cicale: 3, m_uccelli: 2.5, m_gabbiani: 8, m_mare: 0.9, m_pioggia: 1.5, m_vento: 2, m_goccia: 1.3,
    m_carillon: 1, m_piano: 1, m_camino: 0.6, m_grammofono: 1, m_pendolo: 2, m_scricchiolio: 1, m_telefono: 1.5, m_radio: 1, m_ronzio: 0.2,
    m_voci: 0.9, m_bambini: 0.8, m_passi: 1.5, m_campane: 1.2, m_festa: 0.3, m_treno: 1,
    m_cuore: 0.5, m_respiro: 3, m_acufene: 1.5, m_monitor: 2
  };

  P.makeVoice = function (f0, out, pan, child) {
    const c = this.c, G = this.G;
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0;
    const vib = c.createOscillator(); vib.frequency.value = rnd(4.5, 6.5);
    const vg = G(f0 * 0.015); vib.connect(vg); vg.connect(o.frequency); vib.start();
    const br = this.src('pink'); const bhp = this.filt('highpass', 1200); const bg = G(child ? 0.25 : 0.4);
    this.chain([br, bhp, bg]); br.start(0, rnd(0, 3));
    const env = G(0), p = c.createStereoPanner(); p.pan.value = pan;
    const fs = [0, 1, 2].map(k => {
      const b = this.filt('bandpass', ATH.VOWELS[0][k] * (child ? 1.25 : 1), 5);
      const g = G([1, 0.75, 0.4][k]);
      o.connect(b); bg.connect(b); b.connect(g); g.connect(env);
      return b;
    });
    env.connect(p); p.connect(out); o.start();
    return { o, f0, env, fs, child, talking: false, next: 0, until: 0, laugh: false, k: 0 };
  };

  P.buildPlus = function () {
    const c = this.c, G = this.G;
    // —— voci adulte e bambini
    this.voiceOut = this.filt('lowpass', 2400, 0.5); this.voiceOut.connect(this.lv.m_voci);
    this.voices = [118, 205, 150, 230, 132].map((f0, i) => this.makeVoice(f0, this.voiceOut, [-0.6, 0.35, 0.7, -0.2, 0.1][i], false));
    this.kidOut = this.filt('lowpass', 3600, 0.5); this.kidOut.connect(this.lv.m_bambini);
    this.kids = [310, 360, 400].map((f0, i) => this.makeVoice(f0, this.kidOut, [-0.5, 0.2, 0.75][i], true));

    // —— respiro
    { const s = this.src('pink'); this.breathBP = this.filt('bandpass', 800, 0.8); this.breathG = G(0);
      this.chain([s, this.breathBP, this.breathG, this.lv.m_respiro]); s.start(0, 1.7); this.breathPh = 0; }
    // —— acufene
    { this.tinG = G(0.03);
      [7040, 7046.5, 3520.3].forEach((f, i) => { const o = c.createOscillator(); o.frequency.value = f; const g = G(i === 2 ? 0.3 : 1); o.connect(g); g.connect(this.tinG); o.start(); });
      this.tinG.connect(this.lv.m_acufene); }
    // —— telefono di bachelite: due campanelli battuti a 20 Hz
    { this.ringG = G(0); const sum = G(0.12), strike = G(0);
      [[1150, 1], [2645, 0.4], [4370, 0.2], [1560, 0.8], [3590, 0.35]].forEach(([f, a]) => { const o = c.createOscillator(); o.frequency.value = f; const g = G(a); o.connect(g); g.connect(sum); o.start(); });
      this.gateLFO(20, 0.35, strike.gain);
      const lp = this.filt('lowpass', 2600, 0.7), p = c.createStereoPanner(); p.pan.value = 0.55;
      this.chain([sum, strike, this.ringG, lp, p, this.lv.m_telefono]);
      this.phone = { next: 0, rings: 0, on: false, t: 0 }; }
    // —— radio che cerca una stazione
    { const s = this.src('white'); this.radBP = this.filt('bandpass', 1200, 3); this.radN = G(0.5);
      this.chain([s, this.radBP, this.radN, this.lv.m_radio]); s.start(0, 0.4);
      this.radW = c.createOscillator(); this.radW.frequency.value = 1500; this.radWG = G(0.04);
      this.radW.connect(this.radWG); this.radWG.connect(this.lv.m_radio); this.radW.start();
      this.radS = G(0); const lp = this.filt('lowpass', 1300, 1); this.radS.connect(lp); lp.connect(this.lv.m_radio);
      this.radChord = [0, 1, 2].map(() => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 220; const g = G(0.08); o.connect(g); g.connect(this.radS); o.start(); return o; });
      this.radio = { station: false, until: 0 }; }
    // —— ronzio del neon a 50 Hz
    { this.humG = G(1);
      [[50, 'sine', 0.35], [100, 'sawtooth', 0.06], [150, 'sine', 0.08]].forEach(([f, t, a]) => { const o = c.createOscillator(); o.type = t; o.frequency.value = f; const g = G(a); o.connect(g); g.connect(this.humG); o.start(); });
      const s = this.src('white'); const bp = this.filt('bandpass', 3200, 2); this.buzzG = G(0.02);
      this.chain([s, bp, this.buzzG, this.humG]); s.start(0, 2.5);
      this.humG.connect(this.lv.m_ronzio); }
    // —— treno: il brontolio lontano
    { const s = this.src('brown'); const lp = this.filt('lowpass', 230, 0.7); this.trainG = G(0);
      this.chain([s, lp, this.trainG, this.lv.m_treno]); s.start(0, 3.1);
      this.train = { next: 0, start: 0, dur: 0, clack: 0 }; }
    // —— festa oltre il muro
    { this.wall = this.filt('lowpass', 330, 0.9); this.wall.connect(this.lv.m_festa); this.party = { next: 0, beat: 0 }; }
    // —— passi
    this.walkBus = G(1.2); this.walkBus.connect(this.in);
    this.terrain = 'pietra'; this.passer = { next: 0 };
    this.heart = { next: 0 }; this.mon = { next: 0 };
    this.birds = { next: 0 }; this.gulls = { next: 0 }; this.drips = { next: 0 }; this.creak = { next: 0 };
  };

  // —— un passo, secondo il terreno
  P.step = function (t, terrain, amp, pan, dest) {
    const b = (dur, a, type, f, q, off) => {
      const s = this.src('white', false), fl = this.filt(type, f, q || 0.7), g = this.G(0), p = this.c.createStereoPanner();
      p.pan.value = pan; g.gain.setValueAtTime(a * amp, t + (off || 0)); g.gain.setTargetAtTime(0, t + (off || 0), dur / 3);
      this.chain([s, fl, g, p, dest]); s.start(t + (off || 0), rnd(0, 3), dur + 0.05);
    };
    const thump = (f, a, tau) => this.tone(dest, t, f, 'sine', a * amp, 0.003, tau, tau * 6, pan);
    switch (terrain) {
      case 'ghiaia': for (let i = 0; i < 6; i++) b(0.02, rnd(0.2, 0.5), 'bandpass', rnd(2000, 4500), 1.2, i * rnd(0.008, 0.02)); thump(90, 0.25, 0.03); break;
      case 'erba': b(0.12, 0.35, 'bandpass', 1600, 0.6); b(0.05, 0.2, 'highpass', 4000, 0.7, 0.03); break;
      case 'sabbia': b(0.16, 0.5, 'lowpass', 700, 0.7); thump(70, 0.2, 0.05); break;
      case 'legno': thump(115, 0.6, 0.05); b(0.015, 0.3, 'bandpass', 900, 3); if (Math.random() < 0.15) this.creakAt(t + 0.05, 0.4); break;
      case 'neve': for (let i = 0; i < 9; i++) b(0.018, rnd(0.15, 0.35), 'bandpass', rnd(1800, 3200), 2, i * 0.016); break;
      default: b(0.006, 0.6, 'highpass', 2500, 0.7); thump(170, 0.35, 0.025); b(0.03, 0.15, 'bandpass', 1200, 2, 0.01);
    }
  };
  // camminare: chiamato da chi viaggia tra i luoghi
  P.walk = function (terrain, seconds, delay) {
    const now = this.c.currentTime + (delay || 0) + 0.05;
    const n = Math.floor(seconds / 0.52);
    for (let i = 0; i < n; i++) this.step(now + i * 0.52 + rnd(-0.02, 0.02), terrain, 0.55 * (i < 2 ? (i + 1) / 3 : 1), i % 2 ? 0.12 : -0.12, this.walkBus);
  };

  P.thump = function (t, f, amp) {
    const o = this.c.createOscillator(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.09);
    const g = this.G(0); this.env(g, t, amp, 0.004, 0.05);
    o.connect(g); g.connect(this.lv.m_cuore); o.start(t); o.stop(t + 0.4);
  };
  P.creakAt = function (t, amp) {
    const c = this.c, dur = rnd(0.5, 1.8);
    const o = c.createOscillator(); o.type = 'sawtooth';
    const f0 = rnd(22, 60); o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * rnd(0.6, 1.5), t + dur);
    const bp = this.filt('bandpass', rnd(500, 1100), 9); bp.frequency.setValueAtTime(bp.frequency.value, t); bp.frequency.linearRampToValueAtTime(bp.frequency.value * rnd(0.6, 1.4), t + dur);
    const g = this.G(0), p = c.createStereoPanner(); p.pan.value = rnd(-0.8, 0.8);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5 * amp, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.35 * amp, t + dur * 0.8); g.gain.linearRampToValueAtTime(0, t + dur);
    this.chain([o, bp, g, p, this.lv.m_scricchiolio]); o.start(t); o.stop(t + dur + 0.05);
  };
  P.chirp = function (t, f0, f1, dur, amp, pan, dest) {
    const o = this.c.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.G(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + dur * 0.2); g.gain.linearRampToValueAtTime(0, t + dur);
    const p = this.c.createStereoPanner(); p.pan.value = pan;
    o.connect(g); g.connect(p); p.connect(dest); o.start(t); o.stop(t + dur + 0.02);
  };

  P.talk = function (v, now, L) {
    if (now >= v.until) {
      v.talking = !v.talking;
      v.laugh = v.child && Math.random() < 0.5;
      v.k = 0;
      v.until = now + (v.talking ? (v.laugh ? rnd(0.6, 1.4) : rnd(1, 3.5)) : rnd(1, v.child ? 4 : 6));
    }
    if (v.talking && now >= v.next) {
      const st = now + 0.02;
      let len, f, vw;
      if (v.laugh) { len = rnd(0.07, 0.12); f = v.f0 * 1.35 * Math.pow(0.95, v.k++); vw = ATH.VOWELS[0]; }
      else { len = rnd(0.1, 0.24); f = v.f0 * rnd(0.88, 1.18) * (v.child && Math.random() < 0.2 ? 1.4 : 1); vw = pick(ATH.VOWELS); }
      v.fs.forEach((b, k) => b.frequency.setTargetAtTime(vw[k] * (v.child ? 1.25 : 1) * rnd(0.95, 1.06), st, 0.025));
      v.o.frequency.setTargetAtTime(f, st, v.laugh ? 0.01 : 0.06);
      v.env.gain.setTargetAtTime(rnd(0.3, 0.55), st, 0.02);
      v.env.gain.setTargetAtTime(0.01, st + len * 0.7, 0.035);
      v.next = st + len + (v.laugh ? rnd(0.03, 0.06) : rnd(0.02, 0.14));
    } else if (!v.talking) v.env.gain.setTargetAtTime(0, now, 0.08);
  };

  P.applyPlus = function (L, S, C, dt, root, scale, now, look) {
    const T = (p, v, tau) => this.e.T(p, v, tau);
    const t = this.t;

    // voci e bambini
    let act = 0;
    if (L.m_voci > 0.01) this.voices.forEach(v => { this.talk(v, now, L); if (v.talking) act += 0.2; });
    if (L.m_bambini > 0.01) this.kids.forEach(v => this.talk(v, now, L));
    this.voiceAct += (act - this.voiceAct) * Math.min(1, dt * 2);

    // uccelli: frasi di tre specie
    if (L.m_uccelli > 0.01 && now >= this.birds.next) {
      const sp = Math.floor(Math.random() * 3), pan = rnd(-0.8, 0.8), d = this.lv.m_uccelli;
      let tt = now + 0.05;
      if (sp === 0) { let f = rnd(2600, 3800); for (let i = 0, n = Math.floor(rnd(3, 6)); i < n; i++) { this.chirp(tt, f, f * rnd(0.85, 1.1), 0.13, 0.12, pan, d); tt += 0.17; f *= rnd(0.88, 0.97); } }
      else if (sp === 1) { for (let i = 0, n = Math.floor(rnd(5, 11)); i < n; i++) { const f = rnd(4000, 6000); this.chirp(tt, f, f * rnd(0.55, 0.8), 0.035, 0.1, pan, d); tt += rnd(0.05, 0.12); } }
      else { const a = rnd(3000, 4200), b = a * rnd(1.1, 1.25); for (let i = 0, n = Math.floor(rnd(14, 24)); i < n; i++) { const f = i % 2 ? a : b; this.chirp(tt, f, f * 0.95, 0.025, 0.08, pan, d); tt += 0.035; } }
      this.birds.next = tt + rnd(0.4, 3.2) * (1.4 - L.m_uccelli);
      if (Math.random() < 0.5) this.e.emit('mem', { kind: 'bird', pan, at: now });
    }
    // gabbiani
    if (L.m_gabbiani > 0.01 && now >= this.gulls.next) {
      const pan = rnd(-0.9, 0.9);
      for (let i = 0, n = Math.floor(rnd(2, 5)); i < n; i++) {
        const tt = now + 0.05 + i * rnd(0.45, 0.7), f = rnd(800, 1100);
        const o = this.c.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, tt); o.frequency.exponentialRampToValueAtTime(f * 1.7, tt + 0.08); o.frequency.exponentialRampToValueAtTime(f * 0.8, tt + 0.5);
        const bp = this.filt('bandpass', 1400, 1.6), g = this.G(0), p = this.c.createStereoPanner(); p.pan.value = pan;
        g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(0.06, tt + 0.04); g.gain.linearRampToValueAtTime(0.03, tt + 0.3); g.gain.linearRampToValueAtTime(0, tt + 0.55);
        this.chain([o, bp, g, p, this.lv.m_gabbiani]); o.start(tt); o.stop(tt + 0.6);
      }
      this.gulls.next = now + rnd(3, 10);
      this.e.emit('mem', { kind: 'bird', pan, at: now, gull: true });
    }
    // gocce
    if (L.m_goccia > 0.01 && now >= this.drips.next) {
      const tt = now + 0.05, f = rnd(700, 2000), pan = rnd(-0.7, 0.7);
      this.chirp(tt, f, f * 1.6, 0.06, 0.25, pan, this.lv.m_goccia);
      this.drips.next = now + (Math.random() < 0.3 ? rnd(0.15, 0.4) : rnd(0.8, 3));
      if (Math.random() < 0.6) this.e.emit('mem', { kind: 'drip', pan, at: tt });
    }
    // scricchiolii
    if (L.m_scricchiolio > 0.01 && now >= this.creak.next) { this.creakAt(now + 0.05, 1); this.creak.next = now + rnd(2, 8); }

    // cuore e monitor
    const bpm = 48 + L.pulsus * 80, beat = 60 / bpm;
    if (L.m_cuore > 0.01) {
      const h = this.heart; if (h.next < now) h.next = now + 0.05;
      while (h.next < look) { this.thump(h.next, 62, 0.7); this.thump(h.next + beat * 0.32, 52, 0.45); this.e.emit('mem', { kind: 'heart', at: h.next }); h.next += beat * rnd(0.97, 1.03); }
    } else this.heart.next = 0;
    if (L.m_monitor > 0.01) {
      const m = this.mon; if (m.next < now) m.next = now + 0.05;
      while (m.next < look) { this.tone(this.lv.m_monitor, m.next, 960, 'sine', 0.12, 0.004, 0.035, 0.2, 0.3); this.e.emit('mem', { kind: 'beep', at: m.next }); m.next += beat; }
    } else this.mon.next = 0;

    // respiro: inspira, pausa, espira, pausa
    const period = S.spira ? 60 / (4 + L.respiratio * 4) : 4.4;
    this.breathPh = (this.breathPh + dt / period) % 1;
    const ph = this.breathPh;
    const bg = ph < 0.38 ? Math.sin(ph / 0.38 * Math.PI) : ph < 0.45 ? 0 : ph < 0.9 ? Math.sin((ph - 0.45) / 0.45 * Math.PI) * 0.8 : 0;
    T(this.breathG.gain, bg * 0.35, 0.08); T(this.breathBP.frequency, ph < 0.45 ? 1100 : 650, 0.2);
    // acufene
    T(this.tinG.gain, 0.012 * (0.8 + 0.2 * Math.sin(t * 0.3)), 0.3);

    // telefono: squilla qualche volta, poi più niente. Nessuno risponde.
    const ph2 = this.phone;
    if (L.m_telefono > 0.01) {
      if (!ph2.on && now >= ph2.next) { ph2.on = true; ph2.rings = Math.floor(rnd(3, 8)); ph2.t = 0; }
      if (ph2.on) {
        ph2.t += dt;
        const cyc = ph2.t % 5, ringing = cyc < 1;
        T(this.ringG.gain, ringing ? 1 : 0, 0.01);
        if (ph2.t > ph2.rings * 5) { ph2.on = false; ph2.next = now + rnd(15, 45); T(this.ringG.gain, 0, 0.02); }
        if (ringing && cyc < dt * 1.5) this.e.emit('mem', { kind: 'ring', at: now });
      }
    } else { ph2.on = false; ph2.next = now + rnd(2, 6); T(this.ringG.gain, 0, 0.05); }

    // radio
    const r = this.radio;
    if (now >= r.until) {
      r.station = !r.station && Math.random() < 0.6; r.until = now + (r.station ? rnd(3, 8) : rnd(2, 6));
      if (r.station) { let f = root; while (f < 180) f *= 2; this.radChord.forEach((o, i) => o.frequency.setValueAtTime(f * ATH.ratioAt(scale, [0, 2, 4][i]), now)); }
    }
    T(this.radBP.frequency, 500 + 2500 * (0.5 + 0.5 * Math.sin(t * 0.37) * Math.sin(t * 0.13 + 1)), 0.2);
    T(this.radN.gain, r.station ? 0.12 : 0.5, 0.3);
    T(this.radW.frequency, 800 + 2400 * (0.5 + 0.5 * Math.sin(t * 0.21)), 0.2);
    T(this.radWG.gain, r.station ? 0.005 : 0.03, 0.3);
    T(this.radS.gain, r.station ? 0.6 * (0.6 + 0.4 * Math.sin(t * 5)) : 0, 0.1);
    // ronzio: ogni tanto il neon sfarfalla
    T(this.buzzG.gain, Math.random() < 0.02 ? 0.25 : 0.02, 0.02);

    // treno
    const tr = this.train;
    if (L.m_treno > 0.01) {
      if (!tr.next) tr.next = now + rnd(1, 5);
      if (now >= tr.next && !tr.dur) {
        tr.start = now; tr.dur = rnd(16, 26); tr.clack = now + tr.dur * 0.25;
        this.e.emit('mem', { kind: 'train', at: now, dur: tr.dur });
        if (Math.random() < 0.6) {
          const ht = now + tr.dur * 0.35;
          [311, 370, 466].forEach(f => { const o = this.c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = this.filt('lowpass', 900), g = this.G(0);
            g.gain.setValueAtTime(0, ht); g.gain.linearRampToValueAtTime(0.05, ht + 0.1); g.gain.setValueAtTime(0.05, ht + 1.4); g.gain.linearRampToValueAtTime(0, ht + 2);
            this.chain([o, lp, g, this.lv.m_treno]); o.start(ht); o.stop(ht + 2.1); });
        }
      }
      if (tr.dur) {
        const k = (now - tr.start) / tr.dur;
        T(this.trainG.gain, k < 1 ? Math.pow(Math.sin(Math.PI * k), 2) * 1.2 : 0, 0.3);
        while (tr.clack < look && k > 0.2 && k < 0.85) {
          const a = Math.pow(Math.sin(Math.PI * k), 2);
          [0, 0.12].forEach(o => { this.tone(this.lv.m_treno, tr.clack + o, 85, 'sine', 0.35 * a, 0.003, 0.04, 0.3); this.burst(this.lv.m_treno, tr.clack + o, 0.02, 0.25 * a, 900, 0); });
          tr.clack += rnd(0.62, 0.8);
        }
        if (k >= 1) { tr.dur = 0; tr.next = now + rnd(25, 70); }
      }
    } else { tr.next = 0; tr.dur = 0; T(this.trainG.gain, 0, 0.3); }

    // festa oltre il muro
    if (L.m_festa > 0.01) {
      const pt = this.party; if (pt.next < now) pt.next = now + 0.05;
      const b = 60 / 118;
      let bass = root; while (bass > 90) bass /= 2; while (bass < 45) bass *= 2;
      while (pt.next < look) {
        const tt = pt.next;
        const o = this.c.createOscillator(); o.frequency.setValueAtTime(110, tt); o.frequency.exponentialRampToValueAtTime(45, tt + 0.1);
        const g = this.G(0); this.env(g, tt, 0.9, 0.002, 0.08); o.connect(g); g.connect(this.wall); o.start(tt); o.stop(tt + 0.4);
        const deg = [0, 0, 3, 4][Math.floor(pt.beat / 4) % 4];
        this.tone(this.wall, tt + b / 2, bass * ATH.ratioAt(scale, deg), 'sawtooth', 0.3, 0.005, 0.12, 0.4);
        if (pt.beat % 2 === 1) [0, 2, 4].forEach(k => this.tone(this.wall, tt, bass * 4 * ATH.ratioAt(scale, deg + k), 'sawtooth', 0.07, 0.005, 0.1, 0.35));
        pt.beat++; pt.next += b;
      }
    } else this.party.next = 0;

    // passanti
    if (L.m_passi > 0.01) {
      const ps = this.passer;
      if (!ps.next) ps.next = now + rnd(1, 4);
      if (now >= ps.next) {
        const n = Math.floor(rnd(9, 17)), gap = rnd(0.48, 0.62), dir = Math.random() < 0.5 ? 1 : -1;
        for (let i = 0; i < n; i++) {
          const k = i / (n - 1), a = Math.sin(Math.PI * k);
          this.step(now + 0.1 + i * gap, this.terrain, 0.25 + a * 0.75, dir * (k * 1.6 - 0.8), this.lv.m_passi);
        }
        ps.next = now + n * gap + rnd(6, 22) * (1.3 - L.m_passi);
      }
    } else this.passer.next = 0;
  };
})(window.ATH);
