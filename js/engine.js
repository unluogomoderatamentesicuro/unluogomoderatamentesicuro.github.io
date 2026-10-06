/* ATHANOR — il motore audio (Web Audio API, nessuna libreria).
   Sorgenti → Alambicco → Vaso (filtri) → Fuoco (saturazione) → Ouroboros (eco)
   → Cripta e Cielo (riverberi) → Lux (uscita, limitatore, registratore).
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  function noiseBuffer(ctx, kind, seconds) {
    const sr = ctx.sampleRate, len = Math.floor(sr * seconds);
    const buf = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === 'white') d[i] = w;
        else if (kind === 'pink') {
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
          b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
          b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
        } else {
          last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5;
        }
      }
      // dissolvenza agli estremi per un loop senza clic
      const f = Math.min(2048, len >> 4);
      for (let i = 0; i < f; i++) { const g = i / f; d[i] *= g; d[len - 1 - i] *= g; }
    }
    return buf;
  }

  function impulse(ctx, seconds, decay, bright, dark) {
    const sr = ctx.sampleRate, len = Math.floor(sr * seconds);
    const buf = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const k = clamp(bright * (1 - t * dark), 0.01, 1);   // si scurisce col tempo
        lp += (Math.random() * 2 - 1 - lp) * k;
        d[i] = lp * Math.pow(1 - t, decay) * (i < sr * 0.004 ? i / (sr * 0.004) : 1);
      }
    }
    return buf;
  }

  function curveTanh(k) {
    const n = 2048, c = new Float32Array(n), norm = Math.tanh(k);
    for (let i = 0; i < n; i++) {
      const x = i / (n - 1) * 2 - 1;
      const y = x >= 0 ? Math.tanh(k * x) / norm : Math.tanh(k * 0.8 * x) / Math.tanh(k * 0.8) * 0.92;
      c[i] = y;
    }
    return c;
  }

  function curveSoft() {
    const n = 2048, c = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(x * 1.3) / 1.3 * 1.08; }
    return c;
  }

  class Engine {
    constructor() {
      this.ready = false;
      this.listeners = {};
      this.t = 0;
      this.cryptaSize = -1;
    }
    on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
    emit(ev, data) { (this.listeners[ev] || []).forEach(fn => fn(data)); }

    async start() {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = this.ctx = new AC({ latencyHint: 'playback' });
      this.useWorklet = false;
      if (ctx.audioWorklet) {
        try {
          const url = URL.createObjectURL(new Blob([ATH.WORKLET_SRC], { type: 'application/javascript' }));
          await ctx.audioWorklet.addModule(url);
          this.useWorklet = true;
        } catch (e) { this.useWorklet = false; }
      }
      this.build();
      if (ctx.state !== 'running') await ctx.resume();
      this.ready = true;
    }

    T(param, v, tau) {
      if (!isFinite(v)) return;
      param.setTargetAtTime(v, this.ctx.currentTime, tau || 0.08);
    }

    build() {
      const c = this.ctx;
      const G = v => { const g = c.createGain(); g.gain.value = v === undefined ? 1 : v; return g; };

      this.sources = G(1);

      // —— Drone: sei voci, ciascuna sinusoide + dente di sega
      this.droneBus = G(0);
      this.fmOsc = c.createOscillator(); this.fmOsc.frequency.value = 60;
      this.fmGain = G(0); this.fmOsc.connect(this.fmGain); this.fmOsc.start();
      const pans = [-0.55, 0.5, -0.2, 0.75, 0.15, -0.8];
      this.voices = [];
      for (let i = 0; i < 6; i++) {
        const s = c.createOscillator(); s.type = 'sine';
        const w = c.createOscillator(); w.type = 'sawtooth';
        const gs = G(0.8), gw = G(0.2), vg = G(0);
        const pan = c.createStereoPanner(); pan.pan.value = pans[i];
        s.connect(gs); w.connect(gw); gs.connect(vg); gw.connect(vg); vg.connect(pan); pan.connect(this.droneBus);
        this.fmGain.connect(s.frequency); this.fmGain.connect(w.frequency);
        s.frequency.value = 60; w.frequency.value = 60;
        s.start(); w.start();
        this.voices.push({ s, w, gs, gw, vg, ph: Math.random() * 6.28, spread: Math.random() * 2 - 1 });
      }
      // Coniunctio: modulazione ad anello del drone
      this.ringDry = G(1); this.ringVCA = G(0); this.ringWet = G(0);
      this.ringOsc = c.createOscillator(); this.ringOsc.frequency.value = 130; this.ringOsc.start();
      this.ringOsc.connect(this.ringVCA.gain);
      this.droneBus.connect(this.ringDry); this.droneBus.connect(this.ringVCA);
      this.ringVCA.connect(this.ringWet);
      this.ringDry.connect(this.sources); this.ringWet.connect(this.sources);

      // —— Rumori: bruno, rosa, bianco
      this.noise = {};
      ['brown', 'pink', 'white'].forEach((k, i) => {
        const src = c.createBufferSource(); src.buffer = noiseBuffer(c, k, 4 + i * 0.37); src.loop = true;
        const g = G(0); src.connect(g); g.connect(this.sources); src.start();
        this.noise[k] = { src, g };
      });
      // tempesta: raffica di rumore filtrato
      this.storm = G(0);
      this.stormFilter = c.createBiquadFilter(); this.stormFilter.type = 'bandpass'; this.stormFilter.Q.value = 0.7; this.stormFilter.frequency.value = 900;
      const stormSrc = c.createBufferSource(); stormSrc.buffer = this.noise.white.src.buffer; stormSrc.loop = true; stormSrc.start();
      stormSrc.connect(this.stormFilter); this.stormFilter.connect(this.storm); this.storm.connect(this.sources);

      // —— Campane di piombo
      this.bellBus = G(0.5);
      this.bellBus.connect(this.sources);

      // —— Alambicco
      if (this.useWorklet) {
        this.alembic = new AudioWorkletNode(c, 'athanor-alembic', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
        this.alP = this.alembic.parameters;
      } else {
        const core = new ATH.AlembicCore(c.sampleRate);
        this.alState = { fold: 0, bits: 16, decim: 1, dust: 0, gate: 0, chaos: 0.5 };
        this.alembic = c.createScriptProcessor(2048, 2, 2);
        this.alembic.onaudioprocess = e => {
          const ib = e.inputBuffer, ob = e.outputBuffer;
          core.process(ib.getChannelData(0), ib.getChannelData(1), ob.getChannelData(0), ob.getChannelData(1), ob.length, this.alState);
        };
      }
      this.furnace = G(1);
      this.sources.connect(this.furnace); this.furnace.connect(this.alembic);
      this.dcBlock = c.createBiquadFilter(); this.dcBlock.type = 'highpass'; this.dcBlock.frequency.value = 22;
      this.alembic.connect(this.dcBlock);

      // —— Vaso: passa-basso e passa-banda in parallelo
      this.lp = c.createBiquadFilter(); this.lp.type = 'lowpass';
      this.bp = c.createBiquadFilter(); this.bp.type = 'bandpass';
      this.gLP = G(1); this.gBP = G(0);
      this.dcBlock.connect(this.lp); this.dcBlock.connect(this.bp);
      this.lp.connect(this.gLP); this.bp.connect(this.gBP);
      this.vasOut = G(1); this.gLP.connect(this.vasOut); this.gBP.connect(this.vasOut);

      // —— Fuoco: saturazione asimmetrica
      this.driveIn = G(1); this.shaper = c.createWaveShaper(); this.shaper.curve = curveTanh(3); this.shaper.oversample = '4x';
      this.driveOut = G(0.8); this.fireDry = G(0);
      this.vasOut.connect(this.driveIn); this.driveIn.connect(this.shaper); this.shaper.connect(this.driveOut);
      this.vasOut.connect(this.fireDry);
      this.corpus = G(1); this.driveOut.connect(this.corpus); this.fireDry.connect(this.corpus);

      this.masterSum = G(1);
      this.dry = G(1); this.corpus.connect(this.dry); this.dry.connect(this.masterSum);

      // —— Ouroboros: eco ping-pong con saturazione nel loop
      this.delayIn = G(0.6);
      this.dL = c.createDelay(5); this.dR = c.createDelay(5);
      const loop = (d) => {
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4000;
        const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 60;
        const sh = c.createWaveShaper(); sh.curve = curveSoft();
        const fb = G(0.4);
        d.connect(lp); lp.connect(hp); hp.connect(sh); sh.connect(fb);
        return { lp, fb };
      };
      this.loopL = loop(this.dL); this.loopR = loop(this.dR);
      this.corpus.connect(this.delayIn); this.delayIn.connect(this.dL);
      this.loopL.fb.connect(this.dR); this.loopR.fb.connect(this.dL);
      this.delayOut = G(0.5);
      const pL = c.createStereoPanner(); pL.pan.value = -0.7;
      const pR = c.createStereoPanner(); pR.pan.value = 0.7;
      this.dL.connect(pL); this.dR.connect(pR); pL.connect(this.delayOut); pR.connect(this.delayOut);
      this.delayOut.connect(this.masterSum);
      // modulazione del tempo dell'eco (nastro stanco)
      this.dmodOsc = c.createOscillator(); this.dmodOsc.type = 'triangle'; this.dmodOsc.frequency.value = 0.1; this.dmodOsc.start();
      this.dmod = G(0.002); this.dmodOsc.connect(this.dmod); this.dmod.connect(this.dL.delayTime); this.dmod.connect(this.dR.delayTime);

      // —— Crypta: riverbero scuro
      this.cryptaSend = G(0.4); this.crypta = c.createConvolver(); this.cryptaOut = G(0.9);
      this.corpus.connect(this.cryptaSend); this.delayOut.connect(this.cryptaSend); this.bellBus.connect(this.cryptaSend);
      this.cryptaSend.connect(this.crypta); this.crypta.connect(this.cryptaOut); this.cryptaOut.connect(this.masterSum);
      this.setCryptaSize(0.5);

      // —— Sublimatio: invio brillante verso un cielo lunghissimo
      this.subHP = c.createBiquadFilter(); this.subHP.type = 'highpass'; this.subHP.frequency.value = 1400;
      this.subSend = G(0.2); this.caelum = c.createConvolver(); this.caelum.buffer = impulse(c, 11, 2.2, 0.75, 0.5);
      this.caelumOut = G(0.7);
      this.corpus.connect(this.subHP); this.bellBus.connect(this.subHP);
      this.subHP.connect(this.subSend); this.subSend.connect(this.caelum); this.caelum.connect(this.caelumOut); this.caelumOut.connect(this.masterSum);

      // —— Quies: bus pulito per la quiete, con il suo alone
      this.quietIn = G(1); this.quietOut = G(0.5); this.halo = G(0.4); this.quietEcho = G(0);
      this.quietIn.connect(this.quietOut); this.quietOut.connect(this.masterSum);
      this.quietOut.connect(this.halo); this.halo.connect(this.caelum); this.halo.connect(this.crypta);
      this.quietOut.connect(this.quietEcho); this.quietEcho.connect(this.delayIn);

      // —— Lux: uscita
      this.lux = G(0.5);
      this.comp = c.createDynamicsCompressor();
      this.comp.threshold.value = -12; this.comp.knee.value = 8; this.comp.ratio.value = 10;
      this.comp.attack.value = 0.004; this.comp.release.value = 0.3;
      this.finalClip = c.createWaveShaper(); this.finalClip.curve = curveTanh(1.1);
      this.out = G(0.92);
      this.masterSum.connect(this.lux); this.lux.connect(this.comp); this.comp.connect(this.finalClip); this.finalClip.connect(this.out);
      this.analyser = c.createAnalyser(); this.analyser.fftSize = 2048; this.analyser.smoothingTimeConstant = 0.78;
      this.out.connect(this.analyser); this.out.connect(c.destination);

      // —— Registrazione
      this.mediaDest = c.createMediaStreamDestination ? c.createMediaStreamDestination() : null;
      if (this.mediaDest) this.out.connect(this.mediaDest);
      this.recSilent = G(0); this.recSilent.connect(c.destination);
      if (this.useWorklet) {
        this.recNode = new AudioWorkletNode(c, 'athanor-recorder', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
      } else {
        this.recNode = c.createScriptProcessor(4096, 2, 2);
        this.recNode.onaudioprocess = e => {
          if (!this.recOn) return;
          const L = e.inputBuffer.getChannelData(0), R = e.inputBuffer.getChannelData(1);
          const out = new Int16Array(L.length * 2);
          for (let i = 0; i < L.length; i++) {
            const l = clamp(L[i], -1, 1), r = clamp(R[i], -1, 1);
            out[i * 2] = l < 0 ? l * 32768 : l * 32767; out[i * 2 + 1] = r < 0 ? r * 32768 : r * 32767;
          }
          this.recChunk && this.recChunk(out);
        };
      }
      this.out.connect(this.recNode); this.recNode.connect(this.recSilent);
    }

    setCryptaSize(v) {
      const q = Math.round(v * 20) / 20;
      if (q === this.cryptaSize) return;
      this.cryptaSize = q;
      this.crypta.buffer = impulse(this.ctx, 2 + q * 9, 2.6 - q * 0.8, 0.35, 0.85);
    }

    recStart(onChunk) {
      this.recChunk = onChunk;
      if (this.useWorklet) {
        this.recNode.port.onmessage = e => {
          if (e.data === 'done') { this.recDone && this.recDone(); }
          else onChunk(e.data);
        };
        this.recNode.port.postMessage('start');
      } else this.recOn = true;
    }
    recStop() {
      return new Promise(res => {
        if (this.useWorklet) { this.recDone = res; this.recNode.port.postMessage('stop'); }
        else { this.recOn = false; res(); }
      });
    }

    setAl(name, v) {
      if (this.useWorklet) this.T(this.alP.get(name), v, 0.05);
      else this.alState[name] = v;
    }

    bell(freq, pan, amp) {
      const c = this.ctx, now = c.currentTime;
      const partials = [1, 2.756, 5.404, 8.933, 13.34];
      const amps = [1, 0.55, 0.32, 0.16, 0.08];
      const decay = 1.5 + Math.random() * 4.5;
      const p = c.createStereoPanner(); p.pan.value = pan;
      const env = c.createGain(); env.gain.value = 0;
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.11 * amp, now + 0.004);
      env.gain.setTargetAtTime(0, now + 0.01, decay / 5);
      env.connect(p); p.connect(this.bellBus);
      const oscs = partials.map((r, i) => {
        const o = c.createOscillator(); o.frequency.value = Math.min(17000, freq * r) * (1 + (Math.random() - 0.5) * 0.004);
        const g = c.createGain(); g.gain.value = amps[i] * (i ? Math.pow(0.6, 1 + Math.random()) : 1);
        o.connect(g); g.connect(env); o.start(now); o.stop(now + decay + 0.2);
        return o;
      });
      oscs[0].onended = () => { env.disconnect(); p.disconnect(); };
      this.emit('bell', { freq, pan, amp });
    }

    strike(intensity) {
      const c = this.ctx, now = c.currentTime, g = this.storm.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0.55 * intensity, now + 0.03);
      g.setTargetAtTime(0, now + 0.08, 0.5 + Math.random() * 0.8);
      const f = this.stormFilter.frequency;
      f.cancelScheduledValues(now);
      f.setValueAtTime(3000 + Math.random() * 4000, now);
      f.exponentialRampToValueAtTime(120 + Math.random() * 200, now + 2.2);
      this.emit('strike', { intensity });
    }

    // L = valori vivi 0..1, S = sigilli, X = influenze esterne
    apply(L, S, X, dt) {
      if (!this.ready) return;
      this.t += dt;
      const t = this.t, TAU = Math.PI * 2;
      const root = ATH.rootHz(L.radix);
      const ratios = S.luna ? [1, 1.2, 1.5, 2.4, 2.1333, 0.5] : [1, 1.5, 2, 2.5, 3, 0.5];
      const animaHz = 0.01 + L.anima * L.anima * 0.6;
      const gs = Math.cos(L.sal * Math.PI / 2), gw = Math.sin(L.sal * Math.PI / 2) * 0.55;
      this.voices.forEach((v, i) => {
        const on = i < 4 || (i === 4 && S.quinta) || (i === 5 && S.crepusculum);
        const f = root * ratios[i];
        this.T(v.s.frequency, f, 0.35); this.T(v.w.frequency, f, 0.35);
        const cents = v.spread * L.mercurius * 30 + Math.sin(t * 0.13 * (i + 1) + v.ph) * L.mercurius * 18;
        this.T(v.s.detune, cents, 0.2); this.T(v.w.detune, cents + L.mercurius * 9, 0.2);
        this.T(v.gs.gain, gs, 0.1); this.T(v.gw.gain, gw, 0.1);
        const breathe = 0.6 + 0.4 * Math.sin(t * animaHz * TAU * (1 + i * 0.37) + v.ph);
        const amp = on ? (i === 5 ? 0.3 : 0.24 / Math.sqrt(i + 1)) * breathe : 0;
        this.T(v.vg.gain, amp, 0.25);
      });
      this.T(this.droneBus.gain, Math.pow(L.aurum, 1.5) * 0.95, 0.1);
      this.T(this.fmOsc.frequency, root * 1.4142, 0.3);
      this.T(this.fmGain.gain, L.sulphur * L.sulphur * root * 5, 0.1);
      this.T(this.ringOsc.frequency, root * (2.17 + L.coniunctio * 3) + X.px * 320, 0.1);
      this.T(this.ringDry.gain, 1 - L.coniunctio * 0.85, 0.1);
      this.T(this.ringWet.gain, L.coniunctio * 1.3, 0.1);

      const p = L.putrefactio, lvl = Math.pow(L.cinis, 1.6);
      this.T(this.noise.brown.g.gain, Math.max(0, 1 - p * 2) * lvl * 0.9, 0.1);
      this.T(this.noise.pink.g.gain, (1 - Math.abs(p * 2 - 1)) * lvl * 0.6, 0.1);
      this.T(this.noise.white.g.gain, Math.max(0, p * 2 - 1) * lvl * 0.22, 0.1);

      // campane
      const rate = L.saturnus * L.saturnus * 3;
      if (Math.random() < rate * dt) {
        const pick = ratios[Math.floor(Math.random() * 4)];
        const oct = Math.pow(2, 2 + Math.floor(Math.random() * 3));
        this.bell(root * pick * oct, Math.random() * 1.6 - 0.8, 0.5 + Math.random() * 0.5);
      }
      // fulmini
      if (S.fulmen && Math.random() < (0.012 + L.tempestas * L.tempestas * 0.12) * dt) this.strike(0.4 + L.tempestas * 0.6);

      this.setAl('fold', L.plica);
      this.setAl('bits', 16 - L.plumbum * 14);
      this.setAl('decim', 1 + L.contritio * L.contritio * 48);
      const libra = X.libra === undefined ? 0 : X.libra;
      const hush = X.hush || 0;
      const libQ = X.libraQ === undefined ? libra : X.libraQ;
      // incrocio morbido: a metà bilancia la fornace è già più bassa e la quiete già presente
      // il rumore è una parte del viaggio, non il fondo: sale dove serve, sparisce quando serve;
      // la quiete eterea non se ne va mai del tutto
      const fur = Math.max(Math.min(1, (1 - libra) * 1.3) * (1 - hush * 0.96) * 0.82, (X.wakeF || 0) * 0.38), qui = Math.min(1, 0.3 + libQ * 1.25);
      this.T(this.furnace.gain, fur, 0.2);
      this.T(this.quietOut.gain, qui * 0.95 * (X.breath === undefined ? 1 : X.breath), 0.25);
      this.T(this.halo.gain, 0.15 + (L.aether || 0) * 0.9, 0.2);
      this.T(this.quietEcho.gain, (L.ouroboros || 0) * 0.25, 0.2);
      this.setAl('dust', L.crepitus * L.crepitus * fur * 0.6);
      this.setAl('gate', S.mortificatio ? 0.45 + L.tempestas * 0.55 : 0);
      this.setAl('chaos', L.tempestas);

      const cut = ATH.cutoffHz(L.solutio);
      this.T(this.lp.frequency, cut, 0.08);
      this.T(this.lp.Q, 0.5 + L.draco * L.draco * 11, 0.12);
      this.T(this.bp.frequency, clamp(cut, 60, 12000), 0.08);
      this.T(this.bp.Q, 0.8 + L.draco * 8, 0.12);
      this.T(this.gLP.gain, S.solve ? 0 : 1, 0.15);
      this.T(this.gBP.gain, S.solve ? 2.6 : 0, 0.15);

      this.T(this.driveIn.gain, 1 + L.calcinatio * L.calcinatio * 40, 0.08);
      this.T(this.driveOut.gain, S.ignis ? 0.85 / (1 + L.calcinatio * 2.2) : 0, 0.1);
      this.T(this.fireDry.gain, S.ignis ? 0 : 0.85, 0.1);

      const dtime = ATH.delaySec(L.tempus);
      this.T(this.dL.delayTime, dtime, 0.6);
      this.T(this.dR.delayTime, Math.min(4.6, dtime * 1.333), 0.6);
      this.T(this.dmodOsc.frequency, S.retro ? 0.05 + animaHz * 0.5 : animaHz * 2, 0.3);
      this.T(this.dmod.gain, S.retro ? Math.min(0.06, dtime * 0.25) : 0.0015 + L.mercurius * 0.003, 0.4);
      const closed = S.vas;
      const fb = closed ? 1.0 : L.ouroboros * 0.88;
      this.T(this.loopL.fb.gain, fb, 0.15); this.T(this.loopR.fb.gain, fb, 0.15);
      const loopCut = closed ? 16000 : 2200 + (1 - L.ouroboros) * 6000 + L.sublimatio * 3000;
      this.T(this.loopL.lp.frequency, loopCut, 0.2); this.T(this.loopR.lp.frequency, loopCut, 0.2);
      this.T(this.delayIn.gain, closed ? 0 : 0.6, 0.3);
      this.T(this.delayOut.gain, 0.22 + L.ouroboros * 0.55, 0.1);

      this.T(this.cryptaSend.gain, L.crypta * 0.95, 0.15);
      this.T(this.dry.gain, 1 - L.crypta * 0.4, 0.15);
      this.T(this.subSend.gain, L.sublimatio * 0.85, 0.15);
      this.T(this.lux.gain, L.lux * L.lux * 1.15, 0.08);
    }
  }

  ATH.Engine = Engine;
})(window.ATH);
