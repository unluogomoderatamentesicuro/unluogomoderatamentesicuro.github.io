/* ATHANOR — MEMORIA (quarta parte): stoviglie, il primo vagito, l'urlo nella
   stanza chiusa, il monitor che smette di battere.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const P = ATH.Memoria.prototype;
  Object.assign(ATH.MEM_CAL, { m_stoviglie: 3, m_vagito: 1 });
  const b0 = P.buildPlus, a0 = P.applyPlus;

  P.buildPlus = function () {
    b0.call(this);
    const c = this.c, G = this.G;
    this.dishes = { next: 0 };
    // il vagito: una voce piccola, acuta, a singhiozzi
    this.babyOut = this.filt('lowpass', 3400, 0.6); this.babyOut.connect(this.lv.m_vagito);
    this.baby = this.makeVoice(460, this.babyOut, 0.1, true);
    this.babyT = { next: 0, until: 0, on: false };
    // l'urlo: voce tirata + fiato, mandato dentro la fornace e contro i muri
    this.screamBus = G(0);
    const wall = this.filt('lowpass', 1800, 0.8);
    this.screamBus.connect(wall); wall.connect(this.e.masterSum);
    this.screamBus.connect(this.e.alembic);
    this.screamBus.connect(this.e.crypta);
    this.screamer = this.makeVoice(330, this.screamBus, 0, false);
    this.screamer.fs.forEach((b, k) => { b.frequency.value = [850, 1250, 2900][k]; b.Q.value = 4; });
    this.screaming = false;
    // il monitor piatto
    this.flatO = c.createOscillator(); this.flatO.frequency.value = 960; this.flatG = G(0);
    this.flatO.connect(this.flatG); this.flatG.connect(this.lv.m_monitor); this.flatO.start();
  };

  P.scream = function (on) {
    const now = this.c.currentTime, v = this.screamer;
    this.screaming = on;
    if (on) {
      v.o.frequency.cancelScheduledValues(now);
      v.o.frequency.setValueAtTime(v.f0 * 0.9, now);
      v.o.frequency.exponentialRampToValueAtTime(v.f0 * 1.6, now + 0.35);
      v.env.gain.setTargetAtTime(1, now, 0.03);
      this.screamBus.gain.setTargetAtTime(0.9, now, 0.05);
    } else {
      v.o.frequency.setTargetAtTime(v.f0 * 0.7, now, 0.25);
      v.env.gain.setTargetAtTime(0, now, 0.18);
      this.screamBus.gain.setTargetAtTime(0, now + 0.3, 0.6);
    }
    this.e.emit('mem', { kind: 'scream', on, at: now });
  };
  P.flat = function (on) { this.flatG.gain.setTargetAtTime(on ? 0.12 : 0, this.c.currentTime, on ? 0.05 : 1.5); };

  P.applyPlus = function (L, S, C, dt, root, scale, now, look) {
    a0.call(this, L, S, C, dt, root, scale, now, look);
    const t = this.t;
    // l'urlo trema e si spezza
    if (this.screaming) {
      const v = this.screamer;
      v.o.frequency.setTargetAtTime(v.f0 * (1.45 + 0.15 * Math.sin(t * 7) + rnd(-0.05, 0.05)), now, 0.06);
    }
    // stoviglie: piatti, posate, un bicchiere, l'acqua del lavandino
    if (L.m_stoviglie > 0.01 && now >= this.dishes.next) {
      const st = now + 0.03, k = Math.random(), pan = rnd(-0.7, 0.7);
      if (k < 0.45) { const f = rnd(2200, 4200); [1, 2.32, 4.1].forEach((m, i) => this.tone(this.lv.m_stoviglie, st, f * m, 'sine', [0.08, 0.04, 0.02][i], 0.001, 0.12 + Math.random() * 0.2, 1.2, pan)); }
      else if (k < 0.75) { for (let i = 0; i < 3; i++) this.burst(this.lv.m_stoviglie, st + i * rnd(0.03, 0.08), 0.008, rnd(0.15, 0.35), rnd(2500, 5000), pan); }
      else if (k < 0.9) { this.tone(this.lv.m_stoviglie, st, rnd(700, 1100), 'sine', 0.12, 0.002, 0.05, 0.3, pan); this.burst(this.lv.m_stoviglie, st, 0.02, 0.2, 1500, pan); }
      else { const s = this.src('pink', false), bp = this.filt('bandpass', 1800, 2), g = this.G(0), d = rnd(1.5, 3);
        g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(0.18, st + 0.2); g.gain.linearRampToValueAtTime(0, st + d);
        this.chain([s, bp, g, this.lv.m_stoviglie]); s.start(st, rnd(0, 2), d + 0.1); }
      this.dishes.next = now + rnd(0.4, 3) * (1.3 - L.m_stoviglie);
    }
    // vagito: ondate di pianto e respiri
    if (L.m_vagito > 0.01) {
      const b = this.babyT, v = this.baby;
      if (now >= b.until) { b.on = !b.on; b.until = now + (b.on ? rnd(3, 6) : rnd(2, 5)); }
      if (b.on && now >= b.next) {
        const st = now + 0.02, len = rnd(0.5, 1.1);
        v.fs.forEach((f, i) => f.frequency.setTargetAtTime([900, 1500, 3200][i], st, 0.02));
        v.o.frequency.setValueAtTime(v.f0 * 0.9, st); v.o.frequency.linearRampToValueAtTime(v.f0 * 1.25, st + len * 0.3); v.o.frequency.linearRampToValueAtTime(v.f0 * 0.85, st + len);
        v.env.gain.setTargetAtTime(0.45, st, 0.03); v.env.gain.setTargetAtTime(0, st + len * 0.85, 0.05);
        this.burst(this.lv.m_vagito, st + len + 0.05, 0.15, 0.08, 1500, 0.1);
        b.next = st + len + rnd(0.3, 0.6);
      } else if (!b.on) v.env.gain.setTargetAtTime(0, now, 0.15);
    } else this.baby.env.gain.setTargetAtTime(0, now, 0.2);
  };
})(window.ATH);
