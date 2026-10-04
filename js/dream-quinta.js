/* ATHANOR — figure dei nuovi quartieri: il sottoscala, i corridoi, l'altalena,
   gli alberi stretti, il lago con la luna dentro, le lucciole, la nebbia coi
   fari, il velo bianco, le vetrate, la sala giochi, le macchine ferme, la
   pellicola, la giostrina sopra la culla, le montagne, il fondo del mare, le
   gocce sul vetro.
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
    const sW = this.spr('w', '255,255,255'), sA = this.spr('a', A);
    const bg = `rgb(${S.rgbBg})`;
    const over = () => { b.globalCompositeOperation = 'source-over'; };
    const add = () => { b.globalCompositeOperation = 'lighter'; };
    add(); b.lineWidth = 1;

    // —— il sottoscala: i gradini visti da sotto, un triangolo di luce calda
    const nk = mf('nook');
    if (nk > 0.02) {
      const x0 = W * 0.08, y0 = H * 0.08, x1 = W * 0.92, y1 = H * 0.78, n = 11;
      b.globalAlpha = nk * 0.14 * kT * 2; b.drawImage(this.spr('e', '255,190,120'), W * 0.05, H * 0.35, W * 0.55, H * 0.7);
      b.globalAlpha = nk * 0.28; b.strokeStyle = `rgba(${A},1)`;
      b.beginPath();
      for (let i = 0; i <= n; i++) {
        const xa = x0 + (x1 - x0) * i / n, ya = y0 + (y1 - y0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n;
        if (i < n) { b.moveTo(xa, ya); b.lineTo(xb, ya); b.lineTo(xb, y0 + (y1 - y0) * (i + 1) / n); }
      }
      b.moveTo(x0, y0 + 14); b.lineTo(x1, y1 + 14); b.stroke();
      // polvere che cade dai gradini quando qualcuno passa sopra
      this.nookDust = this.nookDust || [];
      if (Math.random() < 0.03 * nk) { const k = Math.random(); for (let i = 0; i < 6; i++) this.nookDust.push({ x: x0 + (x1 - x0) * k + rnd(-10, 10), y: y0 + (y1 - y0) * k + 16, v: rnd(10, 30), l: 1 }); }
      this.nookDust.forEach(d => { d.y += d.v * dt; d.l -= dt * 0.25; b.globalAlpha = nk * 0.6 * Math.max(0, d.l); b.drawImage(sW, d.x - 1, d.y - 1, 2, 2); });
      this.nookDust = this.nookDust.filter(d => d.l > 0 && d.y < H);
      // la fessura della porta
      b.globalAlpha = nk * (0.35 + 0.05 * Math.sin(t * 0.7)); b.fillStyle = 'rgba(255,214,160,1)'; b.fillRect(W * 0.94, H * 0.25, 2, H * 0.62);
    }

    // —— i corridoi: una prospettiva di porte, il neon che sfarfalla
    const co = mf('corridor');
    if (co > 0.02) {
      const vx = cx, vy = cy - H * 0.04;
      b.strokeStyle = `rgba(${A},1)`;
      for (let k = 0; k < 7; k++) {
        const s = Math.pow(0.68, k), w = W * 0.48 * s, h = H * 0.46 * s;
        b.globalAlpha = co * 0.16 * (1 - k * 0.1);
        b.strokeRect(vx - w, vy - h, w * 2, h * 2);
        // le porte ai lati
        const dw = w * 0.22, dh = h * 1.3;
        b.strokeRect(vx - w * 0.98, vy + h - dh, dw * 0.6, dh); b.strokeRect(vx + w * 0.98 - dw * 0.6, vy + h - dh, dw * 0.6, dh);
      }
      b.globalAlpha = co * 0.1; b.beginPath();
      [[0, 0], [W, 0], [0, H], [W, H]].forEach(([x, y]) => { b.moveTo(x, y); b.lineTo(vx, vy); }); b.stroke();
      const fl = Math.random() < 0.06 ? 0.2 : 1;
      b.globalAlpha = co * 0.5 * fl; b.fillStyle = 'rgba(220,240,230,1)'; b.fillRect(vx - W * 0.08, vy - H * 0.36, W * 0.16, 2);
      b.globalAlpha = co * 0.12 * fl * kT * 2; b.drawImage(this.spr('e', '200,240,220'), vx - W * 0.3, vy - H * 0.5, W * 0.6, H * 0.4);
    }

    // —— l'altalena e lo scivolo, di ferro, sotto un cielo sbiadito
    const sg = mf('swing');
    if (sg > 0.02) {
      const gx = W * (W < 700 ? 0.3 : 0.36), gy = H * 0.64, fh = Math.min(H * 0.42, W * 0.4), fw = fh * 0.7;
      b.strokeStyle = 'rgba(214,150,100,1)'; b.lineWidth = 2; b.globalAlpha = sg * 0.4;
      b.beginPath();
      b.moveTo(gx - fw * 0.6, gy); b.lineTo(gx - fw * 0.45, gy - fh); b.lineTo(gx - fw * 0.3, gy);
      b.moveTo(gx + fw * 0.3, gy); b.lineTo(gx + fw * 0.45, gy - fh); b.lineTo(gx + fw * 0.6, gy);
      b.moveTo(gx - fw * 0.45, gy - fh); b.lineTo(gx + fw * 0.45, gy - fh); b.stroke();
      const amp = 0.35 + 0.15 * Math.sin(t * 0.05), ang = Math.sin(t * TAU / 3.1) * amp, L = fh * 0.78;
      const px = gx + Math.sin(ang) * L, py = gy - fh + Math.cos(ang) * L;
      b.lineWidth = 1; b.globalAlpha = sg * 0.45; b.strokeStyle = `rgba(${A},1)`;
      b.beginPath(); b.moveTo(gx - fw * 0.12, gy - fh); b.lineTo(px - fw * 0.12, py); b.moveTo(gx + fw * 0.12, gy - fh); b.lineTo(px + fw * 0.12, py); b.stroke();
      b.lineWidth = 3; b.beginPath(); b.moveTo(px - fw * 0.16, py); b.lineTo(px + fw * 0.16, py); b.stroke();
      // lo scivolo a razzo, più in là
      const sx = W * (W < 700 ? 0.72 : 0.7), sh = fh * 0.85;
      b.lineWidth = 1.5; b.strokeStyle = 'rgba(150,190,180,1)'; b.globalAlpha = sg * 0.3;
      b.beginPath(); b.moveTo(sx, gy); b.lineTo(sx, gy - sh); b.moveTo(sx + 14, gy); b.lineTo(sx + 14, gy - sh);
      for (let k = 1; k < 8; k++) { b.moveTo(sx, gy - sh * k / 8); b.lineTo(sx + 14, gy - sh * k / 8); }
      b.moveTo(sx + 14, gy - sh); b.quadraticCurveTo(sx + sh * 0.5, gy - sh * 0.6, sx + sh * 0.8, gy); b.stroke();
      b.lineWidth = 1;
      // ruggine: macchioline sparse
      this.rust = this.rust || Array.from({ length: 40 }, () => [Math.random(), Math.random()]);
      this.rust.forEach(([u, v]) => { b.globalAlpha = sg * 0.12; b.fillStyle = 'rgba(200,110,60,1)'; b.fillRect(gx - fw * 0.5 + u * fw, gy - fh + v * fh, 2, 2); });
    }

    // —— gli alberi stretti intorno
    const tr = mf('trees');
    if (tr > 0.02) {
      this.trunks = this.trunks || Array.from({ length: 26 }, (_, i) => ({ x: Math.random(), w: rnd(0.008, 0.035), layer: i % 3, ph: rnd(0, TAU) }));
      this.trunks.forEach(k => {
        const depth = [0.35, 0.65, 1][k.layer], x = (k.x + Math.sin(t * 0.03 + k.ph) * 0.004) * W, w = k.w * W * depth;
        over(); b.globalAlpha = tr * (0.08 + depth * 0.22); b.fillStyle = bg; b.fillRect(x - w / 2, 0, w, H);
        add(); b.globalAlpha = tr * 0.06 * depth; b.strokeStyle = `rgba(${A},1)`; b.strokeRect(x - w / 2, -2, w, H + 4);
      });
      // la luce che filtra dall'alto
      b.globalAlpha = tr * 0.06 * kT * 2; b.drawImage(sA, cx - W * 0.25, -H * 0.3, W * 0.5, H * 0.8);
    }

    // —— il lago di notte: l'orizzonte, il bosco nero, la luna dentro l'acqua
    const lk = mf('lake');
    if (lk > 0.02) {
      const hy = H * 0.42, mx = W * 0.62, my = H * 0.13;
      b.globalAlpha = lk * 0.5; b.drawImage(this.spr('e', '230,236,255'), mx - 22, my - 22, 44, 44);
      b.globalAlpha = lk * 0.9; b.drawImage(sW, mx - 5, my - 5, 10, 10);
      over(); b.globalAlpha = lk * 0.35; b.fillStyle = bg; b.beginPath(); b.moveTo(0, hy);
      for (let x = 0; x <= W; x += 10) b.lineTo(x, hy - 6 - Math.abs(Math.sin(x * 0.045) * 14 + Math.sin(x * 0.13) * 6));
      b.lineTo(W, hy); b.closePath(); b.fill(); add();
      b.globalAlpha = lk * 0.1; b.strokeStyle = `rgba(${A},1)`; b.beginPath(); b.moveTo(0, hy); b.lineTo(W, hy); b.stroke();
      for (let i = 0; i < 26; i++) {
        const yy = hy + 6 + i * (H - hy) / 28, w = (8 + i * 2.4) * (0.6 + 0.4 * Math.sin(t * 1.3 + i * 1.7));
        b.globalAlpha = lk * (0.35 - i * 0.011); b.fillStyle = 'rgba(230,236,255,1)'; b.fillRect(mx - w / 2 + Math.sin(t * 0.9 + i) * 3, yy, w, 1.5);
      }
      this.ripples = this.ripples || [];
      if (Math.random() < 0.01 * lk) this.ripples.push({ x: rnd(0.1, 0.9) * W, y: rnd(hy + 20, H * 0.7), r: 1 });
      this.ripples.forEach(r => { r.r += dt * 18; b.globalAlpha = lk * 0.25 * Math.max(0, 1 - r.r / 90); b.beginPath(); b.ellipse(r.x, r.y, r.r, r.r * 0.22, 0, 0, TAU); b.stroke(); });
      this.ripples = this.ripples.filter(r => r.r < 90);
    }

    // —— le lucciole
    const ff = mf('fireflies');
    if (ff > 0.02) {
      this.flies = this.flies || Array.from({ length: 46 }, () => ({ x: Math.random(), y: rnd(0.35, 0.95), vx: rnd(-0.01, 0.01), vy: rnd(-0.006, 0.006), ph: rnd(0, TAU), sp: rnd(0.8, 2) }));
      const spr = this.spr('e', '210,255,140');
      this.flies.forEach(f => {
        f.vx += rnd(-0.004, 0.004) * dt; f.vy += rnd(-0.004, 0.004) * dt; f.vx *= 0.995; f.vy *= 0.995;
        f.x += f.vx * dt; f.y += f.vy * dt; if (f.x < -0.05) f.x = 1.05; if (f.x > 1.05) f.x = -0.05; if (f.y < 0.3 || f.y > 0.98) f.vy *= -1;
        const k = Math.max(0, Math.sin(t * f.sp + f.ph)); if (k < 0.05) return;
        b.globalAlpha = ff * k * 0.8; b.drawImage(spr, f.x * W - 6, f.y * H - 6, 12, 12);
        b.globalAlpha = ff * k; b.drawImage(sW, f.x * W - 1, f.y * H - 1, 2, 2);
      });
    }

    // —— la nebbia, e ogni tanto due fari che arrivano e se ne vanno
    const fg = mf('fog');
    if (fg > 0.02) {
      for (let i = 0; i < 6; i++) {
        const yy = H * (0.25 + i * 0.13) + Math.sin(t * 0.07 + i * 2) * 20, hh = H * 0.22;
        const g = b.createLinearGradient(0, yy - hh / 2, 0, yy + hh / 2);
        const a = fg * (0.05 + 0.03 * Math.sin(t * 0.11 + i));
        g.addColorStop(0, `rgba(${A},0)`); g.addColorStop(0.5, `rgba(${A},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${A},0)`);
        b.globalAlpha = 1; b.fillStyle = g; b.fillRect(0, yy - hh / 2, W, hh);
      }
      this.lamps = this.lamps || { t: -1, next: 4 };
      const L = this.lamps; L.next -= dt;
      if (L.t < 0 && L.next < 0) { L.t = 0; L.dur = rnd(6, 10); L.side = Math.random() < 0.5 ? -1 : 1; }
      if (L.t >= 0) {
        L.t += dt; const x = L.t / L.dur, near = Math.pow(Math.sin(Math.PI * Math.min(1, x)), 2);
        const px = cx + L.side * (x - 0.5) * W * 0.9, py = H * 0.42 + near * H * 0.08, sp = 12 + near * 70, s = 14 + near * 110;
        const spr = this.spr('e', '255,230,180');
        b.globalAlpha = fg * near * 0.7; b.drawImage(spr, px - sp - s / 2, py - s / 2, s, s); b.drawImage(spr, px + sp - s / 2, py - s / 2, s, s);
        b.globalAlpha = fg * near * 0.2; b.drawImage(spr, px - s * 2, py - s, s * 4, s * 2);
        if (x >= 1) { L.t = -1; L.next = rnd(10, 26); }
      }
    }

    // —— il velo bianco: una forma distesa, due candele
    const vl = mf('veil');
    if (vl > 0.02) {
      const w = Math.min(W * 0.62, R0 * 3.4), h = w * 0.16, x = cx, y = cy + R0 * 0.25, br = Math.sin(t * 0.25) * 0.5;
      b.globalAlpha = vl * 0.18 * kT * 2; b.drawImage(this.spr('e', '240,230,220'), x - w * 0.8, y - h * 3, w * 1.6, h * 6);
      { over(); const g = b.createRadialGradient(x, y + h * 0.3, 0, x, y + h * 0.3, w * 0.7); g.addColorStop(0, `rgba(${S.rgbBg},${(vl * 0.6).toFixed(3)})`); g.addColorStop(1, `rgba(${S.rgbBg},0)`);
        b.globalAlpha = 1; b.fillStyle = g; b.fillRect(x - w * 0.8, y - w * 0.5, w * 1.6, w * 1.1); add(); }
      // il telo: una luce bianca appena, dentro il profilo
      b.globalAlpha = vl * 0.05; b.fillStyle = 'rgba(236,230,222,1)'; b.beginPath(); b.ellipse(x, y + h * 0.1, w * 0.55, h * 0.75, 0, 0, TAU); b.fill();
      b.strokeStyle = 'rgba(236,230,222,1)';
      // il profilo sotto il telo: la testa, il petto, i piedi
      b.globalAlpha = vl * 0.45; b.beginPath();
      b.moveTo(x - w * 0.55, y + h * 0.5);
      b.bezierCurveTo(x - w * 0.52, y - h * 0.9, x - w * 0.38, y - h * 0.9, x - w * 0.33, y - h * 0.1);
      b.bezierCurveTo(x - w * 0.2, y - h * 0.75, x + w * 0.05, y - h * 0.6, x + w * 0.2, y - h * 0.2);
      b.bezierCurveTo(x + w * 0.35, y - h * 0.15, x + w * 0.42, y - h * 0.7, x + w * 0.5, y - h * 0.5);
      b.lineTo(x + w * 0.56, y + h * 0.5); b.stroke();
      for (let k = 0; k < 6; k++) { b.globalAlpha = vl * 0.12; b.beginPath(); const fx = x - w * 0.45 + k * w * 0.18; b.moveTo(fx, y - h * 0.2); b.quadraticCurveTo(fx + w * 0.04, y + h * 0.4, fx + w * 0.02 + br, y + h * 1.1); b.stroke(); }
      // le candele
      [-1, 1].forEach(sd => {
        const kx = x + sd * w * 0.72, ky = y - h * 0.2, fl = 0.8 + 0.2 * Math.sin(t * 9 + sd) + rnd(-0.05, 0.05);
        b.globalAlpha = vl * 0.5; b.fillStyle = 'rgba(230,220,200,1)'; b.fillRect(kx - 2, ky, 4, h * 1.4);
        b.globalAlpha = vl * fl * 0.9; b.drawImage(this.spr('e', '255,190,110'), kx - 14, ky - 26, 28, 30);
        b.globalAlpha = vl * fl; b.drawImage(sW, kx - 1.5, ky - 8, 3, 6);
      });
    }

    // —— le vetrate: finestre a sesto acuto, piombi e colori, che tremano
    const vt = mf('vetrate');
    if (vt > 0.02) {
      const n = W < 700 ? 2 : 3, ww = Math.min(W * 0.16, 150), hh = Math.min(H * 0.62, ww * 3.2);
      this.gust = (this.gust || 0) * Math.pow(0.4, dt); if (Math.random() < 0.012) this.gust = rnd(0.5, 1);
      const COL = ['200,60,60', '60,90,200', '220,180,60', '60,160,110', '160,80,180'];
      for (let i = 0; i < n; i++) {
        const x = W * (i + 1) / (n + 1) - ww / 2, y = H * 0.12, jx = (Math.random() - 0.5) * 3 * this.gust;
        b.save(); b.translate(x + jx, y);
        b.beginPath(); b.moveTo(0, hh); b.lineTo(0, ww * 0.6); b.quadraticCurveTo(0, 0, ww / 2, -ww * 0.25); b.quadraticCurveTo(ww, 0, ww, ww * 0.6); b.lineTo(ww, hh); b.closePath();
        b.save(); b.clip();
        const rows = 14, cols = 4, ph = (hh + ww * 0.3) / rows, pw = ww / cols;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const k = (r * 7 + c * 3 + i + ((r * c) % 3)) % COL.length, j = this.gust * (Math.random() - 0.5) * 2;
          b.globalAlpha = vt * (0.035 + 0.025 * Math.sin(t * 0.5 + r * 0.7 + c * 1.3)); b.fillStyle = `rgba(${COL[k]},1)`;
          // losanghe di vetro, sfalsate
          const x0 = c * pw + (r % 2 ? pw / 2 : 0) + j, y0 = -ww * 0.3 + r * ph;
          b.beginPath(); b.moveTo(x0, y0); b.lineTo(x0 + pw / 2, y0 + ph / 2); b.lineTo(x0, y0 + ph); b.lineTo(x0 - pw / 2, y0 + ph / 2); b.closePath(); b.fill();
        }
        // i piombi
        b.globalAlpha = vt * 0.12; b.strokeStyle = `rgba(${A},1)`;
        b.beginPath(); for (let c = -cols; c <= cols * 2; c++) { b.moveTo(c * pw, -ww * 0.3); b.lineTo(c * pw + (hh + ww * 0.3) * pw / ph / 2, hh); b.moveTo(c * pw, -ww * 0.3); b.lineTo(c * pw - (hh + ww * 0.3) * pw / ph / 2, hh); } b.stroke();
        b.restore();
        b.globalAlpha = vt * 0.32; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1.5; b.stroke(); b.lineWidth = 1;
        b.restore();
        b.globalAlpha = vt * 0.06 * kT * 2; b.drawImage(this.spr('e', COL[i % COL.length]), x - ww, y + hh * 0.4, ww * 3, hh);
      }
    }

    // —— la sala giochi: schermi in fila, righe del tubo catodico, la scritta che lampeggia
    const ar = mf('arcade');
    if (ar > 0.02) {
      const n = W < 700 ? 3 : 5, sw = Math.min(W * 0.14, 130), sh = sw * 0.78, y = H * 0.38;
      const COL = ['120,220,255', '240,90,200', '255,210,90', '120,255,160', '255,120,90'];
      for (let i = 0; i < n; i++) {
        const x = W * (i + 0.5) / n - sw / 2, c = COL[i % COL.length];
        b.globalAlpha = ar * 0.16 * kT * 2; b.drawImage(this.spr('e', c), x - sw * 0.3, y - sh * 0.3, sw * 1.6, sh * 1.6);
        b.globalAlpha = ar * 0.35; b.strokeStyle = `rgba(${c},1)`; b.strokeRect(x, y, sw, sh);
        for (let k = 0; k < 6; k++) { if (Math.random() < 0.5) continue; b.globalAlpha = ar * 0.45; b.fillStyle = `rgba(${c},1)`; b.fillRect(x + 6 + Math.floor(Math.random() * 8) * (sw - 12) / 8, y + 6 + Math.floor(Math.random() * 6) * (sh - 12) / 6, (sw - 12) / 8 - 1, (sh - 12) / 6 - 1); }
      }
      over(); b.globalAlpha = ar * 0.06; b.fillStyle = '#000'; for (let yy = 0; yy < H; yy += 4) b.fillRect(0, yy, W, 1); add();
      if (Math.sin(t * 3) > 0) { b.globalAlpha = ar * 0.6; b.fillStyle = `rgba(${A},1)`; b.font = `${Math.round(Math.max(11, sw * 0.12))}px "Fragment Mono", monospace`; b.textAlign = 'center'; b.fillText('INSERT COIN', cx, y + sh + 34); }
    }

    // —— le macchine ferme: ingranaggi, una catena che pende
    const mc = mf('machine');
    if (mc > 0.02) {
      const gear = (x, y, r, teeth, rot) => {
        b.beginPath();
        for (let i = 0; i < teeth * 2; i++) { const a = rot + i / (teeth * 2) * TAU, rr = i % 2 ? r : r * 1.14; b.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        b.closePath(); b.stroke(); b.beginPath(); b.arc(x, y, r * 0.3, 0, TAU); b.stroke();
      };
      const rot = t * 0.004;
      b.strokeStyle = `rgba(${A},1)`; b.globalAlpha = mc * 0.22;
      gear(W * 0.3, H * 0.4, R0 * 0.9, 16, rot); gear(W * 0.3 + R0 * 1.55, H * 0.4 + R0 * 0.5, R0 * 0.55, 10, -rot * 1.6 + 0.2);
      gear(W * 0.74, H * 0.62, R0 * 0.7, 12, rot * 0.8);
      b.globalAlpha = mc * 0.18; b.beginPath();
      for (let k = 0; k < 14; k++) { const yy = H * 0.05 + k * 14, xx = W * 0.56 + Math.sin(t * 0.3) * 2 * k / 14; b.moveTo(xx - 3, yy); b.lineTo(xx + 3, yy + 10); }
      b.stroke();
      b.globalAlpha = mc * 0.06 * kT * 2; b.drawImage(this.spr('e', '255,170,90'), W * 0.1, H * 0.1, W * 0.5, H * 0.6);
    }

    // —— la pellicola: i fori ai lati, i graffi, il tremolio della luce
    const fm = mf('film');
    if (fm > 0.02) {
      const fl = 0.85 + Math.random() * 0.15, bw = Math.max(18, W * 0.035);
      over(); b.globalAlpha = fm * 0.3; b.fillStyle = '#000'; b.fillRect(0, 0, bw, H); b.fillRect(W - bw, 0, bw, H); add();
      const off = (t * 60) % 40;
      b.globalAlpha = fm * 0.3 * fl; b.fillStyle = `rgba(${A},1)`;
      for (let y = -40 + off; y < H; y += 40) { b.fillRect(bw * 0.3, y, bw * 0.4, 18); b.fillRect(W - bw * 0.7, y, bw * 0.4, 18); }
      this.scratch = this.scratch || [];
      if (Math.random() < 0.15) this.scratch.push({ x: rnd(bw, W - bw), l: rnd(0.1, 0.4) });
      b.strokeStyle = 'rgba(255,255,255,1)';
      this.scratch.forEach(s => { s.l -= dt; b.globalAlpha = fm * 0.25 * Math.max(0, s.l * 4); b.beginPath(); b.moveTo(s.x, 0); b.lineTo(s.x + rnd(-2, 2), H); b.stroke(); });
      this.scratch = this.scratch.filter(s => s.l > 0);
      for (let i = 0; i < 6; i++) if (Math.random() < 0.4) { b.globalAlpha = fm * 0.4; b.drawImage(sW, rnd(bw, W - bw), rnd(0, H), rnd(1, 4), rnd(1, 4)); }
      b.globalAlpha = fm * 0.05 * fl * kT * 2; b.fillStyle = `rgba(${A},1)`; b.fillRect(bw, 0, W - bw * 2, H);
    }

    // —— la giostrina sopra la culla: lune e stelle che girano piano
    const cr = mf('cradle');
    if (cr > 0.02) {
      const x = cx, y = cy - R0 * 1.1, r = R0 * 0.9;
      b.globalAlpha = cr * 0.2 * kT * 2; b.drawImage(this.spr('e', '255,220,190'), x - r * 2.2, y - r * 0.6, r * 4.4, r * 3.6);
      b.globalAlpha = cr * 0.35; b.strokeStyle = `rgba(${A},1)`;
      b.beginPath(); b.moveTo(x, 0); b.lineTo(x, y - r * 0.3); b.stroke();
      b.beginPath(); b.ellipse(x, y - r * 0.3, r, r * 0.18, 0, 0, TAU); b.stroke();
      for (let i = 0; i < 5; i++) {
        const a = t * 0.25 + i / 5 * TAU, px = x + Math.cos(a) * r, py = y - r * 0.3 + Math.sin(a) * r * 0.18, len = r * (0.5 + (i % 2) * 0.3);
        b.globalAlpha = cr * 0.3; b.beginPath(); b.moveTo(px, py); b.lineTo(px, py + len); b.stroke();
        const s = R0 * 0.14 * (0.8 + 0.2 * Math.sin(a)), oy = py + len + s;
        b.globalAlpha = cr * 0.55;
        if (i % 2) { b.beginPath(); b.arc(px, oy, s, 0.6, TAU - 0.6); b.arc(px + s * 0.5, oy, s * 0.8, TAU - 0.9, 0.9, true); b.closePath(); b.stroke(); }
        else { b.beginPath(); for (let k = 0; k < 10; k++) { const aa = k / 10 * TAU - Math.PI / 2, rr = k % 2 ? s * 0.45 : s; b.lineTo(px + Math.cos(aa) * rr, oy + Math.sin(aa) * rr); } b.closePath(); b.stroke(); }
      }
    }

    // —— le montagne: tre creste una dietro l'altra, la neve sulle cime
    const mt = mf('mountain');
    if (mt > 0.02) {
      this.ridges = this.ridges || [0, 1, 2].map(k => Array.from({ length: 24 }, (_, i) => Math.abs(Math.sin(i * (0.7 + k * 0.31) + k * 2)) * (0.6 + Math.random() * 0.4)));
      this.ridges.forEach((rg, k) => {
        const base = H * (0.4 + k * 0.09), amp = H * (0.24 - k * 0.05);
        over(); b.globalAlpha = mt * (0.12 + k * 0.1); b.fillStyle = bg;
        b.beginPath(); b.moveTo(0, H);
        rg.forEach((v, i) => b.lineTo(i / (rg.length - 1) * W, base - v * amp)); b.lineTo(W, H); b.closePath(); b.fill(); add();
        b.globalAlpha = mt * (0.3 - k * 0.07); b.strokeStyle = k ? `rgba(${B},1)` : 'rgba(240,244,255,1)';
        b.beginPath(); rg.forEach((v, i) => { const x = i / (rg.length - 1) * W, y = base - v * amp; i ? b.lineTo(x, y) : b.moveTo(x, y); }); b.stroke();
      });
    }

    // —— il fondo del mare: neve marina che scende, forme pallide lontane, ferme
    const dp = mf('deep');
    if (dp > 0.02) {
      const g = b.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `rgba(${A},${(dp * 0.05).toFixed(3)})`); g.addColorStop(1, `rgba(${A},0)`);
      b.globalAlpha = 1; b.fillStyle = g; b.fillRect(0, 0, W, H);
      this.snowSea = this.snowSea || Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.004, 0.015), s: rnd(0.6, 1.8) }));
      this.snowSea.forEach(p => { p.y += p.v * dt; p.x += Math.sin(t * 0.2 + p.y * 10) * 0.0004; if (p.y > 1.02) { p.y = -0.02; p.x = Math.random(); } b.globalAlpha = dp * 0.45; b.drawImage(sW, p.x * W - p.s, p.y * H - p.s, p.s * 2, p.s * 2); });
      this.sunk = this.sunk || Array.from({ length: 7 }, (_, i) => ({ x: rnd(0.1, 0.9), y: rnd(0.55, 0.92), a: rnd(-0.6, 0.6), ph: rnd(0, TAU), s: rnd(0.6, 1) }));
      this.sunk.forEach(f => {
        const x = (f.x + Math.sin(t * 0.02 + f.ph) * 0.01) * W, y = f.y * H + Math.sin(t * 0.05 + f.ph) * 4, s = R0 * 0.32 * f.s;
        b.save(); b.translate(x, y); b.rotate(f.a + Math.sin(t * 0.03 + f.ph) * 0.05);
        b.globalAlpha = dp * 0.08; b.fillStyle = `rgba(${A},1)`;
        b.beginPath(); b.ellipse(0, 0, s * 1.4, s * 0.32, 0, 0, TAU); b.fill();
        b.beginPath(); b.arc(-s * 1.55, 0, s * 0.24, 0, TAU); b.fill();
        b.restore();
      });
      // una nave coricata, lontanissima
      b.globalAlpha = dp * 0.12; b.strokeStyle = `rgba(${A},1)`;
      b.beginPath(); b.moveTo(W * 0.15, H * 0.9); b.quadraticCurveTo(W * 0.3, H * 0.97, W * 0.48, H * 0.88); b.lineTo(W * 0.45, H * 0.8); b.moveTo(W * 0.3, H * 0.93); b.lineTo(W * 0.24, H * 0.7); b.stroke();
    }

    // —— gocce sul vetro, che scendono e lasciano la scia
    const rf = mf('rainfall');
    if (rf > 0.02) {
      this.drops = this.drops || [];
      if (this.drops.length < 70 && Math.random() < rf * 0.6) this.drops.push({ x: Math.random(), y: rnd(-0.05, 0.6), r: rnd(1.5, 4.5), v: 0, stick: rnd(0.5, 3) });
      b.strokeStyle = `rgba(${A},1)`;
      this.drops.forEach(d => {
        d.stick -= dt; if (d.stick < 0) d.v = Math.min(0.25, d.v + dt * 0.08 * d.r / 3); else if (Math.random() < 0.002) d.stick = 0;
        const y0 = d.y; d.y += d.v * dt; d.x += Math.sin(d.y * 40) * 0.0003;
        if (d.v > 0) { b.globalAlpha = rf * 0.1; b.beginPath(); b.moveTo(d.x * W, y0 * H - d.r * 6); b.lineTo(d.x * W, d.y * H); b.stroke(); }
        b.globalAlpha = rf * 0.35; b.beginPath(); b.arc(d.x * W, d.y * H, d.r, 0, TAU); b.stroke();
        b.globalAlpha = rf * 0.4; b.drawImage(sW, d.x * W - d.r * 0.4, d.y * H - d.r * 0.5, 2, 2);
      });
      this.drops = this.drops.filter(d => d.y < 1.05);
    }

    b.globalAlpha = 1; add();
  };
})(window.ATH);
