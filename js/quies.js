/* ATHANOR — QUIES, la quiete: velo di accordi lenti, coro lontano, coppe che
   cantano, battimento binaurale. Suona su un bus pulito che non passa
   dall'Alambicco.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const TAU = Math.PI * 2;

  class Quies {
    constructor(e) {
      this.e = e;
      const c = this.c = e.ctx;
      const G = v => { const g = c.createGain(); g.gain.value = v === undefined ? 1 : v; return g; };
      this.G = G;
      this.t = 0;

      // —— velo di luce: sei voci, triangolo + sinusoide + un filo di dente di sega
      this.padFilter = c.createBiquadFilter(); this.padFilter.type = 'lowpass'; this.padFilter.Q.value = 0.6; this.padFilter.frequency.value = 1200;
      this.padFilter.connect(e.quietIn);
      const pans = [-0.7, 0.6, -0.3, 0.35, -0.05, 0.8];
      this.pad = [];
      for (let i = 0; i < 6; i++) {
        const a = c.createOscillator(); a.type = 'triangle';
        const b = c.createOscillator(); b.type = 'sine';
        const s = c.createOscillator(); s.type = 'sawtooth';
        const gs = G(0.07), vg = G(0), pan = c.createStereoPanner(); pan.pan.value = pans[i];
        a.connect(vg); b.connect(vg); s.connect(gs); gs.connect(vg); vg.connect(pan); pan.connect(this.padFilter);
        [a, b, s].forEach(o => { o.frequency.value = 220; o.start(); });
        this.pad.push({ a, b, s, vg, ph: Math.random() * TAU, f: 220 });
      }
      // —— coro: voci acute sinusoidali con vibrato, un'ottava sopra
      this.choirBus = G(0);
      this.choirFilter = c.createBiquadFilter(); this.choirFilter.type = 'bandpass'; this.choirFilter.frequency.value = 1100; this.choirFilter.Q.value = 0.6;
      this.choirBus.connect(this.choirFilter); this.choirFilter.connect(e.quietIn);
      this.vib = c.createOscillator(); this.vib.frequency.value = 5.2; this.vibG = G(4); this.vib.connect(this.vibG); this.vib.start();
      this.choir = [];
      for (let i = 0; i < 4; i++) {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 440;
        this.vibG.connect(o.detune);
        const g = G(0), pan = c.createStereoPanner(); pan.pan.value = [-0.5, 0.5, -0.15, 0.2][i];
        o.connect(g); g.connect(pan); pan.connect(this.choirBus); o.start();
        this.choir.push({ o, g, ph: Math.random() * TAU });
      }

      // —— coppe
      this.bowlBus = G(1); this.bowlBus.connect(e.quietIn);
      this.cantusBus = G(0); this.cantusBus.connect(e.quietIn);
      this.cantus = [0, 1, 2, 3].map(i => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 300; o.start();
        const g = G(i < 2 ? 0.5 : 0.18); o.connect(g); g.connect(this.cantusBus);
        return o;
      });

      // —— battimento binaurale: un tono per orecchio
      this.binL = c.createOscillator(); this.binR = c.createOscillator();
      this.binL.frequency.value = 180; this.binR.frequency.value = 186;
      const merger = c.createChannelMerger(2);
      this.binL.connect(merger, 0, 0); this.binR.connect(merger, 0, 1);
      this.binGain = G(0); merger.connect(this.binGain); this.binGain.connect(e.masterSum);
      this.binL.start(); this.binR.start();

      this.chordT = 999; this.deg = 0; this.chord = [0, 2, 4, 7, 9, 11];
    }

    T(p, v, tau) { this.e.T(p, v, tau); }

    newChord(scale) {
      const n = scale.length;
      const step = [-2, -1, 1, 2, 3][Math.floor(Math.random() * 5)];
      this.deg = ((this.deg + step) % n + n) % n;
      const d = this.deg;
      const spread = n <= 5 ? [0, 1, 2, 4, 5, 7] : [0, 2, 4, 7, 9, 11];
      this.chord = spread.map(k => d + k);
      this.emitChord = true;
    }

    bowl(f, res, pan) {
      const c = this.c, now = c.currentTime + 0.02;
      const D = 6 + res * 22;
      const partials = [1, 2.71, 5.15, 8.17], amps = [1, 0.45, 0.24, 0.12];
      const env = this.G(0), p = c.createStereoPanner(); p.pan.value = pan;
      env.connect(p); p.connect(this.bowlBus);
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.055, now + 0.012);
      env.gain.setTargetAtTime(0, now + 0.02, D / 6);
      let first = null;
      partials.forEach((r, i) => {
        for (let k = 0; k < 2; k++) {
          const o = c.createOscillator();
          o.frequency.value = Math.min(16000, f * r) + (k ? 0.6 + Math.random() * 2 : 0);
          const g = this.G(amps[i] * 0.5 * Math.pow(0.7, i));
          o.connect(g); g.connect(env);
          o.start(now); o.stop(now + D / (1 + i * 0.6) + 0.5);
          if (!first) first = o;
        }
      });
      first.onended = () => { try { env.disconnect(); p.disconnect(); } catch (e) { } };
      this.e.emit('bowl', { freq: f, pan });
    }

    apply(L, S, C, dt, root) {
      const t = (this.t += dt);
      const scale = ATH.SCALES[C.modus] || ATH.SCALES.pentatonico;
      if (this.lastModus !== C.modus) { this.lastModus = C.modus; this.chordT = 999; }
      const period = 40 - L.aurora * 34;
      if (!S.stasis) this.chordT += dt;
      if (this.chordT > period) { this.chordT = 0; this.newChord(scale); }

      let base = root; while (base < 110) base *= 2;
      const glide = 0.5 + (1 - L.aurora) * 2.5;
      const lvl = Math.pow(L.lumen, 1.4);
      this.pad.forEach((v, i) => {
        const f = base * ATH.ratioAt(scale, this.chord[i]);
        v.f = f;
        this.T(v.a.frequency, f, glide); this.T(v.b.frequency, f, glide); this.T(v.s.frequency, f, glide);
        const det = L.halitus * 16;
        this.T(v.a.detune, det * Math.sin(t * 0.11 + v.ph), 0.3);
        this.T(v.b.detune, -det * Math.cos(t * 0.07 + v.ph), 0.3);
        this.T(v.s.detune, det * 0.5, 0.3);
        const sw = 0.65 + 0.35 * Math.sin(t * (0.05 + i * 0.013) + v.ph);
        this.T(v.vg.gain, lvl * 0.1 * sw * (i > 3 ? 0.7 : 1), 0.4);
      });
      this.T(this.padFilter.frequency, 300 + L.velum * L.velum * 6000, 0.3);

      // coro: le note alte dell'accordo
      const cl = Math.pow(L.chorus, 1.3);
      this.T(this.choirBus.gain, cl * 0.6, 0.4);
      this.T(this.choirFilter.frequency, 600 + L.velum * 2400, 0.4);
      this.T(this.vibG.gain, 3 + L.halitus * 10, 0.3);
      this.choir.forEach((v, i) => {
        const f = base * 2 * ATH.ratioAt(scale, this.chord[i + 2]);
        this.T(v.o.frequency, f, glide * 1.2);
        this.T(v.g.gain, 0.06 * (0.5 + 0.5 * Math.sin(t * (0.09 + i * 0.03) + v.ph)), 0.5);
      });

      // coppe
      const oct = Math.pow(2, 1 + Math.min(2, Math.floor(L.altitudo * 3)));
      const rate = L.patera * L.patera * 0.25;
      if (Math.random() < rate * dt) {
        const idx = Math.floor(Math.random() * scale.length);
        this.bowl(base * oct * ATH.ratioAt(scale, idx) / 2, L.resonantia, Math.random() * 1.4 - 0.7);
      }
      const cf = base * oct / 2 * ATH.ratioAt(scale, this.chord[0]);
      this.T(this.cantus[0].frequency, cf, 1.5); this.T(this.cantus[1].frequency, cf + 1.1, 1.5);
      this.T(this.cantus[2].frequency, cf * 2.71, 1.5); this.T(this.cantus[3].frequency, cf * 2.71 + 1.7, 1.5);
      const sw = 0.55 + 0.45 * Math.sin(t * 0.21) * Math.sin(t * 0.083 + 1);
      this.T(this.cantusBus.gain, L.cantus * L.cantus * 0.07 * sw, 0.3);

      // binaurale
      const carrier = clamp(root * 2, 110, 260);
      const beat = ATH.UNDA[C.unda] || 6;
      this.T(this.binL.frequency, carrier, 0.5); this.T(this.binR.frequency, carrier + beat, 0.5);
      this.T(this.binGain.gain, L.somnus * L.somnus * 0.09, 0.3);
    }
  }

  ATH.Quies = Quies;
})(window.ATH);
