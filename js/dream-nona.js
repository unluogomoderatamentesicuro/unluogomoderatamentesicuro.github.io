/* ATHANOR — figure dell'estate e del tempo: lanterne sull'acqua, il falò con
   le scintille, le stelle cadenti, l'eco, la stanza degli orologi, la
   settimana col gesso, le radici che si parlano.
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
    b.globalCompositeOperation = 'lighter'; b.lineWidth = 1;

    // —— le lanterne sull'acqua: salgono piano, e si specchiano
    const ln = mf('lantern');
    if (ln > 0.02) {
      const water = H * (W < 700 ? 0.58 : 0.52), orange = this.spr('e', '255,180,100');
      for (let i = 0; i < 9; i++) {
        const u = (t * (0.011 + (i % 4) * 0.003) + i * 0.137) % 1;
        const x = ((i * 0.117 + 0.05 + Math.sin(t * 0.08 + i) * 0.03 + t * 0.004 * (1 + i % 3)) % 1.1 - 0.05) * W;
        const y = water - u * H * 0.42 - (i % 3) * H * 0.02, s = (0.7 + (i % 3) * 0.3) * Math.min(1, W / 700 + 0.5);
        const fade = Math.min(1, u * 6, (1 - u) * 4), fl = 0.75 + 0.25 * Math.sin(t * 3 + i * 2.1);
        b.globalAlpha = ln * 0.35 * fade * fl; b.drawImage(orange, x - 40 * s, y - 40 * s, 80 * s, 80 * s);
        b.globalAlpha = ln * 0.55 * fade; b.strokeStyle = 'rgba(255,214,160,1)';
        b.beginPath(); b.rect(x - 7 * s, y - 9 * s, 14 * s, 18 * s); b.stroke();
        b.globalAlpha = ln * 0.12 * fade * fl; b.drawImage(orange, x - 28 * s, water + (water - y) * 0.45 - 12 * s, 56 * s, 24 * s);
      }
      b.globalAlpha = ln * 0.06; b.fillStyle = `rgba(${A},1)`; b.fillRect(0, water, W, 1);
    }

    // —— il falò: fiamma che respira, scintille che salgono fra le stelle
    const bf = mf('bonfire');
    if (bf > 0.02) {
      const fx = cx, fy = H * (W < 700 ? 0.6 : 0.53), fl = 0.8 + 0.2 * Math.sin(t * 9) * Math.sin(t * 5.3 + 1);
      const hot = this.spr('e', '255,150,60'), core = this.spr('e', '255,230,150');
      b.globalAlpha = bf * 0.3 * fl; b.drawImage(hot, fx - R0 * 1.3, fy - R0 * 1.6, R0 * 2.6, R0 * 2.6);
      b.globalAlpha = bf * 0.5 * fl; b.drawImage(core, fx - R0 * 0.35, fy - R0 * 0.9, R0 * 0.7, R0 * 1.1);
      b.strokeStyle = 'rgba(255,170,90,1)';
      for (let k = 0; k < 5; k++) { const a = Math.sin(t * (3 + k) + k * 2) * 6; b.globalAlpha = bf * 0.18; b.beginPath(); b.moveTo(fx + (k - 2) * 8, fy); b.quadraticCurveTo(fx + (k - 2) * 5 + a, fy - R0 * 0.5, fx + (k - 2) * 2 + a * 1.5, fy - R0 * (0.7 + 0.12 * k % 3)); b.stroke(); }
      this.sparksF = this.sparksF || [];
      if (this.sparksF.length < 44 && Math.random() < dt * 22 * bf) this.sparksF.push({ x: fx + rnd(-20, 20), y: fy - 10, vx: rnd(-14, 14), vy: -rnd(40, 110), life: 1, ph: rnd(0, TAU) });
      for (let i = this.sparksF.length - 1; i >= 0; i--) {
        const s = this.sparksF[i]; s.life -= dt * 0.28; s.x += (s.vx + Math.sin(t * 2 + s.ph) * 14) * dt; s.y += s.vy * dt; s.vy *= 0.995;
        if (s.life <= 0) { this.sparksF.splice(i, 1); continue; }
        b.globalAlpha = bf * Math.min(1, s.life * 1.4) * 0.7; b.drawImage(hot, s.x - 5, s.y - 5, 10, 10);
      }
    }

    // —— stelle cadenti
    const mt = mf('meteors');
    if (mt > 0.02) {
      this.metL = this.metL || []; this.metNext = (this.metNext === undefined ? 1.5 : this.metNext) - dt;
      if (this.metNext < 0) { this.metNext = rnd(2.5, 7) / Math.max(0.3, mt); this.metL.push({ x: rnd(0.2, 1) * W, y: rnd(0.02, 0.35) * H, a: rnd(0.35, 0.65), len: rnd(110, 260), life: 1 }); }
      for (let i = this.metL.length - 1; i >= 0; i--) {
        const m = this.metL[i]; m.life -= dt * 1.1; if (m.life <= 0) { this.metL.splice(i, 1); continue; }
        const u = 1 - m.life, hx = m.x - Math.cos(m.a) * m.len * u * 1.4, hy = m.y + Math.sin(m.a) * m.len * u * 1.4;
        const g = b.createLinearGradient(hx, hy, hx + Math.cos(m.a) * m.len * 0.7, hy - Math.sin(m.a) * m.len * 0.7);
        g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        b.globalAlpha = mt * Math.sin(Math.PI * Math.min(1, u * 1.1)); b.strokeStyle = g; b.lineWidth = 1.4;
        b.beginPath(); b.moveTo(hx, hy); b.lineTo(hx + Math.cos(m.a) * m.len * 0.7, hy - Math.sin(m.a) * m.len * 0.7); b.stroke();
      }
      b.lineWidth = 1;
    }

    // —— l'eco: cerchi che tornano indietro più deboli e più tardi
    const ec = mf('echo');
    if (ec > 0.02) {
      b.strokeStyle = `rgba(${A},1)`;
      for (let k = 0; k < 5; k++) {
        const T = 7 + k * 0.6, u = ((t + k * 1.9) % T) / T, r = u * Math.max(W, H) * 0.55;
        b.globalAlpha = ec * Math.pow(1 - u, 2) * (0.22 - k * 0.03);
        b.beginPath(); b.arc(cx, cy, r, 0, TAU); b.stroke();
      }
    }

    // —— gli orologi: ognuno la sua ora
    const ck = mf('clock');
    if (ck > 0.02) {
      const sp = [[0.18, 0.28, 0.12], [0.5, 0.2, 0.09], [0.82, 0.3, 0.13], [0.3, 0.62, 0.1], [0.68, 0.64, 0.12], [0.1, 0.7, 0.07], [0.92, 0.7, 0.07]];
      b.strokeStyle = `rgba(${A},1)`;
      sp.forEach(([px, py, pr], i) => {
        const x = px * W, y = py * H, r = pr * Math.min(W, H) * 1.3, sw = 0.5 + 0.5 * Math.sin(t * 0.2 + i);
        b.globalAlpha = ck * (0.12 + 0.1 * sw); b.beginPath(); b.arc(x, y, r, 0, TAU); b.stroke();
        for (let h = 0; h < 12; h++) { const a = h / 12 * TAU; b.globalAlpha = ck * 0.1; b.beginPath(); b.moveTo(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86); b.lineTo(x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96); b.stroke(); }
        const am = t * (0.6 + i * 0.37) * (i % 2 ? -1 : 1) + i, ah = am / 12;
        b.globalAlpha = ck * 0.4; b.beginPath(); b.moveTo(x, y); b.lineTo(x + Math.cos(am) * r * 0.78, y + Math.sin(am) * r * 0.78); b.stroke();
        b.globalAlpha = ck * 0.3; b.beginPath(); b.moveTo(x, y); b.lineTo(x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5); b.stroke();
      });
    }

    // —— la settimana col gesso, e il sasso che salta
    const ch = mf('chalk');
    if (ch > 0.02) {
      const cw = Math.min(W * 0.07, 40), x0 = W * (W < 700 ? 0.62 : 0.78), y0 = H * (W < 700 ? 0.58 : 0.55), rows = [1, 2, 1, 2, 1, 2];
      b.strokeStyle = 'rgba(240,240,230,1)'; b.lineWidth = 1.5;
      const cells = [];
      rows.forEach((n, r) => { const yy = y0 - (r + 1) * cw * 0.8; for (let c = 0; c < n; c++) { const xx = n === 1 ? x0 + cw * 0.5 : x0 + c * cw; cells.push([xx + cw / 2, yy + cw * 0.4]); b.globalAlpha = ch * 0.3; b.strokeRect(xx, yy, cw, cw * 0.8); } });
      const k = (t * 1.1) % (cells.length + 3), i = Math.min(cells.length - 1, Math.floor(k)), j = Math.min(cells.length - 1, i + 1), f = k - Math.floor(k);
      const sx = cells[i][0] + (cells[j][0] - cells[i][0]) * f, sy = cells[i][1] + (cells[j][1] - cells[i][1]) * f - Math.sin(Math.PI * f) * cw * 0.5;
      b.globalAlpha = ch * 0.7; b.beginPath(); b.arc(sx, sy, 4, 0, TAU); b.stroke();
      b.lineWidth = 1;
    }

    // —— le radici: fili sotto la terra, con piccole luci che viaggiano
    const rt = mf('roots');
    if (rt > 0.02) {
      if (!this.rootsP) {
        this.rootsP = Array.from({ length: 9 }, (_, i) => {
          let x = (i + 0.5) / 9 + rnd(-0.04, 0.04), y = 0; const pts = [[x, y]];
          for (let s = 0; s < 14; s++) { x += rnd(-0.07, 0.07); y += rnd(0.04, 0.09); pts.push([x, y]); }
          return { pts, ph: rnd(0, 1), sp: rnd(0.012, 0.03) };
        });
      }
      const grn = this.spr('e', '190,240,160');
      this.rootsP.forEach(r => {
        b.strokeStyle = 'rgba(190,230,160,1)'; b.globalAlpha = rt * 0.13; b.beginPath();
        r.pts.forEach(([x, y], k) => k ? b.lineTo(x * W, y * H) : b.moveTo(x * W, y * H)); b.stroke();
        const q = ((t * r.sp + r.ph) % 1) * (r.pts.length - 1), i = Math.floor(q), f = q - i, a = r.pts[i], c = r.pts[Math.min(r.pts.length - 1, i + 1)];
        b.globalAlpha = rt * 0.6; b.drawImage(grn, (a[0] + (c[0] - a[0]) * f) * W - 8, (a[1] + (c[1] - a[1]) * f) * H - 8, 16, 16);
      });
    }
    b.globalAlpha = 1; b.globalCompositeOperation = 'lighter';
  };
})(window.ATH);
