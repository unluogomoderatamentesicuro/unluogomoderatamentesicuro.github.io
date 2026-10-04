/* ATHANOR — figure della mente: la folla che si stringe intorno (sagome senza
   volto, che forse non ti guardano affatto), e la velatura del sogno, che
   sdoppia piano le cose.
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
    const press = S.press || 0;

    // —— la folla
    const cr = mf('crowd');
    if (cr > 0.02) {
      this.people = this.people || Array.from({ length: 46 }, (_, i) => ({ x: Math.random(), row: i % 3, v: rnd(-0.012, 0.012), ph: rnd(0, TAU), h: rnd(0.85, 1.15) }));
      const ground = H * (W < 700 ? 0.58 : 0.5);
      this.people.sort((a, b) => a.row - b.row).forEach(p => {
        p.x += p.v * dt * (1 - press * 0.7); if (p.x < -0.05) p.x = 1.05; if (p.x > 1.05) p.x = -0.05;
        // con la pressione, la folla si avvicina e si stringe verso il centro
        const near = [0.45, 0.7, 1][p.row] * (1 + press * 0.45);
        const xx = (cx + (p.x * W - cx) * (1 - press * 0.25)), hh = R0 * 0.72 * near * p.h, yy = ground + [-0.12, -0.05, 0.04][p.row] * H + press * 0.04 * H * p.row;
        b.globalCompositeOperation = 'source-over';
        b.globalAlpha = cr * (0.25 + p.row * 0.18 + press * 0.15); b.fillStyle = `rgb(${S.rgbBg})`;
        b.beginPath(); b.arc(xx, yy - hh, hh * 0.13, 0, TAU); b.fill();
        b.beginPath(); b.moveTo(xx - hh * 0.2, yy - hh * 0.82); b.lineTo(xx + hh * 0.2, yy - hh * 0.82); b.lineTo(xx + hh * 0.15, yy); b.lineTo(xx - hh * 0.15, yy); b.closePath(); b.fill();
        b.globalCompositeOperation = 'lighter';
        b.globalAlpha = cr * (0.08 + p.row * 0.05); b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1;
        b.beginPath(); b.arc(xx, yy - hh, hh * 0.13, 0, TAU); b.stroke();
        b.globalAlpha *= 0.6; b.beginPath(); b.moveTo(xx - hh * 0.15, yy); b.lineTo(xx - hh * 0.2, yy - hh * 0.82); b.lineTo(xx + hh * 0.2, yy - hh * 0.82); b.lineTo(xx + hh * 0.15, yy); b.stroke();
        // la testa si gira appena verso di te: un filo di luce dal lato del centro
        if (press > 0.15) {
          const side = xx < cx ? 1 : -1;
          b.globalAlpha = cr * press * 0.5 * (0.6 + 0.4 * Math.sin(t * 0.7 + p.ph));
          b.beginPath(); b.arc(xx, yy - hh, hh * 0.13, side > 0 ? -0.7 : Math.PI - 0.7, side > 0 ? 0.7 : Math.PI + 0.7); b.stroke();
        }
      });
      // il campo visivo che si restringe
      if (press > 0.02) {
        const g = b.createRadialGradient(cx, cy, Math.min(W, H) * (0.55 - press * 0.3), cx, cy, Math.max(W, H) * 0.75);
        g.addColorStop(0, `rgba(${S.rgbBg},0)`); g.addColorStop(1, `rgba(${S.rgbBg},${(press * 0.7).toFixed(3)})`);
        b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1; b.fillStyle = g; b.fillRect(0, 0, W, H); b.globalCompositeOperation = 'lighter';
      }
    }

    // —— la velatura del sogno: le cose si sdoppiano piano, la luce si fa morbida
    const dr = mf('dream');
    if (dr > 0.02) {
      b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'lighter';
      const ox = Math.sin(t * 0.21) * 6, oy = Math.cos(t * 0.17) * 4;
      b.globalAlpha = 0.1 * dr; b.drawImage(b.canvas, ox, oy);
      b.restore();
      b.globalCompositeOperation = 'lighter';
      const g = b.createRadialGradient(cx, H * 0.2, 0, cx, H * 0.2, Math.max(W, H) * 0.6);
      g.addColorStop(0, `rgba(${A},${(dr * 0.06).toFixed(3)})`); g.addColorStop(1, `rgba(${A},0)`);
      b.globalAlpha = 1; b.fillStyle = g; b.fillRect(0, 0, W, H);
    }
    b.globalAlpha = 1; b.globalCompositeOperation = 'lighter';
  };
})(window.ATH);
