/* ATHANOR — figure del viaggio: i fuochi fatui, la strada che va verso il
   nulla, il germoglio che cresce, il ghiaccio che si incrina, una porta con
   la luce dietro.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const D = ATH.Dream.prototype;
  const p0 = D.drawPlus;

  D.drawPlus = function (b, S, dt, W, H, cx, cy, R0, kT, A, B, t) {
    p0.call(this, b, S, dt, W, H, cx, cy, R0, kT, A, B, t);
    const mf = k => (S.motif && S.motif[k]) || 0;
    const sW = this.spr('w', '255,255,255');
    b.globalCompositeOperation = 'lighter'; b.lineWidth = 1;

    // —— i fuochi fatui: fiammelle azzurre che vagano a mezz'aria
    const wi = mf('wisps');
    if (wi > 0.02) {
      this.wisps = this.wisps || Array.from({ length: 9 }, () => ({ x: Math.random(), y: rnd(0.25, 0.6), ph: rnd(0, TAU), sp: rnd(0.02, 0.05), life: Math.random(), dur: rnd(8, 18) }));
      const glow = this.spr('e', '140,210,255');
      this.wisps.forEach(w => {
        w.life += dt / w.dur; if (w.life > 1) { w.life = 0; w.x = Math.random(); w.y = rnd(0.25, 0.6); }
        w.x += Math.sin(t * w.sp * 6 + w.ph) * 0.0006; w.y += Math.cos(t * w.sp * 4 + w.ph) * 0.0004 - 0.00008;
        const a = Math.sin(Math.PI * w.life) * wi * (0.75 + 0.25 * Math.sin(t * 7 + w.ph)), x = w.x * W, y = w.y * H, s = 9 + 4 * Math.sin(t * 3 + w.ph);
        b.globalAlpha = a * 0.35; b.drawImage(glow, x - s * 1.8, y - s * 2, s * 3.6, s * 3.6);
        b.globalAlpha = Math.min(1, a * 1.1); b.fillStyle = 'rgba(200,240,255,1)';
        b.beginPath(); b.moveTo(x, y - s * 1.4); b.quadraticCurveTo(x + s * 0.6, y - s * 0.2, x, y + s * 0.4); b.quadraticCurveTo(x - s * 0.6, y - s * 0.2, x, y - s * 1.4); b.fill();
        // il riflesso sulla ghiaia
        b.globalAlpha = a * 0.12; b.drawImage(glow, x - s * 2, H * 0.62 - s * 0.4, s * 4, s * 0.8);
      });
    }

    // —— la strada verso il nulla: due bordi che si stringono fino all'orizzonte
    const pa = mf('path');
    if (pa > 0.02) {
      const hy = H * 0.42, vx = cx + Math.sin(t * 0.03) * W * 0.02;
      b.strokeStyle = `rgba(${A},1)`;
      { const g = b.createLinearGradient(0, 0, W, 0); g.addColorStop(0, `rgba(${A},0)`); g.addColorStop(0.5, `rgba(${A},${(pa * 0.1).toFixed(3)})`); g.addColorStop(1, `rgba(${A},0)`); b.globalAlpha = 1; b.strokeStyle = g; b.beginPath(); b.moveTo(0, hy); b.lineTo(W, hy); b.stroke(); b.strokeStyle = `rgba(${A},1)`; }
      b.globalAlpha = pa * 0.22; b.beginPath();
      b.moveTo(vx - 3, hy); b.quadraticCurveTo(vx - W * 0.06, hy + (H - hy) * 0.5, vx - W * 0.32, H);
      b.moveTo(vx + 3, hy); b.quadraticCurveTo(vx + W * 0.07, hy + (H - hy) * 0.5, vx + W * 0.34, H); b.stroke();
      // le righe della mezzeria che scorrono verso di te
      for (let k = 0; k < 8; k++) {
        const z = ((k / 8 + t * 0.03) % 1), yy = hy + (H - hy) * z * z, l = 2 + z * z * 26;
        b.globalAlpha = pa * 0.25 * z; b.beginPath(); b.moveTo(vx, yy); b.lineTo(vx, yy + l); b.stroke();
      }
      this.tufts = this.tufts || Array.from({ length: 40 }, () => ({ u: Math.random(), v: Math.random() }));
      this.tufts.forEach(f => { const yy = hy + (H - hy) * f.v * f.v, side = f.u < 0.5 ? -1 : 1, xx = vx + side * (W * 0.08 + f.v * f.v * W * 0.5) * (0.4 + f.u); b.globalAlpha = pa * 0.15 * f.v; b.beginPath(); b.moveTo(xx, yy); b.lineTo(xx - 2, yy - 3 - f.v * 6); b.moveTo(xx, yy); b.lineTo(xx + 2, yy - 3 - f.v * 6); b.stroke(); });
    }

    // —— il germoglio: steli che salgono piano e si aprono
    const sp = mf('sprout');
    if (sp > 0.02) {
      this.grow = Math.min(1, (this.grow || 0) + dt / 25);
      if (sp < 0.05) this.grow = 0;
      this.stems = this.stems || Array.from({ length: 7 }, (_, i) => ({ x: 0.3 + i * 0.07 + rnd(-0.02, 0.02), h: rnd(0.12, 0.3), ph: rnd(0, TAU), d: rnd(0, 0.4) }));
      this.stems.forEach(s => {
        const g = Math.max(0, Math.min(1, (this.grow - s.d) / 0.6)); if (g <= 0) return;
        const x0 = s.x * W, y0 = H * 0.66, top = y0 - s.h * H * g, sw = Math.sin(t * 0.6 + s.ph) * 8 * g;
        b.globalAlpha = sp * 0.5; b.strokeStyle = 'rgba(170,230,150,1)'; b.lineWidth = 1.5;
        b.beginPath(); b.moveTo(x0, y0); b.quadraticCurveTo(x0 + sw * 0.3, (y0 + top) / 2, x0 + sw, top); b.stroke(); b.lineWidth = 1;
        if (g > 0.5) { const lk = (g - 0.5) * 2, ly = (y0 + top) / 2; b.globalAlpha = sp * 0.4 * lk; b.fillStyle = 'rgba(170,230,150,1)';
          b.beginPath(); b.ellipse(x0 + sw * 0.4 + 7 * lk, ly, 7 * lk, 2.5 * lk, -0.5, 0, TAU); b.fill(); b.beginPath(); b.ellipse(x0 + sw * 0.6 - 7 * lk, ly - 14, 6 * lk, 2.2 * lk, 0.5, 0, TAU); b.fill(); }
        b.globalAlpha = sp * 0.5 * g; b.drawImage(this.spr('e', '220,255,190'), x0 + sw - 8, top - 8, 16, 16);
      });
    } else this.grow = 0;

    // —— il ghiaccio: crepe sottili, e ogni tanto una che canta e si accende
    const ic = mf('ice');
    if (ic > 0.02) {
      this.cracksI = this.cracksI || Array.from({ length: 14 }, () => { const pts = []; let x = Math.random() * W, y = rnd(0.45, 0.95) * H, a = rnd(-0.4, 0.4); for (let k = 0; k < 9; k++) { pts.push([x, y]); a += rnd(-0.6, 0.6); x += Math.cos(a) * rnd(20, 60); y += Math.sin(a) * rnd(5, 18); } return { pts, lit: 0 }; });
      if (Math.random() < 0.01) this.cracksI[Math.floor(Math.random() * this.cracksI.length)].lit = 1;
      b.strokeStyle = 'rgba(220,240,255,1)';
      this.cracksI.forEach(c => {
        c.lit *= Math.pow(0.25, dt);
        b.globalAlpha = ic * (0.12 + c.lit * 0.6); b.beginPath(); c.pts.forEach(([x, y], k) => k ? b.lineTo(x, y) : b.moveTo(x, y)); b.stroke();
      });
      for (let i = 0; i < 10; i++) if (Math.random() < 0.3) { b.globalAlpha = ic * 0.5; b.drawImage(sW, Math.random() * W, rnd(0.4, 1) * H, 2, 2); }
    }

    // —— una porta, sola, con la luce dietro
    const dr = mf('door');
    if (dr > 0.02) {
      const dw = Math.min(W * 0.11, 90), dh = dw * 2.2, x = cx + R0 * 1.4, y = H * 0.62 - dh, fl = 0.9 + 0.1 * Math.sin(t * 2.3) + rnd(-0.02, 0.02);
      const warm = this.spr('e', '255,200,130');
      b.globalAlpha = dr * 0.18 * fl; b.drawImage(warm, x - dw * 1.2, y - dh * 0.2, dw * 3.4, dh * 1.5);
      b.globalCompositeOperation = 'source-over'; b.globalAlpha = dr * 0.6; b.fillStyle = `rgb(${S.rgbBg})`; b.fillRect(x, y, dw, dh); b.globalCompositeOperation = 'lighter';
      b.globalAlpha = dr * 0.55 * fl; b.strokeStyle = 'rgba(255,214,150,1)'; b.lineWidth = 1.5; b.strokeRect(x, y, dw, dh); b.lineWidth = 1;
      b.globalAlpha = dr * fl; b.fillStyle = 'rgba(255,224,170,1)'; b.fillRect(x + 1, y + dh - 3, dw - 2, 3); b.globalAlpha = dr * 0.5 * fl; b.drawImage(warm, x - dw * 0.3, y + dh - dw * 0.4, dw * 1.6, dw * 0.8);
      // la lama di luce sul pavimento
      const g = b.createLinearGradient(0, y + dh, 0, y + dh + dh * 0.5);
      g.addColorStop(0, `rgba(255,210,150,${(dr * 0.22 * fl).toFixed(3)})`); g.addColorStop(1, 'rgba(255,210,150,0)');
      b.globalAlpha = 1; b.fillStyle = g; b.beginPath(); b.moveTo(x, y + dh); b.lineTo(x + dw, y + dh); b.lineTo(x + dw * 1.8, y + dh * 1.5); b.lineTo(x - dw * 0.8, y + dh * 1.5); b.closePath(); b.fill();
      b.globalAlpha = dr * 0.8 * fl; b.drawImage(sW, x + dw * 0.82, y + dh * 0.52, 3, 3);
    }
    b.globalAlpha = 1; b.globalCompositeOperation = 'lighter';
  };
})(window.ATH);
