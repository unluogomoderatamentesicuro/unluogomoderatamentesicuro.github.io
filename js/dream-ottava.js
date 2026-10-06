/* ATHANOR — figure delle feste e dei ricordi veri o inventati: le lucine di
   Natale, l'uovo enorme della bisnonna, il foglio della seduta con la
   monetina, le luci blu a bordo strada, e il nascondiglio sotto le coperte.
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

    // —— lucine di Natale: festoni in alto, e un albero fatto di luci
    const xm = mf('xmas');
    if (xm > 0.02) {
      const COL = ['255,80,60', '255,200,90', '90,200,120', '100,150,255', '255,240,200'];
      for (let s = 0; s < 3; s++) {
        const x0 = W * s / 3, x1 = W * (s + 1) / 3, y0 = H * 0.05, sag = H * 0.09;
        b.globalAlpha = xm * 0.12; b.strokeStyle = `rgba(${A},1)`; b.beginPath(); b.moveTo(x0, y0); b.quadraticCurveTo((x0 + x1) / 2, y0 + sag * 2, x1, y0); b.stroke();
        for (let k = 1; k < 12; k++) {
          const u = k / 12, x = x0 + (x1 - x0) * u, y = y0 + sag * 4 * u * (1 - u), c = COL[(k + s * 3) % COL.length];
          const on = 0.5 + 0.5 * Math.sin(t * (1.2 + (k % 3) * 0.7) + k * 2 + s);
          b.globalAlpha = xm * (0.25 + on * 0.6); b.drawImage(this.spr('e', c), x - 7, y - 5, 14, 14);
        }
      }
      const tx = W * (W < 700 ? 0.8 : 0.78), ty = H * 0.16, th = H * 0.38;
      for (let k = 0; k < 40; k++) {
        const r = k / 40, row = Math.floor(r * 10), w = th * 0.42 * (row + 1) / 10, x = tx + (((k * 37) % 17) / 16 - 0.5) * w * 2, y = ty + th * (row + 1) / 10;
        const on = 0.5 + 0.5 * Math.sin(t * 1.7 + k * 1.3);
        b.globalAlpha = xm * (0.2 + on * 0.5); b.drawImage(this.spr('e', COL[k % COL.length]), x - 5, y - 5, 10, 10);
      }
      b.globalAlpha = xm * (0.6 + 0.3 * Math.sin(t * 2)); b.drawImage(this.spr('e', '255,230,150'), tx - 10, ty - 10, 20, 20);
    }

    // —— l'uovo enorme: visto da molto in basso, come da bambini
    const eg = mf('egg');
    if (eg > 0.02) {
      const rx = Math.min(W * 0.2, R0 * 1.4), ry = rx * 1.35, x = cx + R0 * 0.2, y = H * 0.36;
      b.globalAlpha = eg * 0.2 * kT * 2; b.drawImage(this.spr('e', '230,200,255'), x - rx * 2, y - ry * 1.6, rx * 4, ry * 3.2);
      b.save(); b.beginPath(); b.ellipse(x, y, rx, ry, 0, 0, TAU); b.clip();
      for (let k = 0; k < 14; k++) {
        const yy = y - ry + (k / 14) * ry * 2, sh = 0.5 + 0.5 * Math.sin(t * 0.6 + k * 0.9);
        b.globalAlpha = eg * (0.04 + sh * 0.08); b.fillStyle = k % 2 ? 'rgba(220,200,255,1)' : 'rgba(255,230,200,1)';
        b.beginPath(); b.moveTo(x - rx, yy); b.quadraticCurveTo(x, yy + ry * 0.12 * Math.sin(k), x + rx, yy - 6); b.lineTo(x + rx, yy + ry / 14 + 2); b.lineTo(x - rx, yy + ry / 14 + 2); b.fill();
      }
      b.restore();
      b.globalAlpha = eg * 0.5; b.strokeStyle = 'rgba(240,220,255,1)'; b.beginPath(); b.ellipse(x, y, rx, ry, 0, 0, TAU); b.stroke();
      // il fiocco
      b.globalAlpha = eg * 0.6; b.strokeStyle = 'rgba(200,120,220,1)'; b.lineWidth = 2;
      b.beginPath(); b.ellipse(x - rx * 0.22, y - ry * 1.02, rx * 0.22, rx * 0.1, -0.4, 0, TAU); b.ellipse(x + rx * 0.22, y - ry * 1.02, rx * 0.22, rx * 0.1, 0.4, 0, TAU); b.stroke(); b.lineWidth = 1;
      b.globalAlpha = eg * (0.6 + 0.3 * Math.sin(t * 1.3)); b.drawImage(sW, x - rx * 0.45, y - ry * 0.5, 4, 4);
    }

    // —— la seduta: le lettere in cerchio, la monetina che si muove da sola
    const bd = mf('board');
    if (bd > 0.02) {
      const L = 'ABCDEFGHILMNOPQRSTUVZ', R = Math.min(W, H) * 0.24;
      this.coin = this.coin || { a: 0, target: 0, wait: 2 };
      const c = this.coin; c.wait -= dt;
      if (c.wait < 0) { c.target = Math.floor(Math.random() * L.length); c.wait = rnd(3, 7); }
      const ta = c.target / L.length * TAU - Math.PI / 2; let da = ((ta - c.a + Math.PI * 3) % TAU) - Math.PI; c.a += da * Math.min(1, dt * 0.5);
      b.globalCompositeOperation = 'source-over'; b.textAlign = 'center'; b.font = `${Math.round(Math.max(12, R * 0.09))}px "IM Fell English SC", Georgia, serif`;
      for (let i = 0; i < L.length; i++) {
        const a = i / L.length * TAU - Math.PI / 2, near = Math.max(0, 1 - Math.abs(((a - c.a + Math.PI * 3) % TAU) - Math.PI) * 3);
        b.globalAlpha = bd * (0.18 + near * 0.6); b.fillStyle = `rgba(${A},1)`; b.fillText(L[i], cx + Math.cos(a) * R, cy + Math.sin(a) * R + 5);
      }
      b.globalAlpha = bd * 0.3; b.fillText('SÌ', cx - R * 1.35, cy - R * 0.9); b.fillText('NO', cx + R * 1.35, cy - R * 0.9);
      b.globalCompositeOperation = 'lighter';
      const px = cx + Math.cos(c.a) * R * 0.72, py = cy + Math.sin(c.a) * R * 0.72;
      b.globalAlpha = bd * 0.4; b.drawImage(this.spr('e', '255,200,140'), px - 16, py - 16, 32, 32);
      b.globalAlpha = bd * 0.7; b.strokeStyle = 'rgba(255,220,170,1)'; b.beginPath(); b.arc(px, py, 7, 0, TAU); b.stroke();
    }

    // —— le luci blu a bordo strada, che girano senza suono
    const sr = mf('siren');
    if (sr > 0.02) {
      const ph = (t * 1.6) % 2, a1 = Math.max(0, Math.sin(Math.PI * Math.min(1, ph))), a2 = Math.max(0, Math.sin(Math.PI * Math.max(0, ph - 1)));
      const x = W * 0.68, y = H * 0.4, blue = this.spr('e', '80,140,255');
      b.globalAlpha = sr * 0.35 * a1; b.drawImage(blue, x - 120, y - 60, 160, 120);
      b.globalAlpha = sr * 0.35 * a2; b.drawImage(blue, x - 40, y - 60, 160, 120);
      b.globalAlpha = sr * 0.08 * (a1 + a2); b.drawImage(blue, 0, y - H * 0.3, W, H * 0.6);
    }

    // —— il nascondiglio: coperte che fanno da tenda, una lucina calda, le tue cose
    const bl = mf('blanket');
    if (bl > 0.02) {
      const warm = this.spr('e', '255,190,130');
      b.globalAlpha = bl * 0.1 * kT * 2; b.drawImage(warm, cx - W * 0.6, cy - H * 0.3, W * 1.2, H * 0.9);
      b.strokeStyle = 'rgba(255,214,170,1)';
      for (let k = 0; k < 7; k++) {
        const sw = Math.sin(t * 0.3 + k) * 4;
        b.globalAlpha = bl * (0.12 - k * 0.012); b.beginPath();
        b.moveTo(-20, H * (0.1 + k * 0.035)); b.quadraticCurveTo(cx + sw * 3, -H * 0.12 + k * H * 0.05, W + 20, H * (0.1 + k * 0.035)); b.stroke();
        b.beginPath(); b.moveTo(W * 0.04 + k * 9, 0); b.quadraticCurveTo(W * (0.02 + k * 0.01) + sw, H * 0.4, W * 0.06 + k * 11, H); b.stroke();
        b.beginPath(); b.moveTo(W * 0.96 - k * 9, 0); b.quadraticCurveTo(W * (0.98 - k * 0.01) - sw, H * 0.4, W * 0.94 - k * 11, H); b.stroke();
      }
      // le lucine appese dentro la tenda
      for (let k = 0; k < 14; k++) {
        const u = (k + 0.5) / 14, x = W * (0.1 + u * 0.8), y = H * 0.12 + Math.sin(u * Math.PI) * H * 0.08, on = 0.6 + 0.4 * Math.sin(t * 0.9 + k * 1.7);
        b.globalAlpha = bl * on * 0.7; b.drawImage(warm, x - 8, y - 8, 16, 16);
      }
      // l'orsetto e la macchinina, appena accennati
      const gy = H * (W < 700 ? 0.56 : 0.5);
      b.globalAlpha = bl * 0.3; b.strokeStyle = `rgba(${A},1)`;
      b.beginPath(); b.arc(W * 0.24, gy - 30, 14, 0, TAU); b.moveTo(W * 0.24 + 22, gy); b.arc(W * 0.24, gy, 22, 0, TAU);
      b.moveTo(W * 0.24 - 6, gy - 44); b.arc(W * 0.24 - 10, gy - 42, 5, 0, TAU); b.moveTo(W * 0.24 + 15, gy - 42); b.arc(W * 0.24 + 10, gy - 42, 5, 0, TAU); b.stroke();
      b.beginPath(); b.moveTo(W * 0.7, gy + 8); b.lineTo(W * 0.7 + 8, gy - 6); b.lineTo(W * 0.7 + 30, gy - 8); b.lineTo(W * 0.7 + 44, gy + 8); b.closePath(); b.stroke();
      b.globalAlpha = bl * 0.25; b.fillStyle = 'rgba(200,60,50,1)'; b.fill();
    }
    b.globalAlpha = 1; b.globalCompositeOperation = 'lighter';
  };
})(window.ATH);
