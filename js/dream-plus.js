/* ATHANOR — figure della città verticale: la rosa di luce, il trono sopra le
   nuvole, le nebulose, la città e la città capovolta, le finestre accese, la
   scala a chiocciola, le candele e i lumini, le lapidi, il bosco, le voci, il
   vuoto, le lacrime, le crepe, il fiume, il mondo sommerso, la luce di chi
   arriva a salvarti.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const D = ATH.Dream.prototype;
  const WORDS = ['torna', 'chi c’è?', 'resta', 'vattene', 'ti ricordi?', 'non sei solo', 'dormi', 'svegliati', 'ci sei?', 'ti stavamo aspettando', 'non è colpa tua', 'è tardi', 'ascolta', 'qui'];

  const ev0 = D.event;
  D.event = function (e) {
    if (e.kind === 'whisper') { (this.words = this.words || []).push({ w: e.word || WORDS[Math.floor(Math.random() * WORDS.length)], x: e.pan < 0 ? rnd(0.05, 0.35) : rnd(0.6, 0.9), y: rnd(0.15, 0.7), life: 1 }); if (this.words.length > 12) this.words.shift(); return; }
    if (e.kind === 'thunder') { this.thunderFlash = 1; return; }
    if (e.kind === 'bubble') { (this.bub = this.bub || []).push({ x: rnd(0.1, 0.9), y: 1.05, r: rnd(2, 6), v: rnd(0.06, 0.15) }); return; }
    return ev0.call(this, e);
  };

  function initCity(self) {
    if (self.towers) return;
    self.towers = [];
    let x = -0.02;
    while (x < 1.02) { const w = rnd(0.03, 0.08); self.towers.push({ x, w, h: rnd(0.12, 0.55), lit: Array.from({ length: 60 }, () => Math.random()), ph: rnd(0, TAU) }); x += w + rnd(0.002, 0.012); }
    self.trees = Array.from({ length: 34 }, () => ({ x: Math.random(), w: rnd(4, 26), d: Math.random() }));
    self.tombs = Array.from({ length: 16 }, (_, i) => ({ x: 0.04 + i / 16 + rnd(-0.01, 0.01), y: rnd(0.66, 0.84), w: rnd(26, 46), h: rnd(40, 80), cross: Math.random() < 0.4, name: ATH.TOMB_NAMES[Math.floor(Math.random() * ATH.TOMB_NAMES.length)], years: (1880 + Math.floor(Math.random() * 90)) }));
    self.cracks = [];
  }

  D.drawPlus = function (b, S, dt, W, H, cx, cy, R0, kT, A, B, t) {
    const mf = k => (S.motif && S.motif[k]) || 0;
    initCity(this);
    const sW = this.spr('w', '255,255,255'), sA = this.spr('a', A), sB = this.spr('b', B);
    b.globalCompositeOperation = 'lighter';

    // la rosa di luce
    const ro = mf('rose');
    if (ro > 0.02) {
      for (let k = 1; k <= 9; k++) {
        const r = R0 * (0.35 + k * 0.32), rot = t * 0.03 * (k % 2 ? 1 : -1);
        b.globalAlpha = ro * (0.06 + 0.05 * Math.sin(t * 0.4 + k)); b.strokeStyle = `rgba(${k % 3 ? A : B},1)`; b.lineWidth = 1;
        b.beginPath(); b.arc(cx, cy, r, 0, TAU); b.stroke();
        const n = 6 + k * 4;
        for (let i = 0; i < n; i++) {
          const a = rot + i / n * TAU, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          b.globalAlpha = ro * (0.25 + 0.25 * Math.sin(t * 1.3 + i + k)); b.drawImage(sW, x - 2, y - 2, 4, 4);
        }
      }
      b.globalAlpha = ro * 0.18 * kT * 2; const rr = R0 * 1.6; b.drawImage(sA, cx - rr, cy - rr, rr * 2, rr * 2);
    }
    // nebulose
    const ne = mf('nebula');
    if (ne > 0.02) for (let k = 0; k < 5; k++) {
      const x = W * (0.2 + 0.15 * k + 0.05 * Math.sin(t * 0.03 + k)), y = H * (0.3 + 0.12 * Math.sin(k * 2.1 + t * 0.02)), r = Math.min(W, H) * (0.25 + 0.08 * k % 0.3);
      b.globalAlpha = ne * 0.05 * kT * 2; b.drawImage(k % 2 ? sB : sA, x - r, y - r, r * 2, r * 2);
    }
    // il trono: un mare di nuvole molto più in basso
    const th = mf('throne');
    if (th > 0.02) {
      const hz = H * 0.72;
      for (let k = 0; k < 7; k++) {
        b.globalAlpha = th * 0.12; b.strokeStyle = `rgba(${B},1)`; b.lineWidth = 1; b.beginPath();
        for (let x = 0; x <= W + 20; x += 20) { const y = hz + k * 14 + Math.sin(x * 0.006 + t * 0.15 + k) * 8 + Math.sin(x * 0.017 - t * 0.1) * 4; x ? b.lineTo(x, y) : b.moveTo(x, y); }
        b.stroke();
      }
      b.globalAlpha = th * 0.9; b.drawImage(sW, cx - 5, H * 0.18 - 5, 10, 10);
      b.globalAlpha = th * 0.15 * kT * 2; b.drawImage(sA, cx - 140, H * 0.18 - 140, 280, 280);
    }
    // la città, vista dal livello in cui sei
    const ci = mf('city'), cf = mf('cityFlip');
    if (ci > 0.02 || cf > 0.02) {
      const amt = Math.max(ci, cf), flip = cf > ci;
      const lv = S.levelN || 0, base = flip ? 0 : H * (1 + Math.max(0, lv - 0.5) * 0.18);
      b.save();
      if (flip) { b.translate(0, H * 0.02); }
      this.towers.forEach(tw => {
        const x = tw.x * W, w = tw.w * W, h = tw.h * H * (lv >= 2 ? 0.55 : 1);
        const top = flip ? h : base - h;
        b.globalCompositeOperation = 'source-over'; b.globalAlpha = 0.55 * amt; b.fillStyle = `rgb(${S.rgbBg})`;
        b.fillRect(x, flip ? 0 : top, w, h);
        b.globalCompositeOperation = 'lighter';
        b.globalAlpha = amt * 0.18; b.strokeStyle = `rgba(${B},1)`; b.lineWidth = 1; b.strokeRect(x + 0.5, (flip ? 0 : top) + 0.5, w - 1, h - 1);
        const cols = Math.max(1, Math.floor(w / 9)), rows = Math.floor(h / 13);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const v = tw.lit[(r * cols + c) % 60]; if (v > 0.35) continue;
          const on = 0.5 + 0.5 * Math.sin(t * 0.2 * v + tw.ph + c);
          b.globalAlpha = amt * (0.25 + 0.4 * on); b.fillStyle = `rgba(${A},1)`;
          const wy = flip ? h - 10 - r * 13 : top + 6 + r * 13;
          b.fillRect(x + 3 + c * 9, wy, 4, 6);
        }
      });
      b.restore();
    }
    // finestre accese, da vicino
    const wi = mf('windows');
    if (wi > 0.02) {
      const cols = W < 600 ? 8 : 16, rows = 8, gw = W / cols, gh = H * 0.055, top = H * 0.06;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const k = r * cols + c, v = Math.sin(k * 12.9898) * 43758.5453 % 1, on = Math.abs(v) < 0.55;
        if (!on) continue;
        const flick = 0.75 + 0.25 * Math.sin(t * (0.3 + Math.abs(v)) + k);
        const x = c * gw + gw * 0.2, y = top + r * gh * 1.25, w = gw * 0.6, h = gh;
        b.globalAlpha = wi * 0.13 * flick; b.fillStyle = `rgba(${Math.abs(v) < 0.2 ? B : A},1)`; b.fillRect(x, y, w, h);
        if (Math.abs(v) < 0.12) { // una sagoma
          b.globalCompositeOperation = 'source-over'; b.globalAlpha = wi * 0.5; b.fillStyle = `rgb(${S.rgbBg})`;
          const sx = x + w * (0.3 + 0.3 * Math.sin(t * 0.1 + k)); b.beginPath(); b.arc(sx, y + h * 0.42, h * 0.12, 0, TAU); b.fill(); b.fillRect(sx - h * 0.14, y + h * 0.55, h * 0.28, h * 0.45);
          b.globalCompositeOperation = 'lighter';
        }
      }
    }
    // la scala a chiocciola
    const st = mf('stairs');
    if (st > 0.02) {
      b.lineWidth = 1;
      for (let i = 0; i < 70; i++) {
        const a = i * 0.45 + t * 0.15, z = ((i / 70 + t * 0.012) % 1), r = R0 * (0.3 + z * 2.4);
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.45 - (z - 0.5) * H * 0.3;
        b.globalAlpha = st * 0.35 * z; b.strokeStyle = `rgba(${A},1)`;
        b.beginPath(); b.moveTo(x, y); b.lineTo(x + Math.cos(a + 1.57) * 18 * z, y + Math.sin(a + 1.57) * 8 * z); b.stroke();
      }
    }
    // candele e lumini
    const ca = mf('candles');
    if (ca > 0.02) {
      const names = mf('tombs') > 0.2 ? (S.lumini || []) : [];
      const n = Math.max(7, Math.min(24, 7 + names.length));
      const x0 = names.length ? 0.46 : 0.06, xw = names.length ? 0.5 : 0.88;
      for (let i = 0; i < n; i++) {
        const x = W * (x0 + xw * (i + 0.5) / n), y = H * (0.9 - (i % 3) * 0.035);
        const fl = 0.75 + 0.25 * Math.sin(t * (7 + i) + i * 3) * Math.sin(t * 3.1 + i);
        b.globalAlpha = ca * 0.22 * fl * kT * 2.2; b.drawImage(this.spr('e', '255,170,80'), x - 34, y - 46, 68, 68);
        b.globalAlpha = ca * 0.95 * fl; b.fillStyle = 'rgba(255,214,140,1)';
        b.beginPath(); b.ellipse(x + Math.sin(t * 5 + i) * 0.8, y - 8, 2.3, 6 * fl, 0, 0, TAU); b.fill();
        b.globalAlpha = ca * 0.35; b.fillStyle = `rgba(${A},1)`; b.fillRect(x - 3, y - 2, 6, 14);
        const nm = names[i];
        if (nm) {
          b.globalCompositeOperation = 'source-over';
          b.globalAlpha = ca * 0.85; b.fillStyle = 'rgba(255,226,180,1)'; b.font = 'italic 13px "IM Fell English", Georgia, serif'; b.textAlign = 'center';
          b.fillText(nm, x, y - 30 - (i % 3) * 16);
          b.globalCompositeOperation = 'lighter';
        }
      }
    }
    // le lapidi
    const tb = mf('tombs');
    if (tb > 0.02) {
      if (S.tombName) this.tombs[S.tombIdx % this.tombs.length].name = S.tombName;
      this.tombs.forEach((tm, i) => {
        const x = tm.x * W, y = tm.y * H, w = tm.w, h = tm.h;
        b.globalCompositeOperation = 'source-over'; b.globalAlpha = 0.75 * tb; b.fillStyle = `rgb(${S.rgbBg})`;
        b.beginPath();
        if (tm.cross) { b.fillRect(x - 3, y - h, 6, h); b.fillRect(x - 14, y - h * 0.75, 28, 6); }
        else { b.moveTo(x - w / 2, y); b.lineTo(x - w / 2, y - h + w / 2); b.arc(x, y - h + w / 2, w / 2, Math.PI, 0); b.lineTo(x + w / 2, y); b.closePath(); b.fill(); }
        b.globalCompositeOperation = 'lighter'; b.globalAlpha = tb * 0.3; b.strokeStyle = `rgba(${B},1)`; b.lineWidth = 1; b.stroke();
        const lit = (S.tombIdx % this.tombs.length) === i;
        if (lit && !tm.cross) {
          b.globalCompositeOperation = 'source-over';
          b.globalAlpha = tb * (0.5 + 0.4 * Math.sin(t * 0.8)); b.fillStyle = `rgba(${A},1)`; b.font = 'italic 12px "IM Fell English", Georgia, serif'; b.textAlign = 'center';
          b.fillText(tm.name.length > 14 ? tm.name.split(' ')[0] : tm.name, x, y - h * 0.5);
          b.globalCompositeOperation = 'lighter';
        }
        b.globalAlpha = tb * 0.6 * (0.7 + 0.3 * Math.sin(t * 6 + i)); b.drawImage(this.spr('e', '255,80,40'), x + w * 0.4 - 6, y - 8, 12, 12);
      });
    }
    // il bosco
    const fo = mf('forest');
    if (fo > 0.02) {
      this.trees.forEach(tr => {
        const x = ((tr.x + t * 0.004 * (0.3 + tr.d)) % 1.1 - 0.05) * W, w = tr.w * (0.4 + tr.d);
        b.globalCompositeOperation = 'source-over'; b.globalAlpha = fo * (0.35 + tr.d * 0.5); b.fillStyle = `rgb(${S.rgbBg})`; b.fillRect(x, 0, w, H);
        b.globalCompositeOperation = 'lighter'; b.globalAlpha = fo * 0.08 * (1 - tr.d); b.fillStyle = `rgba(${B},1)`; b.fillRect(x, 0, 1, H);
      });
    }
    // le parole delle voci
    const wh = mf('whispers');
    if (this.words && this.words.length) {
      b.globalCompositeOperation = 'source-over'; b.textAlign = 'center';
      this.words.forEach(w => {
        w.life -= dt * 0.28; w.y -= dt * 0.006;
        const a = Math.max(0, Math.sin(Math.PI * w.life)) * Math.max(0.35, wh);
        b.globalAlpha = a * 0.6; b.fillStyle = `rgba(${A},1)`; b.font = `italic ${Math.round(14 + (1 - w.life) * 10)}px "IM Fell English", Georgia, serif`;
        b.fillText(w.w, w.x * W + Math.sin(t * 2 + w.y * 9) * 3, w.y * H);
      });
      this.words = this.words.filter(w => w.life > 0);
      b.globalCompositeOperation = 'lighter';
    }
    // il vuoto
    const vo = mf('void');
    if (vo > 0.02) {
      b.globalCompositeOperation = 'source-over'; b.globalAlpha = vo * 0.08; b.fillStyle = `rgb(${S.rgbBg})`; b.fillRect(0, 0, W, H);
      b.globalCompositeOperation = 'lighter';
      const x = cx + Math.sin(t * 0.07) * W * 0.2, y = cy + Math.cos(t * 0.05) * H * 0.1;
      b.globalAlpha = vo * (0.3 + 0.2 * Math.sin(t * 0.5)); b.drawImage(sW, x - 2, y - 2, 4, 4);
    }
    // lacrime sullo schermo
    const te = mf('tears');
    if (te > 0.02) {
      this.tearPool = this.tearPool || Array.from({ length: 10 }, () => ({ x: Math.random(), y: rnd(-0.5, 0), v: rnd(0.008, 0.03), w: rnd(0.3, 1) }));
      this.tearPool.forEach(d => {
        d.y += d.v * dt * (0.5 + Math.random()); if (d.y > 1.1) { d.y = rnd(-0.4, 0); d.x = Math.random(); }
        const x = d.x * W + Math.sin(d.y * 20) * 3, y = d.y * H;
        b.globalAlpha = te * 0.2; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 2 * d.w; b.beginPath(); b.moveTo(x, y - 60); b.lineTo(x, y); b.stroke();
        b.globalAlpha = te * 0.6; b.drawImage(sW, x - 3, y - 3, 6, 6);
      });
    }
    // le crepe
    const cr = mf('cracks');
    if (cr > 0.02) {
      if (this.cracks.length < 26 && Math.random() < cr * 0.04) {
        const p = this.cracks.length && Math.random() < 0.7 ? this.cracks[Math.floor(Math.random() * this.cracks.length)] : { x2: Math.random() * W, y2: Math.random() * H, a: Math.random() * TAU };
        const a = p.a + rnd(-0.8, 0.8), l = rnd(30, 140);
        this.cracks.push({ x1: p.x2, y1: p.y2, x2: p.x2 + Math.cos(a) * l, y2: p.y2 + Math.sin(a) * l, a, k: 0 });
      }
      this.cracks.forEach(c => {
        c.k = Math.min(1, c.k + dt * 1.5);
        b.globalAlpha = cr * 0.55; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1.1;
        b.beginPath(); b.moveTo(c.x1, c.y1); b.lineTo(c.x1 + (c.x2 - c.x1) * c.k, c.y1 + (c.y2 - c.y1) * c.k); b.stroke();
      });
    } else if (this.cracks.length) this.cracks.length = 0;
    // il fiume
    const rv = mf('river');
    if (rv > 0.02) {
      for (let i = 0; i < 26; i++) {
        const y = H * (0.55 + i * 0.017), off = (t * (20 + i * 3) + i * 97) % (W + 300) - 150;
        b.globalAlpha = rv * 0.12 * (1 - i / 30); b.strokeStyle = `rgba(${i % 2 ? A : B},1)`; b.lineWidth = 1;
        b.beginPath(); b.moveTo(off, y); b.lineTo(off + 120 + i * 4, y + Math.sin(t + i) * 2); b.stroke();
      }
    }
    // sott'acqua: riflessi e bolle
    const uw = mf('underwater');
    if (uw > 0.02) {
      b.lineWidth = 1;
      for (let k = 0; k < 10; k++) {
        b.globalAlpha = uw * 0.07; b.strokeStyle = `rgba(${A},1)`; b.beginPath();
        for (let x = 0; x <= W + 20; x += 20) { const y = H * (0.05 + k * 0.05) + Math.sin(x * 0.012 + t * 0.9 + k * 1.7) * 10 + Math.sin(x * 0.03 - t * 1.3) * 4; x ? b.lineTo(x, y) : b.moveTo(x, y); }
        b.stroke();
      }
      for (let k = 0; k < 4; k++) {
        const x = W * (0.15 + k * 0.24) + Math.sin(t * 0.2 + k) * 40;
        const g = b.createLinearGradient(x, 0, x + 60, H);
        g.addColorStop(0, `rgba(${A},${uw * 0.08 * kT * 2})`); g.addColorStop(1, `rgba(${A},0)`);
        b.globalAlpha = 1; b.fillStyle = g; b.beginPath(); b.moveTo(x, 0); b.lineTo(x + 30, 0); b.lineTo(x + 160, H); b.lineTo(x + 70, H); b.closePath(); b.fill();
      }
    }
    if (this.bub && this.bub.length) {
      this.bub.forEach(p => { p.y -= p.v * dt; p.x += Math.sin(t * 3 + p.r) * 0.0005; b.globalAlpha = 0.5; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1; b.beginPath(); b.arc(p.x * W, p.y * H, p.r, 0, TAU); b.stroke(); });
      this.bub = this.bub.filter(p => p.y > -0.05);
    }
    // un lampo
    if (this.thunderFlash > 0.01) { b.globalAlpha = this.thunderFlash * 0.22; b.fillStyle = 'rgba(220,230,255,1)'; b.fillRect(0, 0, W, H); this.thunderFlash *= Math.pow(0.03, dt); }
    // qualcuno arriva: una luce che cresce da un lato
    const re = S.rescue || 0;
    if (re > 0.01) {
      const x = W * 0.92, y = H * 0.5, r = Math.max(W, H) * (0.15 + re * 0.9);
      b.globalAlpha = re * 0.35; b.drawImage(this.spr('e', '255,236,200'), x - r, y - r, r * 2, r * 2);
    }
    b.globalAlpha = 1; b.globalCompositeOperation = 'lighter';
  };
})(window.ATH);
