/**
 * Sintetizador Web Audio API de Ambient Worship Pads
 * Genera pads atmosféricos cálidos y continuos en cualquier tonalidad
 * para transiciones de oración, ministración y atril de ensayo.
 */

// Frecuencias fundamentales de la octava central para cada nota
const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 130.81,  // C3
  'C#': 138.59,
  'Db': 138.59,
  'D': 146.83,  // D3
  'D#': 155.56,
  'Eb': 155.56,
  'E': 164.81,  // E3
  'F': 174.61,  // F3
  'F#': 185.00,
  'Gb': 185.00,
  'G': 196.00,  // G3
  'G#': 207.65,
  'Ab': 207.65,
  'A': 220.00,  // A3
  'A#': 233.08,
  'Bb': 233.08,
  'B': 246.94   // B3
};

class AmbientPadEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private currentKey: string | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Lowpass Filter cálido y suave
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(420, this.ctx.currentTime); // Hz
      this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(key: string) {
    this.initContext();
    if (!this.ctx || !this.filter || !this.masterGain) return;

    const cleanKey = key.replace(/m$/, '').trim(); // Si es menor, usamos la tónica
    const baseFreq = NOTE_FREQUENCIES[cleanKey] || 196.00;

    // Si ya está sonando en esta misma clave, no hacemos nada
    if (this.isPlaying && this.currentKey === cleanKey) return;

    // Fade out de osciladores previos si estaban sonando
    this.stopCurrentOscillators(0.8);

    this.currentKey = cleanKey;
    this.isPlaying = true;

    const now = this.ctx.currentTime;
    const voiceGains: GainNode[] = [];

    // Creamos un acorde celestial: Fundamental (1), Quinta (5ta justa) y Octava (8va)
    const intervals = [
      { ratio: 1.0, detune: -4, type: 'sawtooth' as OscillatorType, gain: 0.18 },
      { ratio: 1.0, detune: 4, type: 'triangle' as OscillatorType, gain: 0.25 },
      { ratio: 1.4983, detune: 2, type: 'sine' as OscillatorType, gain: 0.22 }, // 5ta justa
      { ratio: 2.0, detune: -3, type: 'triangle' as OscillatorType, gain: 0.15 }, // 8va
      { ratio: 0.5, detune: 0, type: 'sine' as OscillatorType, gain: 0.28 } // Sub-bajo cálido
    ];

    intervals.forEach(inv => {
      if (!this.ctx || !this.filter) return;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = inv.type;
      osc.frequency.setValueAtTime(baseFreq * inv.ratio, now);
      osc.detune.setValueAtTime(inv.detune, now);

      // Entrada suave (Attack envelope de 1.5 segundos)
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(inv.gain, now + 1.5);

      osc.connect(gainNode);
      gainNode.connect(this.filter);

      osc.start(now);
      this.activeOscillators.push(osc);
      voiceGains.push(gainNode);
    });
  }

  private stopCurrentOscillators(fadeTime = 1.0) {
    if (!this.ctx || this.activeOscillators.length === 0) return;
    const now = this.ctx.currentTime;

    const oscsToStop = [...this.activeOscillators];
    this.activeOscillators = [];

    oscsToStop.forEach(osc => {
      try {
        osc.stop(now + fadeTime);
      } catch (e) {
        // Ya detenido
      }
    });
  }

  public stop() {
    this.stopCurrentOscillators(1.2);
    this.isPlaying = false;
    this.currentKey = null;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentKey: this.currentKey,
      volume: this.volume
    };
  }
}

// Instancia singleton para navegador
let padEngineInstance: AmbientPadEngine | null = null;

export function getAmbientPadEngine(): AmbientPadEngine {
  if (typeof window === 'undefined') {
    return new AmbientPadEngine();
  }
  if (!padEngineInstance) {
    padEngineInstance = new AmbientPadEngine();
  }
  return padEngineInstance;
}
