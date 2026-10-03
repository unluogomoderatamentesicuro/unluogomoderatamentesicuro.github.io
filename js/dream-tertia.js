/* ATHANOR — figure della nascita e della morte: il volto che si dissolve, i
   profumi che passano, la vista doppia del dubbio, la luce che sale
   all'ultimo piano, il grembo, l'urlo.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const D = ATH.Dream.prototype;
  const p0 = D.drawPlus, ev0 = D.event;

  D.event = function (e) {
    if (e.kind === 'scream') { this.screamOn = e.on; if (e.on) this.screamHit = 1; return; }
    return ev0.call(this, e);
  };

  D.drawPlus = function (b, S, dt, W, H, cx, cy, R0, kT, A, B, t) {
    p0.call(this, b, S, dt, W, H, cx, cy, R0, kT, A, B, t);
    const mf = k => (S.motif && S.motif[k]) || 0;
    const sW = this.spr('w', '255,255,255'), sA = this.spr('a', A);
    b.globalCompositeOperation = 'lighter';

    // il grembo: un bagliore che pulsa col cuore
    const wb = mf('womb');
    if (wb > 0.02) {
      const hp = this.heartPulse || 0, r = Math.max(W, H) * (0.55 + hp * 0.06);
      b.globalAlpha = wb * (0.12 + hp * 0.18) * kT * 2; b.drawImage(this.spr('e', '255,90,80'), cx - r, cy - r, r * 2, r * 2);
      for (let k = 0; k < 5; k++) {
        b.globalAlpha = wb * 0.08; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1;
        b.beginPath(); b.ellipse(cx, cy, R0 * (1.2 + k * 0.45 + hp * 0.1), R0 * (0.9 + k * 0.4), Math.sin(t * 0.1 + k) * 0.2, 0, TAU); b.stroke();
      }
    }

    // fotografie antiche: sagome senza volto che si dissolvono (niente sorrisi)
    const fc = mf('face');
    if (fc > 0.02) {
      const fade = Math.min(1, S.faceFade || 0), jit = 1 + fade * 26, al = fc * (0.6 - fade * 0.45);
      const J = () => (Math.random() - 0.5) * jit;
      const frames = [[-0.62, -0.08, -0.06], [0, 0.04, 0.02], [0.6, -0.12, 0.05]];
      frames.forEach(([ox, oy, rot], k) => {
        const w = R0 * 0.62, h = R0 * 0.8, x = cx + ox * R0 * 1.6, y = cy + oy * R0;
        b.save(); b.translate(x, y); b.rotate(rot + Math.sin(t * 0.1 + k) * 0.01);
        b.globalCompositeOperation = 'source-over';
        b.globalAlpha = al * 0.55; b.fillStyle = `rgb(${S.rgbBg})`; b.fillRect(-w / 2, -h / 2, w, h);
        b.globalCompositeOperation = 'lighter';
        b.globalAlpha = al * 0.5; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1; b.strokeRect(-w / 2, -h / 2, w, h);
        b.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 18);
        // una o due sagome: testa e spalle, nessun lineamento
        // figure intere in piedi, piccole, come nelle fotografie di una volta
        const n = k === 1 ? 3 : k === 0 ? 2 : 1;
        for (let m = 0; m < n; m++) {
          const sx = (n === 1 ? 0 : (m / (n - 1) - 0.5) * 0.5) * w + J(), hh = h * (m === n - 1 && n === 3 ? 0.42 : 0.56);
          const top = h * 0.32 - hh;
          b.globalAlpha = al * (0.2 + 0.1 * (1 - fade)); b.fillStyle = `rgba(${A},1)`;
          b.beginPath(); b.arc(sx, top + hh * 0.1, hh * 0.085, 0, TAU); b.fill();
          b.beginPath(); b.moveTo(sx - hh * 0.12, top + hh * 0.22); b.lineTo(sx + hh * 0.12, top + hh * 0.22); b.lineTo(sx + hh * 0.09, top + hh); b.lineTo(sx - hh * 0.09, top + hh); b.closePath(); b.fill();
        }
        if (fade > 0.3) { b.globalAlpha = fc * (fade - 0.3) * 0.25; b.drawImage(this.spr('b', B), -w, -h, w * 2, h * 2); }
        b.restore();
      });
    }

    // i profumi di una volta: parole che salgono come vapore
    const sc = mf('scents');
    if (sc > 0.02) {
      this.scents = this.scents || [];
      if (this.scents.length < 7 && Math.random() < sc * 0.02) {
        const list = ATH.SCENTS;
        this.scents.push({ w: list[Math.floor(Math.random() * list.length)], x: W < 700 ? rnd(0.15, 0.85) : rnd(0.48, 0.92), y: W < 700 ? rnd(0.2, 0.5) : rnd(0.45, 0.85), life: 1, sp: rnd(0.08, 0.16) });
      }
      b.globalCompositeOperation = 'source-over'; b.textAlign = 'center';
      this.scents.forEach(s => {
        s.life -= dt * s.sp; s.y -= dt * 0.012;
        const a = Math.sin(Math.PI * Math.max(0, s.life)) * sc;
        b.globalAlpha = a * 0.75; b.fillStyle = `rgba(${A},1)`;
        b.font = `italic ${Math.round(15 + (1 - s.life) * 8)}px "IM Fell English", Georgia, serif`;
        b.fillText(s.w, s.x * W + Math.sin(t * 0.8 + s.y * 12) * 14 * (1 - s.life), s.y * H);
      });
      this.scents = this.scents.filter(s => s.life > 0);
      b.globalCompositeOperation = 'lighter';
    }

    // il dubbio: tutto si sdoppia
    const db = mf('doubt');
    if (db > 0.02) {
      const off = R0 * (0.25 + 0.2 * Math.sin(t * 0.37));
      [-1, 1].forEach(sd => {
        b.globalAlpha = db * 0.3; b.strokeStyle = `rgba(${sd < 0 ? A : B},1)`; b.lineWidth = 1.2;
        b.beginPath(); b.arc(cx + sd * off, cy, R0 * (1 + 0.04 * Math.sin(t * 2 + sd)), 0, TAU); b.stroke();
      });
      b.globalAlpha = db * 0.15; b.strokeStyle = `rgba(${A},1)`;
      b.beginPath(); b.moveTo(cx, cy + R0 * 1.4); b.lineTo(cx - W * 0.3, H); b.moveTo(cx, cy + R0 * 1.4); b.lineTo(cx + W * 0.3, H); b.stroke();
    }

    // l'ultimo piano: la luce che sale e lava via
    const pu = mf('purify');
    if (pu > 0.02) {
      const k = Math.min(1, (S.ascend || 0) + 0.25);
      this.rise = this.rise || Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.03, 0.09), s: rnd(1, 3) }));
      this.rise.forEach(p => {
        p.y -= p.v * dt; if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        b.globalAlpha = pu * k * 0.6; b.drawImage(sW, p.x * W - p.s, p.y * H - p.s, p.s * 2, p.s * 2);
      });
      const g = b.createLinearGradient(0, H, 0, 0);
      g.addColorStop(0, `rgba(${A},0)`); g.addColorStop(1, `rgba(${A},${pu * k * 0.045 * kT * 2})`);
      b.globalAlpha = 1; b.fillStyle = g; b.fillRect(0, 0, W, H);
    }

    // l'urlo: lo schermo trema e diventa rosso
    if (this.screamOn || (this.screamHit || 0) > 0.01) {
      const k = this.screamOn ? 1 : this.screamHit;
      b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over';
      const cw = b.canvas.width, ch = b.canvas.height;
      b.globalAlpha = 0.35 * k; b.drawImage(b.canvas, (Math.random() - 0.5) * 18 * k, (Math.random() - 0.5) * 12 * k);
      b.restore(); b.globalCompositeOperation = 'lighter';
      b.globalAlpha = 0.12 * k; b.fillStyle = 'rgba(255,40,30,1)'; b.fillRect(0, 0, W, H);
      if (this.screamOn) { this.cracks = this.cracks || []; if (this.cracks.length < 40 && Math.random() < 0.4) { const a = Math.random() * TAU, l = rnd(40, 180); const x = Math.random() * W, y = Math.random() * H; this.cracks.push({ x1: x, y1: y, x2: x + Math.cos(a) * l, y2: y + Math.sin(a) * l, a, k: 0 }); } }
      if (!this.screamOn) this.screamHit *= Math.pow(0.2, dt);
    }
    b.globalAlpha = 1; b.globalCompositeOperation = 'lighter';
  };
})(window.ATH);
