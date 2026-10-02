/* ATHANOR — il cuore DSP: l'Alambicco (piega, frantuma, crepita, mortifica)
   e il Registratore. Il codice gira in un AudioWorklet; se il browser non lo
   permette, la stessa classe gira in uno ScriptProcessor.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  class AlembicCore {
    constructor(sr) {
      this.sr = sr;
      this.hold = [0, 0];
      this.cnt = 0;
      this.dEnv = [0, 0];
      this.x = 0.37;
      this.gateCnt = 0;
      this.gateTarget = 1;
      this.gateVal = 1;
    }
    static fold(x) {
      const t = 0.25 * x + 0.25;
      return 4 * Math.abs(t - Math.floor(t + 0.5)) - 1;
    }
    // p = { fold, bits, decim, dust, gate, chaos }
    process(inL, inR, outL, outR, n, p) {
      const decim = Math.max(1, Math.floor(p.decim));
      const q = Math.pow(2, Math.max(1, p.bits) - 1);
      const crush = p.bits < 15.9;
      const fg = 1 + p.fold * 9;
      const fmix = Math.min(1, p.fold * 4);
      const dustP = p.dust * p.dust * 0.005;
      const gate = p.gate, chaos = p.chaos, sr = this.sr;
      const ins = [inL, inR], outs = [outL, outR];
      for (let i = 0; i < n; i++) {
        if (--this.gateCnt <= 0) {
          const r = 3.6 + chaos * 0.399;
          this.x = r * this.x * (1 - this.x);
          if (!(this.x > 0.0001 && this.x < 0.9999)) this.x = Math.random() * 0.8 + 0.1;
          this.gateTarget = this.x > 0.5 ? 1 : 1 - gate;
          this.gateCnt = Math.floor(sr * (0.035 + (1 - chaos) * 0.14));
        }
        this.gateVal += (this.gateTarget - this.gateVal) * 0.006;
        const takeHold = this.cnt === 0;
        for (let c = 0; c < 2; c++) {
          const src = ins[c] || ins[0];
          let y = src ? src[i] : 0;
          if (fmix > 0) y = y * (1 - fmix) + AlembicCore.fold(y * fg) * fmix * 0.8;
          if (decim > 1) {
            if (takeHold) this.hold[c] = y;
            y = this.hold[c];
          }
          if (crush) y = Math.round(y * q) / q;
          if (Math.random() < dustP) this.dEnv[c] = (0.25 + Math.random() * 0.75) * (Math.random() < 0.5 ? -1 : 1);
          const d = this.dEnv[c] * (0.6 + Math.random() * 0.4);
          this.dEnv[c] *= 0.82;
          outs[c][i] = y * this.gateVal + d * 0.7;
        }
        this.cnt = (this.cnt + 1) % decim;
      }
    }
  }
  ATH.AlembicCore = AlembicCore;

  ATH.WORKLET_SRC = AlembicCore.toString() + `
class AlembicProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'fold', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'bits', defaultValue: 16, minValue: 1, maxValue: 16, automationRate: 'k-rate' },
      { name: 'decim', defaultValue: 1, minValue: 1, maxValue: 64, automationRate: 'k-rate' },
      { name: 'dust', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'gate', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'chaos', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' }
    ];
  }
  constructor() { super(); this.core = new AlembicCore(sampleRate); this.p = {}; }
  process(inputs, outputs, params) {
    const inp = inputs[0] || [], out = outputs[0];
    const p = this.p;
    p.fold = params.fold[0]; p.bits = params.bits[0]; p.decim = params.decim[0];
    p.dust = params.dust[0]; p.gate = params.gate[0]; p.chaos = params.chaos[0];
    this.core.process(inp[0], inp[1] || inp[0], out[0], out[1] || out[0], out[0].length, p);
    return true;
  }
}
registerProcessor('athanor-alembic', AlembicProcessor);

class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.on = false; this.size = 8192; this.buf = new Int16Array(this.size * 2); this.p = 0;
    this.port.onmessage = (e) => {
      if (e.data === 'start') { this.on = true; this.p = 0; this.buf = new Int16Array(this.size * 2); }
      else if (e.data === 'stop') {
        if (this.p > 0) this.port.postMessage(this.buf.slice(0, this.p * 2));
        this.on = false; this.p = 0; this.port.postMessage('done');
      }
    };
  }
  process(inputs) {
    const inp = inputs[0];
    if (this.on && inp && inp.length) {
      const L = inp[0], R = inp[1] || inp[0];
      for (let i = 0; i < L.length; i++) {
        let l = L[i], r = R[i];
        l = l > 1 ? 1 : l < -1 ? -1 : l; r = r > 1 ? 1 : r < -1 ? -1 : r;
        this.buf[this.p * 2] = l < 0 ? l * 32768 : l * 32767;
        this.buf[this.p * 2 + 1] = r < 0 ? r * 32768 : r * 32767;
        if (++this.p >= this.size) {
          this.port.postMessage(this.buf, [this.buf.buffer]);
          this.buf = new Int16Array(this.size * 2); this.p = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('athanor-recorder', RecorderProcessor);
`;
})(window.ATH);
