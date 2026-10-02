/* ATHANOR — lo strato del sogno: aurore, luci sfocate, lucciole, onde, pioggia,
   braci, neve, stelle cadenti, costellazioni del carillon, campane che scendono
   dall'alto. Ogni figura nasce da ciò che suona.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function sprite(rgb) {
    const s = document.createElement('canvas'); s.width = s.height = 64;
    const g = s.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.25, `rgba(${rgb},0.55)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return s;
  }

  class Dream {
    constructor() {
      this.sprites = {};
      this.ev = [];
      this.stars = [];      // note del carillon
      this.pool = {};
      this.t = 0;
      this.mk('bokeh', 40, () => ({ x: Math.random(), y: Math.random(), r: rnd(18, 110), vx: rnd(-1, 1) * 0.004, vy: rnd(-1, 1) * 0.003, ph: rnd(0, TAU), h: Math.random() }));
      this.mk('fly', 56, () => ({ x: Math.random(), y: rnd(0.25, 0.95), vx: 0, vy: 0, ph: rnd(0, TAU), sp: rnd(0.6, 1.8) }));
      this.mk('rain', 160, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.9, 1.6), len: rnd(10, 26) }));
      this.mk('wind', 36, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.4, 1), len: rnd(60, 220) }));
      this.mk('ember', 70, () => ({ x: rnd(0.25, 0.75), y: 1.05, vx: rnd(-0.3, 0.3), vy: rnd(-1.4, -0.5), life: Math.random() }));
      this.mk('snow', 170, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.15, 0.45), s: rnd(1, 3.2), ph: rnd(0, TAU) }));
      this.mk('sky', 160, () => ({ x: Math.random(), y: Math.random() * 0.75, s: rnd(0.6, 1.8), ph: rnd(0, TAU), sp: rnd(0.5, 2.5) }));
      this.mk('mote', 60, () => ({ x: rnd(0.3, 0.7), y: Math.random(), vx: rnd(-1, 1) * 0.0008, vy: rnd(-1, 1) * 0.0008, s: rnd(0.8, 2.2), ph: rnd(0, TAU) }));
      this.mk('smoke', 7, () => ({ x: Math.random(), y: rnd(0.3, 0.8), vx: rnd(-1, 1) * 0.0015, r: rnd(80, 200), ph: rnd(0, TAU) }));
      this.mk('blade', 150, () => ({ x: Math.random(), h: rnd(0.04, 0.16), ph: rnd(0, TAU), c: Math.random() }));
      this.mk('glass', 46, () => ({ x: Math.random(), y: Math.random(), r: rnd(1.5, 4.5), v: 0, trail: [] }));
      this.flocks = []; this.ripples = []; this.ecg = new Float32Array(240); this.ecgQ = []; this.heartPulse = 0;
      this.sweep = null; this.sweepNext = 4; this.trainPass = null; this.flickerT = 0;
      this.shoot = null; this.shootNext = 3;
      this.palKey = '';
    }
    mk(name, n, f) { this.pool[name] = Array.from({ length: n }, f); this.pool[name].f = f; }

    spr(name, rgb) {
      const key = name + rgb;
      if (!this.sprites[key]) { this.sprites[key] = sprite(rgb); if (Object.keys(this.sprites).length > 60) this.sprites = { [key]: this.sprites[key] }; }
      return this.sprites[key];
    }

    event(e) {
      if (e.kind === 'carillon') {
        const x = 0.12 + 0.76 * Math.min(1, Math.max(0, Math.log2(e.freq / 500) / 2.5)) + rnd(-0.03, 0.03);
        const st = { x, y: rnd(0.08, 0.4), life: 1 };
        this.stars.push(st); if (this.stars.length > 14) this.stars.shift();
      } else if (e.kind === 'piano') this.ev.push({ k: 'bloom', x: rnd(0.15, 0.85), y: rnd(0.2, 0.8), life: 1, r: rnd(60, 160) });
      else if (e.kind === 'toll') this.ev.push({ k: 'toll', life: 1 });
      else if (e.kind === 'bowl') this.ev.push({ k: 'bowl', life: 1, pan: e.pan });
      else if (e.kind === 'drop') this.ev.push({ k: 'drop', x: Math.random(), y: rnd(0.55, 0.98), life: 1 });
      else if (e.kind === 'ember') this.ev.push({ k: 'spark', x: rnd(0.35, 0.65), y: rnd(0.75, 0.95), life: 1 });
      else if (e.kind === 'heart') this.heartPulse = 1;
      else if (e.kind === 'beep') this.ecgQ.push(0, 0.08, -0.05, 0, 0.25, 1, -0.35, 0, 0, 0.12, 0.18, 0.1);
      else if (e.kind === 'bird') {
        const dir = Math.random() < 0.5 ? 1 : -1, n = e.gull ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 5);
        const y = rnd(0.08, 0.45);
        this.flocks.push({ x: dir > 0 ? -0.05 : 1.05, y, vx: dir * rnd(0.05, 0.1), n, s: e.gull ? 9 : 5, ph: rnd(0, TAU), life: 1 });
        if (this.flocks.length > 6) this.flocks.shift();
      } else if (e.kind === 'drip') this.ripples.push({ x: rnd(0.15, 0.85), y: rnd(0.55, 0.92), r: 0, life: 1, well: true });
      else if (e.kind === 'train') this.trainPass = { t: 0, dur: e.dur || 20 };
      if (this.ripples.length > 20) this.ripples.shift();
      if (this.ev.length > 80) this.ev.splice(0, this.ev.length - 80);
    }

    // b = contesto (coordinate CSS), S = stato del frame
    draw(b, S, dt, W, H, cx, cy, R0) {
      const t = (this.t += dt);
      const L = S.L, M = S.L, sw = S.sw, q = S.q;
      const A = S.rgbA, B = S.rgbB;
      const low = S.low || 0;
      const kT = Math.max(0.12, Math.min(1, (S.trail || 0.1) * 4.5));
      const imag = sw.imagines, vel = sw.velamen;
      b.globalCompositeOperation = 'lighter';

      // —— cielo di San Lorenzo
      const skyW = S.motif.stars || 0;
      if (skyW > 0.02 && imag) {
        const sp = this.spr('w', '255,255,255');
        this.pool.sky.forEach(s => {
          const a = skyW * (0.35 + 0.35 * Math.sin(t * s.sp + s.ph));
          b.globalAlpha = a; b.drawImage(sp, s.x * W - s.s * 2, s.y * H - s.s * 2, s.s * 4, s.s * 4);
        });
        this.shootNext -= dt;
        if (!this.shoot && this.shootNext <= 0) { this.shoot = { x: rnd(0.1, 0.8) * W, y: rnd(0.02, 0.3) * H, vx: rnd(500, 900), vy: rnd(150, 320), life: 1 }; this.shootNext = rnd(2.5, 8); }
        if (this.shoot) {
          const s = this.shoot; s.life -= dt * 1.4; s.x += s.vx * dt; s.y += s.vy * dt;
          b.globalAlpha = Math.max(0, s.life) * skyW;
          const gr = b.createLinearGradient(s.x, s.y, s.x - s.vx * 0.18, s.y - s.vy * 0.18);
          gr.addColorStop(0, `rgba(${A},1)`); gr.addColorStop(1, `rgba(${A},0)`);
          b.strokeStyle = gr; b.lineWidth = 1.6; b.beginPath(); b.moveTo(s.x, s.y); b.lineTo(s.x - s.vx * 0.18, s.y - s.vy * 0.18); b.stroke();
          if (s.life <= 0) this.shoot = null;
        }
      }

      // —— aurora: il velo di luce
      const au = vel ? Math.pow(L.lumen, 1.2) * (0.3 + L.somnium) * q * kT : 0;
      if (au > 0.01) {
        for (let k = 0; k < 3; k++) {
          const y0 = H * (0.08 + k * 0.09), hh = H * (0.22 + 0.08 * Math.sin(t * 0.17 + k));
          const gr = b.createLinearGradient(0, y0, 0, y0 + hh);
          const col = k === 1 ? B : A;
          gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.35, `rgba(${col},${au * 0.11})`); gr.addColorStop(1, `rgba(${col},0)`);
          b.globalAlpha = 1; b.fillStyle = gr; b.beginPath();
          for (let x = 0; x <= W + 24; x += 24) { const y = y0 + Math.sin(x * 0.004 + t * 0.25 + k * 2) * H * 0.05 + Math.sin(x * 0.011 - t * 0.4) * H * 0.015; x ? b.lineTo(x, y) : b.moveTo(x, y); }
          for (let x = W + 24; x >= 0; x -= 24) { const y = y0 + hh + Math.sin(x * 0.003 + t * 0.2 + k) * H * 0.06; b.lineTo(x, y); }
          b.closePath(); b.fill();
        }
      }

      // —— luci sfocate
      const bk = vel ? Math.round(L.somnium * (0.15 + q * 0.85) * 40) : 0;
      if (bk > 0) {
        const sA = this.spr('a', A), sB = this.spr('b', B);
        for (let i = 0; i < bk; i++) {
          const p = this.pool.bokeh[i];
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < -0.1) p.x = 1.1; if (p.x > 1.1) p.x = -0.1; if (p.y < -0.1) p.y = 1.1; if (p.y > 1.1) p.y = -0.1;
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.4 + p.ph);
          const r = p.r * (0.85 + low * 0.5);
          b.globalAlpha = (0.02 + 0.05 * pulse + low * 0.04) * (0.5 + q * 0.5) * kT;
          b.drawImage(p.h < 0.6 ? sA : sB, p.x * W - r, p.y * H - r, r * 2, r * 2);
        }
      }

      if (imag) {
        // —— onde del mare
        const mare = M.m_mare;
        if (mare > 0.02) {
          const wv = S.wave || 0;
          b.globalAlpha = 1; b.lineWidth = 1.2;
          for (let i = 0; i < 6; i++) {
            const y0 = H * (0.6 + i * 0.065), amp = (5 + wv * 22) * (1 + i * 0.35);
            b.strokeStyle = `rgba(${i % 2 ? B : A},${mare * (0.1 + wv * 0.25) * (1 - i * 0.1)})`;
            b.beginPath();
            for (let x = 0; x <= W + 16; x += 16) {
              const y = y0 + Math.sin(x * 0.007 + t * (0.5 + i * 0.08) + i) * amp + Math.sin(x * 0.019 - t * 0.8) * amp * 0.3;
              x ? b.lineTo(x, y) : b.moveTo(x, y);
            }
            b.stroke();
          }
        }
        // —— pioggia
        const rain = M.m_pioggia;
        if (rain > 0.02) {
          const n = Math.round(rain * 160);
          b.globalAlpha = 1; b.strokeStyle = `rgba(${A},${0.12 + rain * 0.18})`; b.lineWidth = 1; b.beginPath();
          for (let i = 0; i < n; i++) {
            const d = this.pool.rain[i];
            d.y += d.v * dt * 1.2; if (d.y > 1.05) { d.y = -0.05; d.x = Math.random(); }
            const x = d.x * W, y = d.y * H; b.moveTo(x, y); b.lineTo(x - d.len * 0.18, y - d.len);
          }
          b.stroke();
        }
        // —— vento
        const wind = M.m_vento;
        if (wind > 0.02) {
          const n = Math.round(wind * 36);
          b.strokeStyle = `rgba(${B},${0.08 + wind * 0.14})`; b.lineWidth = 1; b.beginPath();
          for (let i = 0; i < n; i++) {
            const d = this.pool.wind[i];
            d.x += d.v * dt * 0.5; if (d.x > 1.3) { d.x = -0.3; d.y = Math.random(); }
            const x = d.x * W, y = d.y * H + Math.sin(t + i) * 8;
            b.moveTo(x, y); b.quadraticCurveTo(x + d.len * 0.5, y - 10 * Math.sin(t * 0.7 + i), x + d.len, y);
          }
          b.stroke();
        }
        // —— braci del camino
        const fire = M.m_camino;
        if (fire > 0.02) {
          const se = this.spr('e', '255,140,60');
          const n = Math.round(fire * 70);
          for (let i = 0; i < n; i++) {
            const p = this.pool.ember[i];
            p.life -= dt * 0.35; p.x += p.vx * dt * 0.05 + Math.sin(t * 2 + i) * 0.0006; p.y += p.vy * dt * 0.08;
            if (p.life <= 0 || p.y < 0.3) Object.assign(p, this.pool.ember.f(), { life: 1 });
            b.globalAlpha = p.life * fire * (0.5 + 0.5 * Math.random());
            b.drawImage(se, p.x * W - 4, p.y * H - 4, 8, 8);
          }
        }
        // —— lucciole: grilli e cicale
        const fl = Math.max(M.m_grilli, M.m_cicale * 0.7);
        if (fl > 0.02) {
          const sf = this.spr('f', A);
          const n = Math.round(fl * 56);
          for (let i = 0; i < n; i++) {
            const p = this.pool.fly[i];
            const a = (Math.sin(p.x * 9 + t * 0.3 + p.ph) + Math.cos(p.y * 7 - t * 0.2)) * Math.PI;
            p.vx = p.vx * 0.96 + Math.cos(a) * 0.0009; p.vy = p.vy * 0.96 + Math.sin(a) * 0.0007;
            p.x += p.vx * dt * 60 * 0.15; p.y += p.vy * dt * 60 * 0.15;
            if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0; if (p.y < 0.15) p.y = 0.95; if (p.y > 1) p.y = 0.2;
            const blink = Math.pow(Math.max(0, Math.sin(t * p.sp + p.ph)), 4);
            if (blink < 0.02) continue;
            b.globalAlpha = blink * (0.5 + fl * 0.5); b.drawImage(sf, p.x * W - 7, p.y * H - 7, 14, 14);
          }
        }
        // —— voci: fumo che vaga
        const vo = M.m_voci * (0.3 + (S.voiceAct || 0));
        if (vo > 0.02) {
          const sB2 = this.spr('b', B);
          this.pool.smoke.forEach(p => {
            p.x += p.vx * dt; if (p.x < -0.2) p.x = 1.2; if (p.x > 1.2) p.x = -0.2;
            const r = p.r * (1 + 0.15 * Math.sin(t * 0.3 + p.ph));
            b.globalAlpha = vo * 0.09; b.drawImage(sB2, p.x * W - r, p.y * H - r + Math.sin(t * 0.2 + p.ph) * 20, r * 2, r * 2);
          });
        }
        // —— grammofono: solchi che girano
        const gr = M.m_grammofono;
        if (gr > 0.02) {
          b.globalAlpha = 1; b.lineWidth = 1;
          for (let i = 0; i < 14; i++) {
            const r = R0 * (1.15 + i * 0.09);
            b.strokeStyle = `rgba(${B},${gr * 0.07})`; b.beginPath(); b.arc(cx, cy, r, 0, TAU); b.stroke();
            const a0 = t * 3.49 + i * 0.05;
            b.strokeStyle = `rgba(${A},${gr * 0.22})`; b.beginPath(); b.arc(cx, cy, r, a0, a0 + 0.5); b.stroke();
          }
        }
        // —— pendolo
        const pe = M.m_pendolo;
        if (pe > 0.02) {
          const ang = 0.32 * Math.sin(t * Math.PI), len = H * 0.5;
          const x = W / 2 + Math.sin(ang) * len, y = Math.cos(ang) * len;
          b.globalAlpha = pe * 0.35; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1;
          b.beginPath(); b.moveTo(W / 2, 0); b.lineTo(x, y); b.stroke();
          b.globalAlpha = pe * 0.6; b.drawImage(this.spr('a', A), x - 16, y - 16, 32, 32);
        }
        // —— polvere nel raggio di luce (soffitta)
        const mo = S.motif.motes || 0;
        if (mo > 0.02) {
          const gr2 = b.createLinearGradient(W * 0.35, 0, W * 0.6, H);
          gr2.addColorStop(0, `rgba(${A},${0.06 * mo * kT})`); gr2.addColorStop(1, `rgba(${A},0)`);
          b.globalAlpha = 1; b.fillStyle = gr2; b.beginPath(); b.moveTo(W * 0.3, 0); b.lineTo(W * 0.48, 0); b.lineTo(W * 0.75, H); b.lineTo(W * 0.42, H); b.closePath(); b.fill();
          const sw2 = this.spr('w', '255,255,255');
          this.pool.mote.forEach(p => {
            p.x += p.vx * dt * 60; p.y += p.vy * dt * 60 - 0.0002;
            if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0; if (p.x < 0.25 || p.x > 0.8) p.vx *= -1;
            b.globalAlpha = mo * (0.3 + 0.3 * Math.sin(t + p.ph)); b.drawImage(sw2, p.x * W - p.s, p.y * H - p.s, p.s * 2, p.s * 2);
          });
        }
        // —— neve
        const sn = S.motif.snow || 0;
        if (sn > 0.02) {
          const sw3 = this.spr('w', '255,255,255');
          this.pool.snow.forEach(p => {
            p.y += p.v * dt * 0.12; p.x += Math.sin(t * 0.8 + p.ph) * 0.0004;
            if (p.y > 1.02) { p.y = -0.02; p.x = Math.random(); }
            b.globalAlpha = sn * 0.7; b.drawImage(sw3, p.x * W - p.s, p.y * H - p.s, p.s * 2, p.s * 2);
          });
        }
        // —— foschia d'estate
        const hz = S.motif.haze || 0;
        if (hz > 0.02) {
          const g3 = b.createRadialGradient(W * 0.5, H * 1.05, 0, W * 0.5, H * 1.05, H * 0.9);
          g3.addColorStop(0, `rgba(${A},${0.07 * hz * kT * (0.8 + 0.2 * Math.sin(t * 0.5))})`); g3.addColorStop(1, `rgba(${A},0)`);
          b.globalAlpha = 1; b.fillStyle = g3; b.fillRect(0, 0, W, H);
        }
      }

      // —— figure dei luoghi
      const mf = k => (S.motif && S.motif[k]) || 0;
      if (imag) {
        // campi: l'erba che si piega col vento
        const fd = mf('field');
        if (fd > 0.02) {
          const wind = 0.5 + M.m_vento * 1.5;
          b.globalAlpha = 1; b.lineWidth = 1;
          ['a', 'b'].forEach((which, wi) => {
            b.strokeStyle = `rgba(${wi ? B : A},${fd * 0.28})`; b.beginPath();
            this.pool.blade.forEach((p, i) => {
              if ((p.c < 0.5) !== !wi) return;
              const x = p.x * W, y0 = H, h = p.h * H;
              const sw = Math.sin(t * 1.1 + p.x * 9 + p.ph * 0.2) * 18 * wind + Math.sin(t * 2.7 + i) * 3;
              b.moveTo(x, y0); b.quadraticCurveTo(x + sw * 0.3, y0 - h * 0.6, x + sw, y0 - h);
            });
            b.stroke();
          });
        }
        // il faro: un fascio che gira
        const bm = mf('beam');
        if (bm > 0.02) {
          const ox = W * 0.12, oy = H * 0.3, a = t * TAU / 12;
          const L2 = Math.max(W, H) * 1.6, sp = 0.09;
          const g = b.createRadialGradient(ox, oy, 0, ox, oy, L2);
          g.addColorStop(0, `rgba(${A},${0.22 * bm * kT})`); g.addColorStop(1, `rgba(${A},0)`);
          b.globalAlpha = 1; b.fillStyle = g; b.beginPath(); b.moveTo(ox, oy);
          b.lineTo(ox + Math.cos(a - sp) * L2, oy + Math.sin(a - sp) * L2); b.lineTo(ox + Math.cos(a + sp) * L2, oy + Math.sin(a + sp) * L2); b.closePath(); b.fill();
          b.globalAlpha = bm * 0.8; b.drawImage(this.spr('w', '255,255,255'), ox - 10, oy - 10, 20, 20);
        }
        // la camera prima di dormire: fari che passano sul soffitto, luce sotto la porta
        const ce = mf('ceiling');
        if (ce > 0.02) {
          this.sweepNext -= dt;
          if (!this.sweep && this.sweepNext <= 0) { this.sweep = { k: 0, dir: Math.random() < 0.5 ? 1 : -1, dur: rnd(2.5, 4.5) }; this.sweepNext = rnd(7, 18); }
          if (this.sweep) {
            const sw = this.sweep; sw.k += dt / sw.dur;
            const x = (sw.dir > 0 ? sw.k : 1 - sw.k) * (W * 1.4) - W * 0.2, skew = W * 0.25;
            const g = b.createLinearGradient(x - 90, 0, x + 90, 0);
            g.addColorStop(0, `rgba(${A},0)`); g.addColorStop(0.5, `rgba(${A},${0.12 * ce * Math.sin(Math.PI * sw.k) * kT})`); g.addColorStop(1, `rgba(${A},0)`);
            b.globalAlpha = 1; b.fillStyle = g; b.beginPath(); b.moveTo(x - 90, 0); b.lineTo(x + 90, 0); b.lineTo(x + 90 + skew, H * 0.7); b.lineTo(x - 90 + skew, H * 0.7); b.closePath(); b.fill();
            if (sw.k >= 1) this.sweep = null;
          }
          const g2 = b.createLinearGradient(0, H * 0.94, 0, H);
          g2.addColorStop(0, `rgba(${A},0)`); g2.addColorStop(1, `rgba(${A},${0.1 * ce * kT})`);
          b.fillStyle = g2; b.fillRect(W * 0.38, H * 0.94, W * 0.24, H * 0.06);
        }
        // gocce sul vetro
        const gl = mf('glass');
        if (gl > 0.02) {
          const sw5 = this.spr('w', '255,255,255');
          b.lineWidth = 1;
          this.pool.glass.forEach(p => {
            if (!p.v && Math.random() < 0.002) p.v = rnd(0.02, 0.08);
            if (p.v) { p.y += p.v * dt; p.trail.push(p.y); if (p.trail.length > 30) p.trail.shift(); if (p.y > 1.05) { p.y = Math.random() * 0.4; p.v = 0; p.trail = []; } }
            if (p.trail.length > 1) { b.globalAlpha = gl * 0.18; b.strokeStyle = `rgba(${A},1)`; b.beginPath(); b.moveTo(p.x * W, p.trail[0] * H); b.lineTo(p.x * W, p.y * H); b.stroke(); }
            b.globalAlpha = gl * 0.5 * kT * 2; b.drawImage(sw5, p.x * W - p.r, p.y * H - p.r, p.r * 2, p.r * 2);
          });
        }
        // il monitor: la linea del cuore
        const mo2 = mf('monitor');
        if (mo2 > 0.02) {
          const n = this.ecg.length;
          const shiftN = Math.max(1, Math.round(dt * 90));
          for (let k = 0; k < shiftN; k++) { this.ecg.copyWithin(0, 1); this.ecg[n - 1] = this.ecgQ.length ? this.ecgQ.shift() : (Math.random() - 0.5) * 0.015; }
          const y0 = H * 0.78, amp = H * 0.12;
          b.globalAlpha = mo2; b.strokeStyle = `rgba(${A},0.85)`; b.lineWidth = 1.6; b.beginPath();
          for (let i = 0; i < n; i++) { const x = W * 0.08 + i / (n - 1) * W * 0.84, y = y0 - this.ecg[i] * amp; i ? b.lineTo(x, y) : b.moveTo(x, y); }
          b.stroke();
          b.globalAlpha = mo2 * 0.8; b.drawImage(this.spr('a', A), W * 0.92 - 8, y0 - this.ecg[n - 1] * amp - 8, 16, 16);
        }
        // la febbre: l'immagine che ondeggia
        const fv = mf('fever');
        if (fv > 0.02) {
          b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over';
          const cw = b.canvas.width, ch = b.canvas.height, sc = 1 + 0.012 * fv * Math.sin(t * 0.9);
          const dx = Math.sin(t * 0.7) * cw * 0.008 * fv, rot = Math.sin(t * 0.43) * 0.01 * fv;
          b.globalAlpha = 0.16 * fv; b.translate(cw / 2 + dx, ch / 2); b.rotate(rot); b.scale(sc, sc);
          b.drawImage(b.canvas, -cw / 2, -ch / 2);
          b.restore(); b.globalCompositeOperation = 'lighter';
        }
        // il sole
        const sn2 = mf('sun');
        if (sn2 > 0.02) {
          const sx = W * 0.78, sy = H * 0.16, rr = Math.min(W, H) * 0.55;
          b.globalAlpha = 0.09 * sn2 * kT * 2; b.drawImage(this.spr('a', A), sx - rr, sy - rr, rr * 2, rr * 2);
          b.globalAlpha = sn2 * 0.12; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1;
          for (let i = 0; i < 14; i++) { const a = t * 0.05 + i / 14 * TAU; b.beginPath(); b.moveTo(sx + Math.cos(a) * rr * 0.2, sy + Math.sin(a) * rr * 0.2); b.lineTo(sx + Math.cos(a) * rr * (0.6 + 0.2 * Math.sin(t + i)), sy + Math.sin(a) * rr * (0.6 + 0.2 * Math.sin(t + i))); b.stroke(); }
        }
        // l'incontro: due luci che si cercano
        const mt = mf('meet');
        if (mt > 0.02) {
          const d = (0.5 + 0.5 * Math.cos(t * 0.09)) * W * 0.32 + 12;
          const yy = cy + Math.sin(t * 0.3) * 20, close = 1 - Math.min(1, d / (W * 0.3));
          const r1 = 30 + close * 50;
          b.globalAlpha = mt * (0.15 + close * 0.25) * kT * 2; b.drawImage(this.spr('a', A), cx - d - r1, yy - r1, r1 * 2, r1 * 2);
          b.drawImage(this.spr('b', B), cx + d - r1, yy - r1 + Math.sin(t * 0.5) * 10, r1 * 2, r1 * 2);
          b.globalAlpha = mt * 0.9; const sw6 = this.spr('w', '255,255,255');
          b.drawImage(sw6, cx - d - 4, yy - 4, 8, 8); b.drawImage(sw6, cx + d - 4, yy - 4 + Math.sin(t * 0.5) * 10, 8, 8);
        }
        // la stazione: la banchina e i finestrini del treno
        const tn = mf('train');
        if (tn > 0.02) {
          const yb = H * 0.7;
          b.globalAlpha = tn * 0.25; b.strokeStyle = `rgba(${B},1)`; b.lineWidth = 1;
          b.beginPath(); b.moveTo(0, yb); b.lineTo(W, yb); b.moveTo(0, yb + 14); b.lineTo(W, yb + 14); b.stroke();
          if (this.trainPass) {
            const tp = this.trainPass; tp.t += dt; const k = tp.t / tp.dur, env = Math.pow(Math.sin(Math.PI * Math.min(1, k)), 2);
            const off = (tp.t * 260) % 120;
            b.globalAlpha = env * tn * 0.5; b.fillStyle = `rgba(${A},1)`;
            for (let x = -off; x < W; x += 120) b.fillRect(x, yb - 52, 70, 26);
            if (k >= 1) this.trainPass = null;
          }
        }
        // la fiera: lampadine e giostra
        const lt = mf('lights');
        if (lt > 0.02) {
          const sA3 = this.spr('a', A), sB3 = this.spr('b', B);
          for (let k = 0; k < 3; k++) {
            const y0 = H * (0.08 + k * 0.07), sag = H * 0.06;
            for (let i = 0; i <= 24; i++) {
              const u = i / 24, x = u * W, y = y0 + sag * 4 * u * (1 - u) + Math.sin(t * 0.8 + k) * 4;
              const on = ((i + Math.floor(t * 6) + k) % 3) === 0 ? 1 : 0.35;
              b.globalAlpha = lt * on * 0.6; b.drawImage(i % 2 ? sA3 : sB3, x - 6, y - 6, 12, 12);
            }
          }
          for (let i = 0; i < 28; i++) {
            const a = t * 0.6 + i / 28 * TAU, x = cx + Math.cos(a) * W * 0.22, y = H * 0.82 + Math.sin(a) * H * 0.05;
            b.globalAlpha = lt * (0.3 + 0.3 * Math.sin(a)) ; b.drawImage(i % 2 ? sA3 : sB3, x - 5, y - 5, 10, 10);
          }
        }
        // rovine: la luce che manca
        const ru = mf('ruin');
        if (ru > 0.02) {
          this.flickerT -= dt;
          if (this.flickerT <= 0) { this.flickerT = rnd(0.05, 4); if (Math.random() < 0.5) { b.globalCompositeOperation = 'source-over'; b.globalAlpha = 0.35 * ru; b.fillStyle = `rgb(${S.rgbBg || '0,0,0'})`; b.fillRect(0, 0, W, H); b.globalCompositeOperation = 'lighter'; } }
          for (let k = 0; k < 2; k++) {
            const x0 = W * (0.2 + k * 0.45);
            const g = b.createLinearGradient(x0, 0, x0 + W * 0.15, H);
            g.addColorStop(0, `rgba(${A},${0.07 * ru * kT})`); g.addColorStop(1, `rgba(${A},0)`);
            b.globalAlpha = 1; b.fillStyle = g; b.beginPath(); b.moveTo(x0, 0); b.lineTo(x0 + 40, 0); b.lineTo(x0 + W * 0.2, H); b.lineTo(x0 + W * 0.12, H); b.closePath(); b.fill();
          }
        }
        // il pozzo: cerchi nell'acqua
        const wl = mf('well');
        if (wl > 0.02) {
          b.globalAlpha = 1;
          const g = b.createRadialGradient(cx, cy, 0, cx, cy, R0 * 1.6);
          g.addColorStop(0, `rgba(0,0,0,${0.25 * wl})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          b.globalCompositeOperation = 'source-over'; b.fillStyle = g; b.fillRect(cx - R0 * 2, cy - R0 * 2, R0 * 4, R0 * 4); b.globalCompositeOperation = 'lighter';
        }
        this.ripples.forEach(r => {
          r.life -= dt * 0.35; r.r += dt * 60;
          const x = wl > 0.3 ? cx : r.x * W, y = wl > 0.3 ? cy : r.y * H;
          b.globalAlpha = Math.max(0, r.life) * 0.45; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1;
          b.beginPath(); b.ellipse(x, y, r.r, r.r * (wl > 0.3 ? 1 : 0.32), 0, 0, TAU); b.stroke();
        });
        this.ripples = this.ripples.filter(r => r.life > 0);
        // stormi
        this.flocks.forEach(f => {
          f.x += f.vx * dt; f.ph += dt * 9;
          b.globalAlpha = 0.55; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1.2; b.beginPath();
          for (let i = 0; i < f.n; i++) {
            const x = (f.x - Math.sign(f.vx) * i * 0.018) * W, y = f.y * H + Math.abs(i - f.n / 2) * 7 + Math.sin(t + i) * 3;
            const fl = Math.sin(f.ph + i) * f.s * 0.6;
            b.moveTo(x - f.s, y - fl); b.lineTo(x, y); b.lineTo(x + f.s, y - fl);
          }
          b.stroke();
        });
        this.flocks = this.flocks.filter(f => f.x > -0.3 && f.x < 1.3);
      }
      // il cuore: i bordi pulsano
      if (this.heartPulse > 0.01 && M.m_cuore > 0.02) {
        const g = b.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
        g.addColorStop(0, `rgba(${A},0)`); g.addColorStop(1, `rgba(${A},${this.heartPulse * M.m_cuore * 0.12})`);
        b.globalAlpha = 1; b.fillStyle = g; b.fillRect(0, 0, W, H);
      }
      this.heartPulse *= Math.pow(0.02, dt);

      if (this.drawPlus) this.drawPlus(b, S, dt, W, H, cx, cy, R0, kT, A, B, t);
      // —— costellazioni del carillon
      if (this.stars.length) {
        const sw4 = this.spr('w', '255,255,255'), sA = this.spr('a', A);
        for (let i = this.stars.length - 1; i >= 0; i--) {
          const s = this.stars[i]; s.life -= dt * 0.12;
          if (s.life <= 0) { this.stars.splice(i, 1); continue; }
        }
        if (sw.constellatio && this.stars.length > 1) {
          b.lineWidth = 1;
          for (let i = 1; i < this.stars.length; i++) {
            const a = this.stars[i - 1], c = this.stars[i];
            b.globalAlpha = Math.min(a.life, c.life) * 0.35; b.strokeStyle = `rgba(${A},1)`;
            b.beginPath(); b.moveTo(a.x * W, a.y * H); b.lineTo(c.x * W, c.y * H); b.stroke();
          }
        }
        this.stars.forEach(s => {
          const x = s.x * W, y = s.y * H, r = 3 + s.life * 10;
          b.globalAlpha = s.life * 0.5 * kT; b.drawImage(sA, x - r * 2, y - r * 2, r * 4, r * 4);
          b.globalAlpha = s.life; b.drawImage(sw4, x - 3, y - 3, 6, 6);
          b.strokeStyle = `rgba(${A},${s.life * 0.6})`; b.beginPath();
          b.moveTo(x - r * 1.6, y); b.lineTo(x + r * 1.6, y); b.moveTo(x, y - r * 1.6); b.lineTo(x, y + r * 1.6); b.stroke();
        });
      }

      // —— eventi
      const sA2 = this.spr('a', A);
      for (let i = this.ev.length - 1; i >= 0; i--) {
        const e = this.ev[i];
        if (e.k === 'bloom') {
          e.life -= dt * 0.22; const r = e.r * (1.4 - e.life * 0.4);
          b.globalAlpha = Math.max(0, e.life) * 0.12 * kT; b.drawImage(this.spr('b', B), e.x * W - r, e.y * H - r, r * 2, r * 2);
        } else if (e.k === 'toll') {
          e.life -= dt * 0.22; const r = H * (0.15 + (1 - e.life) * 1.2);
          b.globalAlpha = Math.max(0, e.life) * 0.4; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1 + e.life * 2.5;
          b.beginPath(); b.arc(W / 2, -H * 0.2, r, 0, TAU); b.stroke();
        } else if (e.k === 'bowl') {
          e.life -= dt * 0.12; const r = R0 * (0.6 + (1 - e.life) * 2.6);
          b.globalAlpha = Math.max(0, e.life) * 0.45; b.strokeStyle = `rgba(${B},1)`; b.lineWidth = 1 + e.life * 3;
          b.beginPath(); b.arc(cx + e.pan * R0 * 0.5, cy, r, 0, TAU); b.stroke();
          b.globalAlpha = Math.max(0, e.life) * 0.05 * kT; b.drawImage(sA2, cx - r, cy - r, r * 2, r * 2);
        } else if (e.k === 'drop') {
          e.life -= dt * 2.2; const r = 2 + (1 - e.life) * 16;
          b.globalAlpha = Math.max(0, e.life) * 0.5; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1;
          b.beginPath(); b.ellipse(e.x * W, e.y * H, r, r * 0.35, 0, 0, TAU); b.stroke();
        } else if (e.k === 'spark') {
          e.life -= dt * 1.5; e.y -= dt * 0.05;
          b.globalAlpha = Math.max(0, e.life); b.drawImage(this.spr('e', '255,170,80'), e.x * W - 5, e.y * H - 5, 10, 10);
        }
        if (e.life <= 0) this.ev.splice(i, 1);
      }

      // —— respiro guidato
      if (S.breathOn) {
        const br = S.breath01;
        const r = R0 * (0.75 + br * 0.75);
        b.globalAlpha = (0.04 + br * 0.08) * kT; b.drawImage(sA2, cx - r * 1.3, cy - r * 1.3, r * 2.6, r * 2.6);
        b.globalAlpha = 0.35 + br * 0.3; b.strokeStyle = `rgba(${A},1)`; b.lineWidth = 1.5;
        b.beginPath(); b.arc(cx, cy, r, 0, TAU); b.stroke();
      }
      b.globalAlpha = 1;
      b.globalCompositeOperation = 'source-over';
    }
  }

  ATH.Dream = Dream;
})(window.ATH);
