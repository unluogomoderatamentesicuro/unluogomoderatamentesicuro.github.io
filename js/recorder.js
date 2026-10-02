/* ATHANOR — il registratore della sessione e il salvataggio dei file.
   Registra in WAV 16 bit stereo (senza perdita) e, dove il browser lo permette,
   anche in WebM/Opus compresso.
   un luogo moderatamente sicuro */
window.ATH = window.ATH || {};

(function (ATH) {
  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return null;
    const list = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4'];
    return list.find(m => MediaRecorder.isTypeSupported(m)) || null;
  }

  function wavBlob(chunks, sr) {
    let samples = 0;
    chunks.forEach(c => samples += c.length);
    const dataBytes = samples * 2;
    const h = new DataView(new ArrayBuffer(44));
    const str = (o, s) => { for (let i = 0; i < s.length; i++) h.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); h.setUint32(4, 36 + dataBytes, true); str(8, 'WAVE');
    str(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 2, true);
    h.setUint32(24, sr, true); h.setUint32(28, sr * 4, true); h.setUint16(32, 4, true); h.setUint16(34, 16, true);
    str(36, 'data'); h.setUint32(40, dataBytes, true);
    return new Blob([h.buffer, ...chunks], { type: 'audio/wav' });
  }

  class Recorder {
    constructor(engine) {
      this.e = engine; this.recording = false; this.chunks = []; this.mrChunks = [];
      this.wav = null; this.compressed = null; this.mime = null; this.t0 = 0; this.frames = 0;
    }
    get elapsed() { return this.recording ? (performance.now() - this.t0) / 1000 : this.last || 0; }
    start() {
      this.chunks = []; this.mrChunks = []; this.wav = null; this.compressed = null; this.frames = 0;
      this.e.recStart(c => { this.chunks.push(c); this.frames += c.length / 2; });
      const mime = pickMime();
      this.mr = null;
      if (mime && this.e.mediaDest) {
        try {
          this.mr = new MediaRecorder(this.e.mediaDest.stream, { mimeType: mime, audioBitsPerSecond: 256000 });
          this.mime = mime;
          this.mr.ondataavailable = ev => { if (ev.data && ev.data.size) this.mrChunks.push(ev.data); };
          this.mr.start(1000);
        } catch (err) { this.mr = null; }
      }
      this.recording = true; this.t0 = performance.now();
    }
    async stop() {
      this.last = this.elapsed;
      this.recording = false;
      await this.e.recStop();
      this.wav = wavBlob(this.chunks, this.e.ctx.sampleRate);
      this.chunks = [];
      if (this.mr && this.mr.state !== 'inactive') {
        await new Promise(r => { this.mr.onstop = r; this.mr.stop(); });
        this.compressed = new Blob(this.mrChunks, { type: this.mime });
      }
      this.mrChunks = [];
    }
    get compressedExt() {
      if (!this.mime) return null;
      if (this.mime.indexOf('webm') >= 0) return 'webm';
      return ATH.hosted ? 'mp4' : 'm4a';
    }
  }
  ATH.Recorder = Recorder;

  // —— salvataggio file: sul tuo sito con un normale download; dentro claude.ai
  //    attraverso la capacità "downloads" della pagina.
  ATH.hosted = false;
  ATH.downloads = null;
  ATH.hostReady = (async () => {
    try {
      if (window.claude && typeof window.claude.use === 'function') {
        ATH.hosted = true;
        ATH.downloads = await window.claude.use('downloads');
      }
    } catch (e) { ATH.downloads = null; }
  })();

  ATH.canSave = ext => {
    if (!ATH.hosted) return true;
    if (!ATH.downloads) return false;
    return ['webm', 'mp4', 'json'].indexOf(ext) >= 0;
  };

  ATH.saveFile = async (filename, blob) => {
    if (ATH.hosted) {
      if (!ATH.downloads) return { ok: false, msg: 'Il salvataggio non è disponibile in questa vista.' };
      try {
        await ATH.downloads.save({ filename, data: blob });
        return { ok: true, msg: 'Salvato: ' + filename };
      } catch (e) {
        const code = e && e.code;
        if (code === 'declined') return { ok: false, msg: 'Salvataggio annullato.' };
        if (code === 'rate_limited') return { ok: false, msg: 'C’è già una richiesta aperta. Riprova tra poco.' };
        if (code === 'rejected_extension' || code === 'extension_not_enabled') return { ok: false, msg: 'Questo formato non si può salvare qui.' };
        if (code === 'too_large') return { ok: false, msg: 'Il file è troppo grande per questa vista.' };
        return { ok: false, msg: 'Il salvataggio non è riuscito.' };
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
    return { ok: true, msg: 'Salvato: ' + filename };
  };

  ATH.stamp = () => {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  };
})(window.ATH);
