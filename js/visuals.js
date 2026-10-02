/* ATHANOR — il crogiolo visivo. Disegna su una tela a bassa risoluzione che si
   sgretola quando il suono si sgretola (Contritio, Plumbum), con scie che durano
   quanto la Crypta.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const TAU = Math.PI * 2;
  const rgb = a => `${a[0] | 0},${a[1] | 0},${a[2] | 0}`;

  class Visuals {
    constructor(canvas) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.buf = document.createElement('canvas');
      this.b = this.buf.getContext('2d');
      this.parts = [];
      this.rings = [];
      this.bolts = [];
      this.flash = 0;
      this.rot = 0;
      this.t = 0;
      this.rfq = 0;
      this.freq = new Uint8Array(1024);
      this.wave = new Uint8Array(2048);
      this.dream = new ATH.Dream();
      this.centroid = 0.2; this.low = 0; this.level = 0;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.W = window.innerWidth; this.H = window.innerHeight; this.dpr = dpr;
      this.c.width = Math.max(1, Math.floor(this.W * dpr));
      this.c.height = Math.max(1, Math.floor(this.H * dpr));
      this.setRes(this.rfq || 1, true);
    }

    setRes(rf, force) {
      const q = Math.max(0.12, Math.round(rf * 8) / 8);
      if (!force && q === this.rfq) return;
      this.rfq = q;
      this.buf.width = Math.max(48, Math.floor(this.c.width * q));
      this.buf.height = Math.max(32, Math.floor(this.c.height * q));
      this.sx = this.buf.width / this.W; this.sy = this.buf.height / this.H;
    }

    bell(e) { this.rings.push({ life: 1, pan: e.pan, amp: e.amp, speed: 0.25 + Math.random() * 0.3 }); }
    strike(e) {
      this.flash = Math.min(1, this.flash + 0.7 * e.intensity);
      const pts = []; let x = Math.random() * this.W, y = -10;
      while (y < this.H * 0.8) { pts.push([x, y]); x += (Math.random() - 0.5) * 90; y += 20 + Math.random() * 50; }
      this.bolts.push({ pts, life: 1 });
    }

    // S = { L, sw, pal:{bg,accent,second}, w:[nig,alb,cit,rub], agit, presence, px, py, cx, cy, coag, analyser, phaseGlyph }
    frame(dt, S) {
      const b = this.b, L = S.L, w = S.w;
      dt *= 0.3 + (L.velocitas === undefined ? 0.5 : L.velocitas) * 1.4;
      this.t += dt;
      const t = this.t;
      // risoluzione: la tela si sgretola col suono
      const crush = Math.min(0.86, L.contritio * 0.95 + Math.max(0, L.plumbum - 0.45) * 0.7);
      this.setRes(1 - crush);
      const W = this.W, H = this.H;
      b.setTransform(this.sx, 0, 0, this.sy, 0, 0);

      const bg = S.pal.bg, ac = S.pal.accent, se = S.pal.second;
      const A = rgb(ac), B = rgb(se);

      // analisi
      let level = 0;
      if (S.analyser) {
        S.analyser.getByteFrequencyData(this.freq);
        S.analyser.getByteTimeDomainData(this.wave);
        for (let i = 2; i < 200; i++) level += this.freq[i];
        level /= 198 * 255;
      } else {
        for (let i = 0; i < this.freq.length; i++) this.freq[i] = 40 + 30 * Math.sin(i * 0.05 + t * 0.7) * Math.sin(t * 0.3 + i * 0.011);
        for (let i = 0; i < this.wave.length; i++) this.wave[i] = 128 + 22 * Math.sin(i * 0.02 + t) * Math.sin(i * 0.003 - t * 0.4);
        level = 0.18;
      }
      { let num = 0, den = 0, lo = 0;
        for (let i = 1; i < 480; i++) { const m = this.freq[i]; num += i * m; den += m; if (i < 24) lo += m; }
        this.centroid += ((den ? num / den / 480 : 0.2) - this.centroid) * 0.05;
        this.low += (lo / (23 * 255) - this.low) * 0.2;
        this.level = level; }

      // camminare: l'immagine avanza verso di te
      if (S.passage > 0.01) {
        b.save(); b.setTransform(1, 0, 0, 1, 0, 0);
        const cw = this.buf.width, ch = this.buf.height, z = 1 + 0.035 * S.passage;
        if (S.passDir) { b.globalAlpha = 0.9; b.drawImage(this.buf, 0, S.passDir * ch * 0.035 * S.passage, cw, ch); }
        else { b.globalAlpha = 0.9; b.drawImage(this.buf, cw * (1 - z) / 2, ch * (1 - z) / 2, cw * z, ch * z); }
        b.restore(); b.setTransform(this.sx, 0, 0, this.sy, 0, 0);
      }
      // scia: più cripta, più memoria
      const trail = Math.max(0.01, Math.min(0.45, (0.05 + (1 - L.crypta) * 0.15) * (1.7 - (L.vestigium === undefined ? 0.5 : L.vestigium) * 1.4)));
      b.globalCompositeOperation = 'source-over';
      b.fillStyle = `rgba(${rgb(bg)},${trail})`;
      b.fillRect(0, 0, W, H);

      const cx = S.cx, cy = S.cy;
      const R0 = Math.min(W, H) * (W < 600 ? 0.24 : 0.17) * (0.94 + level * 0.25);
      this.rot += dt * (0.02 + L.anima * 0.25 + (S.sw.retro ? -0.12 : 0)) * (1 + S.agit * 3);

      S.rgbA = A; S.rgbB = B; S.rgbBg = rgb(bg); S.low = this.low; S.trail = trail;
      this.dream.draw(b, S, dt, W, H, cx, cy, R0);
      if (S.passage > 0.01) {
        b.globalCompositeOperation = 'lighter'; b.lineWidth = 1;
        for (let i = 0; i < 26; i++) {
          const a = Math.random() * Math.PI * 2, r1 = Math.random() * Math.max(W, H) * 0.5, r2 = r1 + 30 + Math.random() * 120;
          b.strokeStyle = `rgba(${A},${0.25 * S.passage})`; b.beginPath();
          b.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); b.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); b.stroke();
        }
        b.globalCompositeOperation = 'source-over';
      }
      const crucA = S.sw.crucibulum === false ? 0 : 1 - (S.q || 0) * 0.75;
      b.globalAlpha = crucA;

      // glifo della fase, enorme e quasi invisibile
      b.save();
      b.translate(cx, cy); b.rotate(this.rot * -0.3);
      b.font = `${Math.round(R0 * 2.6)}px "IM Fell English", Georgia, serif`;
      b.textAlign = 'center'; b.textBaseline = 'middle';
      b.fillStyle = `rgba(${A},${0.025 + level * 0.03})`;
      b.fillText(S.phaseGlyph, 0, R0 * 0.08);
      b.restore();

      b.globalCompositeOperation = 'lighter';

      // astrolabio esterno
      const ticks = 96;
      b.lineWidth = 1;
      for (let i = 0; i < ticks; i++) {
        const a = -this.rot * 0.6 + i / ticks * TAU;
        const bin = 3 + Math.floor(Math.pow(i / ticks, 2) * 300);
        const m = this.freq[bin] / 255;
        const r1 = R0 * 1.75, r2 = r1 + 4 + m * R0 * 0.35 + (i % 8 === 0 ? 8 : 0);
        b.strokeStyle = `rgba(${B},${0.25 + m * 0.5})`;
        b.beginPath(); b.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        b.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); b.stroke();
      }

      // anello spettrale speculare: il serpente
      const N = 120, pts = [];
      for (let k = 0; k <= N; k++) {
        const bin = 2 + Math.floor(Math.pow(k / N, 2.2) * 420);
        const m = this.freq[bin] / 255;
        pts.push(R0 * (1 + m * 0.95 * (0.55 + L.solutio * 0.7)));
      }
      b.beginPath();
      for (let k = 0; k <= N; k++) { const a = this.rot + Math.PI * k / N - Math.PI / 2; const r = pts[k]; k ? b.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : b.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      for (let k = N; k >= 0; k--) { const a = this.rot - Math.PI * k / N - Math.PI / 2; const r = pts[k]; b.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      b.closePath();
      b.fillStyle = `rgba(${A},${(0.008 + level * 0.02) * Math.min(1, trail * 6)})`; b.fill();
      b.strokeStyle = `rgba(${A},${0.55 + level * 0.4})`; b.lineWidth = 1.3 + L.calcinatio * 1.5; b.stroke();

      // anello d'onda: l'oscilloscopio piegato in cerchio
      const M = 220, step = Math.floor(this.wave.length / M);
      b.beginPath();
      for (let i = 0; i <= M; i++) {
        const v = (this.wave[(i % M) * step] - 128) / 128;
        const a = -this.rot * 1.3 + i / M * TAU;
        const r = R0 * 0.6 + v * R0 * 0.45 * (1 + L.plica * 1.5);
        i ? b.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : b.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      b.strokeStyle = `rgba(${B},${0.5 + level * 0.4})`; b.lineWidth = 1; b.stroke();

      // raggi (Citrinitas)
      const wc = w[2] + L.saturnus * 0.3;
      if (wc > 0.05) {
        for (let i = 0; i < 36; i++) {
          const a = this.rot * 2 + i / 36 * TAU;
          const m = this.freq[6 + i * 9] / 255;
          if (m < 0.25) continue;
          const r1 = R0 * 1.05, r2 = R0 * (1.25 + m * 1.6);
          b.strokeStyle = `rgba(${A},${wc * m * 0.35})`; b.lineWidth = 1;
          b.beginPath(); b.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          b.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); b.stroke();
        }
      }

      // cerchi delle campane
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i];
        r.life -= dt * r.speed;
        if (r.life <= 0) { this.rings.splice(i, 1); continue; }
        const rad = R0 * (1 + (1 - r.life) * 3.2);
        const ox = cx + r.pan * R0 * 0.8;
        b.strokeStyle = `rgba(${A},${r.life * 0.45 * r.amp})`; b.lineWidth = 1 + r.life * 2;
        b.beginPath(); b.arc(ox, cy, rad, 0, TAU); b.stroke();
      }

      // particelle
      b.globalAlpha = 1 - (S.q || 0) * 0.55;
      const emit = (1 - (S.q || 0) * 0.5) * (0.6 + L.cinis * 3 + L.crepitus * 2.5 + S.agit * 16 + level * 6) * dt * 60;
      for (let i = 0; i < emit && this.parts.length < 1100; i++) {
        let x, y;
        if (S.presence > 0.2 && Math.random() < 0.35) { x = S.px * W + (Math.random() - 0.5) * 30; y = S.py * H + (Math.random() - 0.5) * 30; }
        else { const a = Math.random() * TAU, rr = R0 * (0.9 + Math.random() * 0.9); x = cx + Math.cos(a) * rr; y = cy + Math.sin(a) * rr; }
        this.parts.push({ x, y, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, life: 1, decay: 0.15 + Math.random() * 0.5, s: 0.8 + Math.random() * 1.8, h: Math.random() });
      }
      const k = dt * 60, mer = 0.5 + L.mercurius;
      const flick = w[3] > 0.2;
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        const ang = (Math.sin(p.x * 0.004 + t * 0.21) + Math.cos(p.y * 0.005 - t * 0.17)) * Math.PI;
        p.vx += Math.cos(ang) * 0.035 * mer * k; p.vy += Math.sin(ang) * 0.035 * mer * k;
        p.vy += (w[0] * 0.028 - w[1] * 0.024) * k;
        const dx = p.x - cx, dy = p.y - cy, d = Math.sqrt(dx * dx + dy * dy) + 1;
        p.vx += (-dy / d * w[2] * 0.06 + dx / d * w[3] * 0.045) * k;
        p.vy += (dx / d * w[2] * 0.06 + dy / d * w[3] * 0.045) * k;
        if (S.coag > 0.05) { p.vx -= dx / d * S.coag * 0.12 * k; p.vy -= dy / d * S.coag * 0.12 * k; }
        p.vx *= 0.965; p.vy *= 0.965;
        p.x += p.vx * k; p.y += p.vy * k;
        p.life -= dt * p.decay;
        if (p.life <= 0 || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) { this.parts.splice(i, 1); continue; }
        let al = p.life * 0.75;
        if (flick) al *= 1 - w[3] * 0.6 * Math.random();
        b.fillStyle = `rgba(${p.h < 0.6 ? A : B},${al})`;
        b.fillRect(p.x, p.y, p.s, p.s);
      }

      b.globalAlpha = 1;
      // crepitio: punti di brace
      const sparks = Math.floor(L.crepitus * L.crepitus * 14 * k);
      for (let i = 0; i < sparks; i++) {
        b.fillStyle = `rgba(${A},${0.3 + Math.random() * 0.6})`;
        b.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
      }

      // fulmini
      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const bo = this.bolts[i];
        bo.life -= dt * 2.2;
        if (bo.life <= 0) { this.bolts.splice(i, 1); continue; }
        b.strokeStyle = `rgba(255,250,240,${bo.life * 0.8})`; b.lineWidth = 1.5;
        b.beginPath(); bo.pts.forEach((q, j) => j ? b.lineTo(q[0], q[1]) : b.moveTo(q[0], q[1])); b.stroke();
      }
      b.globalCompositeOperation = 'source-over';
      if (this.flash > 0.01) {
        b.fillStyle = `rgba(${A},${this.flash * 0.3})`; b.fillRect(0, 0, W, H);
        this.flash *= Math.pow(0.02, dt);
      }

      // glitch del piombo: fette di immagine spostate
      const g = Math.max(0, L.plumbum - 0.2) + S.agit * 0.15 + (S.sw.mortificatio ? 0.1 : 0);
      if (g > 0.05 && Math.random() < g * 0.8) {
        b.setTransform(1, 0, 0, 1, 0, 0);
        const bh = this.buf.height, bw = this.buf.width;
        const n = 1 + Math.floor(g * 4);
        for (let i = 0; i < n; i++) {
          const y = Math.floor(Math.random() * bh), h = Math.max(1, Math.floor(Math.random() * bh * 0.06));
          const off = Math.floor((Math.random() - 0.5) * bw * 0.12 * g);
          b.drawImage(this.buf, 0, y, bw, h, off, y, bw, h);
        }
      }

      // sulla tela vera
      const c = this.ctx;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.imageSmoothingEnabled = this.rfq > 0.9;
      c.drawImage(this.buf, 0, 0, this.c.width, this.c.height);
      // le luci: soffuse, candele, spente
      const dk = S.dark || 0;
      if (dk > 0.01) {
        const cw = this.c.width, ch = this.c.height, d = this.dpr;
        const px = S.px * cw, py = S.py * ch, pr = (S.darkMode === 'spente' ? 150 : 260) * d * (0.6 + S.presence * 0.6);
        const g = c.createRadialGradient(px, py, pr * 0.15, px, py, pr);
        g.addColorStop(0, `rgba(0,0,0,${dk * 0.25})`); g.addColorStop(1, `rgba(0,0,0,${dk})`);
        c.globalCompositeOperation = 'source-over'; c.fillStyle = g; c.fillRect(0, 0, cw, ch);
        if (S.candleGlow > 0.01) {
          c.globalCompositeOperation = 'lighter';
          const fl = 0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 2.3);
          const g2 = c.createRadialGradient(cw / 2, ch * 1.05, 0, cw / 2, ch * 1.05, ch * 0.9);
          g2.addColorStop(0, `rgba(255,150,60,${0.22 * S.candleGlow * fl})`); g2.addColorStop(1, 'rgba(255,150,60,0)');
          c.fillStyle = g2; c.fillRect(0, 0, cw, ch);
          c.globalCompositeOperation = 'source-over';
        }
      }
    }
  }

  ATH.Visuals = Visuals;
})(window.ATH);
