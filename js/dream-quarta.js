/* ATHANOR — figure della casa e dei morti: le cose ammassate nel ripostiglio,
   la carta da parati che si stacca, la macchinina rossa, il muro dei loculi,
   la fotografia ovale sulla lapide, la mano del nonno.
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
    const sA = this.spr('a', A), sW = this.spr('w', '255,255,255');

    // il ripostiglio: scatole ammassate, in controluce
    const cl = mf('clutter');
    if (cl > 0.02) {
      this.boxes = this.boxes || (() => { const a = []; for (let col = 0; col < 9; col++) { let y = 1; const n = 2 + Math.floor(Math.random() * 4); for (let k = 0; k < n; k++) { const h = rnd(0.07, 0.15); a.push({ x: col / 9 + rnd(-0.01, 0.01), w: rnd(0.07, 0.11), y: y - h, h }); y -= h + 0.004; } } return a; })();
      this.boxes.forEach((bx, i) => {
        const x = bx.x * W, y = bx.y * H, w = bx.w * W, h = bx.h * H;
        b.globalCompositeOperation = 'source-over'; b.globalAlpha = 0.6 * cl; b.fillStyle = `rgb(${S.rgbBg})`; b.fillRect(x, y, w, h);
        b.globalCompositeOperation = 'lighter'; b.globalAlpha = cl * 0.22; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1; b.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        if (i % 3 === 0) { b.beginPath(); b.moveTo(x, y + h * 0.3); b.lineTo(x + w, y + h * 0.3); b.stroke(); }
      });
    }

    // la carta da parati: un motivo a fiori sbiadito, con lembi strappati
    const wp = mf('wallpaper');
    if (wp > 0.02) {
      const step = Math.max(64, Math.min(W, H) / 8);
      this.tears = this.tears || Array.from({ length: 5 }, () => ({ x: Math.random(), y: rnd(0.05, 0.6), w: rnd(0.05, 0.14), h: rnd(0.15, 0.4) }));
      b.lineWidth = 1;
      for (let y = step / 2; y < H; y += step) for (let x = ((y / step) % 2) * step / 2; x < W; x += step) {
        const torn = this.tears.some(tr => x > tr.x * W && x < (tr.x + tr.w) * W && y > tr.y * H && y < (tr.y + tr.h) * H);
        if (torn) continue;
        // un motivo a losanghe con un piccolo fiore tondo al centro, sbiadito
        b.globalAlpha = wp * 0.035; b.strokeStyle = `rgba(${A},1)`;
        b.beginPath(); b.moveTo(x, y - step * 0.42); b.lineTo(x + step * 0.42, y); b.lineTo(x, y + step * 0.42); b.lineTo(x - step * 0.42, y); b.closePath(); b.stroke();
        b.globalAlpha = wp * 0.05;
        b.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; b.moveTo(x + Math.cos(a) * step * 0.11 + step * 0.05, y + Math.sin(a) * step * 0.11); b.arc(x + Math.cos(a) * step * 0.11, y + Math.sin(a) * step * 0.11, step * 0.05, 0, TAU); } b.stroke();
      }
      this.tears.forEach(tr => {
        b.globalAlpha = wp * 0.3; b.strokeStyle = `rgba(${B},1)`;
        b.beginPath(); const x = tr.x * W, y = tr.y * H, w = tr.w * W, h = tr.h * H;
        b.moveTo(x, y); for (let k = 0; k <= 6; k++) b.lineTo(x + w * (k / 6) + rnd(-3, 3), y + h * (0.7 + 0.3 * Math.sin(k * 2 + t * 0.2))); b.lineTo(x + w, y); b.stroke();
      });
    }

    // la macchinina rossa, sola, sotto una luce
    const tc = mf('toycar');
    if (tc > 0.02) {
      const s = R0 * 0.5, x = cx, y = cy + R0 * 0.35 + Math.sin(t * 0.4) * 2;
      b.globalAlpha = tc * 0.18 * kT * 2; b.drawImage(this.spr('e', '255,90,70'), x - s * 2.2, y - s * 1.6, s * 4.4, s * 3.2);
      b.globalCompositeOperation = 'source-over';
      b.globalAlpha = tc * 0.85; b.fillStyle = 'rgba(200,40,30,1)';
      b.beginPath(); b.moveTo(x - s, y); b.lineTo(x - s * 0.95, y - s * 0.16); b.lineTo(x - s * 0.35, y - s * 0.2); b.quadraticCurveTo(x - s * 0.1, y - s * 0.42, x + s * 0.25, y - s * 0.22); b.lineTo(x + s, y - s * 0.12); b.lineTo(x + s, y); b.closePath(); b.fill();
      b.fillStyle = `rgb(${S.rgbBg})`;
      [-0.62, 0.62].forEach(k => { b.beginPath(); b.arc(x + k * s, y + s * 0.02, s * 0.14, 0, TAU); b.fill(); });
      b.globalCompositeOperation = 'lighter';
      b.globalAlpha = tc * 0.5; b.strokeStyle = 'rgba(255,200,180,1)'; b.lineWidth = 1;
      [-0.62, 0.62].forEach(k => { b.beginPath(); b.arc(x + k * s, y + s * 0.02, s * 0.14, 0, TAU); b.stroke(); });
      b.globalAlpha = tc * (0.5 + 0.4 * Math.sin(t * 0.7)); b.drawImage(sW, x - s * 0.1 - 2, y - s * 0.34 - 2, 4, 4);
    }

    // il muro dei loculi, con le fotografie ovali
    const lo = mf('loculi');
    if (lo > 0.02) {
      const cols = W < 700 ? 5 : 9, rows = 4, cw = Math.min(W * 0.9 / cols, 150), ch = Math.min(H * 0.55 / rows, 110);
      const x0 = (W - cols * cw) / 2, y0 = H * 0.16;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = x0 + c * cw, y = y0 + r * ch, k = r * cols + c;
        b.globalAlpha = lo * 0.07; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1; b.strokeRect(x + 4, y + 4, cw - 8, ch - 8);
        b.globalAlpha = lo * 0.13; b.beginPath(); b.ellipse(x + cw / 2, y + ch * 0.4, cw * 0.11, ch * 0.18, 0, 0, TAU); b.stroke();
        b.globalAlpha = lo * 0.05; b.fillStyle = `rgba(${B},1)`; b.fill();
        if ((k * 7) % 5 === 0) { b.globalAlpha = lo * (0.4 + 0.3 * Math.sin(t * 5 + k)); b.drawImage(this.spr('e', '255,80,40'), x + cw * 0.8 - 5, y + ch * 0.78 - 5, 10, 10); }
      }
    }

    // la fotografia ovale sulla lapide
    const cm = mf('cameo');
    if (cm > 0.02) {
      const rx = R0 * 0.42, ry = R0 * 0.56, x = cx, y = cy;
      b.globalAlpha = cm * 0.16 * kT * 2; b.drawImage(sA, x - rx * 2.4, y - ry * 2, rx * 4.8, ry * 4);
      b.globalCompositeOperation = 'source-over'; b.globalAlpha = cm * 0.6; b.fillStyle = `rgb(${S.rgbBg})`;
      b.beginPath(); b.ellipse(x, y, rx, ry, 0, 0, TAU); b.fill();
      b.globalCompositeOperation = 'lighter';
      b.globalAlpha = cm * 0.6; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 2; b.beginPath(); b.ellipse(x, y, rx, ry, 0, 0, TAU); b.stroke();
      b.lineWidth = 1; b.globalAlpha = cm * 0.3; b.beginPath(); b.ellipse(x, y, rx * 1.12, ry * 1.1, 0, 0, TAU); b.stroke();
      // una sagoma appena accennata, senza lineamenti: la fotografia è consumata
      b.globalAlpha = cm * (0.16 + 0.05 * Math.sin(t * 0.3)); b.fillStyle = `rgba(${A},1)`;
      b.beginPath(); b.ellipse(x, y - ry * 0.18, rx * 0.36, ry * 0.32, 0, 0, TAU); b.fill();
      b.beginPath(); b.moveTo(x - rx * 0.8, y + ry * 0.85); b.quadraticCurveTo(x, y + ry * 0.05, x + rx * 0.8, y + ry * 0.85); b.closePath(); b.fill();
    }

    // la mano del nonno: un calore grande che scende piano e accarezza
    const hd = mf('hand');
    if (hd > 0.02) {
      const k = 0.5 + 0.5 * Math.sin(t * 0.35);
      const x = cx + Math.sin(t * 0.2) * R0 * 0.3, y = cy - R0 * (0.9 - k * 0.5), r = R0 * (1.5 + k * 0.3);
      b.globalAlpha = hd * (0.1 + k * 0.08) * kT * 2; b.drawImage(this.spr('e', '255,200,140'), x - r, y - r * 0.8, r * 2, r * 1.6);
      // polvere dorata che segue la carezza
      for (let i = 0; i < 18; i++) {
        const a = t * 0.3 + i * 0.35, rr = R0 * (0.4 + (i % 6) * 0.15);
        b.globalAlpha = hd * (0.3 + 0.3 * Math.sin(t + i)); b.drawImage(sW, x + Math.cos(a) * rr - 1.5, y + R0 * 0.5 + Math.sin(a) * rr * 0.4 - 1.5, 3, 3);
      }
    }
    b.globalAlpha = 1; b.globalCompositeOperation = 'lighter';
  };
})(window.ATH);
