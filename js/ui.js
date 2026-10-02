/* ATHANOR — manopole e sigilli. Le manopole mostrano due cose: dove le hai
   messe tu (l'arco) e dove le sta portando lo Spiritus (il punto acceso).
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const A0 = -135, A1 = 135;
  const ang = v => (A0 + (A1 - A0) * v) * Math.PI / 180;
  const pt = (r, v) => [32 + Math.sin(ang(v)) * r, 32 - Math.cos(ang(v)) * r];
  function arc(r, v0, v1) {
    if (v1 - v0 < 0.002) return '';
    const [x0, y0] = pt(r, v0), [x1, y1] = pt(r, v1);
    const large = (v1 - v0) * 270 > 180 ? 1 : 0;
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

  class Knob {
    constructor(p, onChange) {
      this.p = p; this.onChange = onChange; this.v = p.def; this.live = p.def;
      const el = this.el = document.createElement('div');
      el.className = 'knob';
      let ticks = '';
      for (let i = 0; i <= 10; i++) {
        const [x0, y0] = pt(27.5, i / 10), [x1, y1] = pt(i % 5 === 0 ? 31 : 29.5, i / 10);
        ticks += `<line x1="${x0.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${x1.toFixed(2)}" y2="${y1.toFixed(2)}"/>`;
      }
      el.innerHTML = `
        <div class="dial" id="k-${p.id}" role="slider" tabindex="0" aria-label="${p.name}" aria-valuemin="0" aria-valuemax="100" title="${p.name} · ${p.gloss}">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <g class="ticks">${ticks}</g>
            <path class="track" d="${arc(24, 0, 1)}"/>
            <path class="val" d=""/>
            <circle class="well" cx="32" cy="32" r="17"/>
            <line class="needle" x1="32" y1="32" x2="32" y2="19"/>
            <circle class="live" r="2.6" cx="32" cy="8"/>
          </svg>
        </div>
        <div class="kname"><span class="glyph" aria-hidden="true">${p.glyph}</span>${p.name}</div>
        <div class="kval"></div>`;
      this.dial = el.querySelector('.dial');
      this.valPath = el.querySelector('.val');
      this.needle = el.querySelector('.needle');
      this.liveDot = el.querySelector('.live');
      this.out = el.querySelector('.kval');
      this.bind();
      this.render();
    }
    bind() {
      const d = this.dial;
      let sx = 0, sy = 0, sv = 0, id = null;
      d.addEventListener('pointerdown', e => {
        id = e.pointerId; d.setPointerCapture(id); sx = e.clientX; sy = e.clientY; sv = this.v;
        d.classList.add('grab'); e.preventDefault();
      });
      d.addEventListener('pointermove', e => {
        if (e.pointerId !== id) return;
        const fine = e.shiftKey ? 0.25 : 1;
        const delta = ((sy - e.clientY) + (e.clientX - sx) * 0.6) / 170 * fine;
        this.set(sv + delta, true);
      });
      const end = e => { if (e.pointerId === id) { id = null; d.classList.remove('grab'); } };
      d.addEventListener('pointerup', end); d.addEventListener('pointercancel', end);
      d.addEventListener('dblclick', () => this.set(this.p.def, true));
      d.addEventListener('wheel', e => { e.preventDefault(); this.set(this.v - Math.sign(e.deltaY) * 0.02, true); }, { passive: false });
      d.addEventListener('keydown', e => {
        const step = { ArrowUp: 0.01, ArrowRight: 0.01, ArrowDown: -0.01, ArrowLeft: -0.01, PageUp: 0.1, PageDown: -0.1 }[e.key];
        if (step !== undefined) { e.preventDefault(); e.stopPropagation(); this.set(this.v + step, true); }
        else if (e.key === 'Home') { e.preventDefault(); this.set(0, true); }
        else if (e.key === 'End') { e.preventDefault(); this.set(1, true); }
      });
    }
    set(v, user) {
      this.v = clamp01(v);
      this.render();
      if (user) this.onChange(this.p.id, this.v);
    }
    setLive(v) {
      this.live = v;
      const [x, y] = pt(24, v);
      this.liveDot.setAttribute('cx', x.toFixed(2)); this.liveDot.setAttribute('cy', y.toFixed(2));
      this.out.textContent = this.p.fmt(v);
    }
    render() {
      this.valPath.setAttribute('d', arc(24, 0, this.v));
      const [x, y] = pt(13, this.v);
      this.needle.setAttribute('x2', x.toFixed(2)); this.needle.setAttribute('y2', y.toFixed(2));
      this.dial.setAttribute('aria-valuenow', Math.round(this.v * 100));
      this.dial.setAttribute('aria-valuetext', this.p.fmt(this.v));
      if (this.live === undefined) this.setLive(this.v);
    }
  }

  class Seal {
    constructor(s, onChange) {
      this.s = s; this.onChange = onChange; this.on = s.def;
      const el = this.el = document.createElement('button');
      el.type = 'button'; el.className = 'seal'; el.id = 's-' + s.id;
      el.title = s.name + ' · ' + s.gloss;
      el.innerHTML = `<span class="lamp" aria-hidden="true">${s.glyph}</span><span class="sname">${s.name}</span>`;
      el.addEventListener('click', () => { this.set(!this.on); this.onChange(s.id, this.on); });
      this.render();
    }
    set(v) { this.on = !!v; this.render(); }
    render() { this.el.setAttribute('aria-pressed', this.on ? 'true' : 'false'); }
  }

  class Choice {
    constructor(ch, onChange) {
      this.ch = ch; this.onChange = onChange; this.v = ch.def;
      const el = this.el = document.createElement('div');
      el.className = 'choice';
      el.innerHTML = `<span class="clabel" id="cl-${ch.id}">${ch.name}</span><div class="chips" role="radiogroup" aria-labelledby="cl-${ch.id}"></div>`;
      const box = el.querySelector('.chips');
      this.btns = ch.options.map(o => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.setAttribute('role', 'radio'); b.dataset.v = o.v; b.textContent = o.label;
        b.addEventListener('click', () => { this.set(o.v); this.onChange(ch.id, o.v); });
        box.appendChild(b); return b;
      });
      this.render();
    }
    set(v) { if (this.ch.options.some(o => o.v === v)) { this.v = v; this.render(); } }
    render() { this.btns.forEach(b => b.setAttribute('aria-checked', b.dataset.v === this.v ? 'true' : 'false')); }
  }

  // Costruisce tutte le schede. h = { knob, seal, choice, scene, action }
  ATH.buildPanel = function (root, h) {
    const knobs = {}, seals = {}, choices = {}, scenes = {};
    ATH.GROUPS.forEach(g => {
      const sec = document.createElement('section');
      sec.className = 'vessel kind-' + (g.kind || 'knobs'); sec.dataset.group = g.id; sec.dataset.tab = g.tab;
      sec.style.setProperty('--span', g.span || 12); sec.style.setProperty('--span-md', g.md || 12);
      sec.innerHTML = `<header class="vh"><span class="num">${g.num}</span><h2>${g.name}</h2><span class="vg">${g.gloss}</span></header>`;
      const kind = g.kind || 'knobs';
      if (kind === 'knobs') {
        const box = document.createElement('div'); box.className = 'knobs'; sec.appendChild(box);
        ATH.PARAMS.filter(p => p.group === g.id).forEach(p => { const k = new Knob(p, h.knob); knobs[p.id] = k; box.appendChild(k.el); });
      }
      const sw = ATH.SWITCHES.filter(s => s.group === g.id);
      if (sw.length || g.action) {
        const box = document.createElement('div'); box.className = 'seals'; sec.appendChild(box);
        sw.forEach(s => { const x = new Seal(s, h.seal); seals[s.id] = x; box.appendChild(x.el); });
        if (g.action) {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-act'; b.id = 'act-' + g.action.id;
          b.textContent = g.action.label; b.title = g.action.title || '';
          b.addEventListener('click', () => h.action(g.action.id));
          box.appendChild(b);
        }
      }
      if (kind === 'choices') {
        const box = document.createElement('div'); box.className = 'choices'; sec.appendChild(box);
        ATH.CHOICES.filter(c => c.group === g.id).forEach(c => { const x = new Choice(c, h.choice); choices[c.id] = x; box.appendChild(x.el); });
        if (g.note) { const n = document.createElement('p'); n.className = 'vnote'; n.textContent = g.note; sec.appendChild(n); }
      }
      if (kind === 'scenes') {
        const box = document.createElement('div'); box.className = 'scenes'; sec.appendChild(box);
        ATH.SCENES.forEach(sc => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'scene'; b.id = 'sc-' + sc.id;
          b.style.setProperty('--sc', `rgb(${sc.pal.accent.join(',')})`);
          b.style.setProperty('--sc-bg', `rgb(${sc.pal.bg.join(',')})`);
          b.innerHTML = `<span class="sc-name">${sc.name}</span><span class="sc-gloss">${sc.gloss}</span>`;
          b.addEventListener('click', () => h.scene(sc.id));
          scenes[sc.id] = b; box.appendChild(b);
        });
        const f = document.createElement('button'); f.type = 'button'; f.className = 'scene scene-forget'; f.id = 'sc-oblivio';
        f.innerHTML = `<span class="sc-name">Dimentica</span><span class="sc-gloss">i ricordi si spengono piano</span>`;
        f.addEventListener('click', () => h.scene(null));
        box.appendChild(f);
      }
      root.appendChild(sec);
    });
    return { knobs, seals, choices, scenes };
  };
})(window.ATH);
