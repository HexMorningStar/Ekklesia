/**
 * Motor Multi-Pistas (Multitrack Player / Stems Mixer)
 * Maneja 5 canales independientes (Pads, Clic, Guía de Voz, Batería, Bajo)
 * y Ruteo Estéreo Dividido (In-Ear Split: Click/Voz a Izquierda, Instrumentos a Derecha).
 */

export interface MultitrackChannel {
  id: string;
  name: string;
  iconName: string;
  volume: number; // 0 a 100
  isMuted: boolean;
  isSolo: boolean;
  pan: number; // -1 (izq) a +1 (der)
}

export type RoutingMode = 'normal_stereo' | 'in_ear_split';

export class MultitrackEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private bpm: number = 72;
  private key: string = 'G';
  private timeSignature: string = '4/4';
  private routingMode: RoutingMode = 'normal_stereo';

  // Faders de canales
  public channels: Record<string, MultitrackChannel> = {
    pads: { id: 'pads', name: 'Pads / Ambient', iconName: 'Compass', volume: 80, isMuted: false, isSolo: false, pan: 0 },
    click: { id: 'click', name: 'Metrónomo / Clic', iconName: 'Clock', volume: 90, isMuted: false, isSolo: false, pan: 0 },
    guide: { id: 'guide', name: 'Voz Guía / Cues', iconName: 'Mic2', volume: 85, isMuted: false, isSolo: false, pan: 0 },
    drums: { id: 'drums', name: 'Batería / Percusión', iconName: 'Music', volume: 70, isMuted: false, isSolo: false, pan: 0 },
    bass: { id: 'bass', name: 'Bajo / Sub-Bass', iconName: 'Sliders', volume: 75, isMuted: false, isSolo: false, pan: 0 }
  };

  private masterVolume: number = 90;
  private currentBar: number = 1;
  private currentBeat: number = 1;
  private timerInterval: any = null;
  private onBeatUpdate: ((bar: number, beat: number) => void) | null = null;

  // Nodos de Audio
  private masterGain: GainNode | null = null;
  private channelGains: Record<string, GainNode> = {};
  private channelPanners: Record<string, StereoPannerNode> = {};
  private padOscillators: OscillatorNode[] = [];

  constructor() {}

  private initAudio() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume / 100, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Crear Gain y Panner para cada canal
    Object.keys(this.channels).forEach(chKey => {
      if (!this.ctx || !this.masterGain) return;
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      gain.gain.setValueAtTime(this.calculateEffectiveGain(chKey), this.ctx.currentTime);

      if (panner) {
        panner.pan.setValueAtTime(this.calculateEffectivePan(chKey), this.ctx.currentTime);
        gain.connect(panner);
        panner.connect(this.masterGain);
        this.channelPanners[chKey] = panner;
      } else {
        gain.connect(this.masterGain);
      }

      this.channelGains[chKey] = gain;
    });
  }

  private calculateEffectiveGain(chKey: string): number {
    const ch = this.channels[chKey];
    if (!ch) return 0;
    if (ch.isMuted) return 0;

    // Si algún canal está en solo, verificar si este canal lo está
    const anySolo = Object.values(this.channels).some(c => c.isSolo);
    if (anySolo && !ch.isSolo) return 0;

    return ch.volume / 100;
  }

  private calculateEffectivePan(chKey: string): number {
    if (this.routingMode === 'in_ear_split') {
      // In-Ear Split: Click y Voz a la izquierda (-1), Música a la derecha (+1)
      if (chKey === 'click' || chKey === 'guide') {
        return -1.0;
      } else {
        return 1.0;
      }
    }
    return this.channels[chKey]?.pan || 0;
  }

  public updateChannel(chId: string, updates: Partial<MultitrackChannel>) {
    if (this.channels[chId]) {
      this.channels[chId] = { ...this.channels[chId], ...updates };
      
      // Aplicar al nodo de audio si está activo
      if (this.ctx && this.channelGains[chId]) {
        this.channelGains[chId].gain.setValueAtTime(
          this.calculateEffectiveGain(chId), 
          this.ctx.currentTime
        );
      }
      if (this.ctx && this.channelPanners[chId]) {
        this.channelPanners[chId].pan.setValueAtTime(
          this.calculateEffectivePan(chId), 
          this.ctx.currentTime
        );
      }
    }
  }

  public setRoutingMode(mode: RoutingMode) {
    this.routingMode = mode;
    if (this.ctx) {
      Object.keys(this.channels).forEach(chKey => {
        if (this.channelPanners[chKey]) {
          this.channelPanners[chKey].pan.setValueAtTime(
            this.calculateEffectivePan(chKey), 
            this.ctx!.currentTime
          );
        }
      });
    }
  }

  public getRoutingMode(): RoutingMode {
    return this.routingMode;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = vol;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(vol / 100, this.ctx.currentTime);
    }
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(40, Math.min(220, newBpm));
  }

  public setKey(newKey: string) {
    this.key = newKey;
    if (this.isPlaying) {
      this.restartPads();
    }
  }

  public start(onBeat?: (bar: number, beat: number) => void) {
    if (this.isPlaying) return;
    this.initAudio();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.currentBar = 1;
    this.currentBeat = 1;
    this.onBeatUpdate = onBeat || null;

    // 1. Iniciar Pads
    this.startPads();

    // 2. Loop de Metrónomo, Batería y Guía
    const beatDurationMs = (60 / this.bpm) * 1000;

    this.timerInterval = setInterval(() => {
      this.triggerBeat(this.currentBeat, this.currentBar);

      this.onBeatUpdate?.(this.currentBar, this.currentBeat);

      this.currentBeat++;
      if (this.currentBeat > 4) {
        this.currentBeat = 1;
        this.currentBar++;
      }
    }, beatDurationMs);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.stopPads();
    this.currentBar = 1;
    this.currentBeat = 1;
    this.onBeatUpdate?.(1, 1);
  }

  private triggerBeat(beat: number, bar: number) {
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    const isDownbeat = beat === 1;

    // Canal Clic
    const clickGain = this.channelGains['click'];
    if (clickGain && !this.channels.click.isMuted) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isDownbeat ? 1600 : 900, time);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.connect(gain);
      gain.connect(clickGain);

      osc.start(time);
      osc.stop(time + 0.05);
    }

    // Canal Batería (Kick en 1 y 3, Snare en 2 y 4, Hi-hat en cada beat)
    const drumsGain = this.channelGains['drums'];
    if (drumsGain && !this.channels.drums.isMuted) {
      // Hi-hat
      this.playHiHat(time, drumsGain);

      // Kick en tiempo 1 y 3
      if (beat === 1 || beat === 3) {
        this.playKick(time, drumsGain);
      }
      // Snare en tiempo 2 y 4
      if (beat === 2 || beat === 4) {
        this.playSnare(time, drumsGain);
      }
    }

    // Canal Bajo (toca en beat 1 y 3)
    const bassGain = this.channelGains['bass'];
    if (bassGain && !this.channels.bass.isMuted && (beat === 1 || beat === 3)) {
      this.playBassNote(time, bassGain);
    }

    // Canal Guía de voz (conteo antes de compás 1 o 5)
    if (bar === 1 && this.channels.guide && !this.channels.guide.isMuted) {
      this.speakCue(beat.toString());
    }
  }

  private playHiHat(time: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(7000, time);
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    osc.connect(gain);
    gain.connect(target);
    osc.start(time);
    osc.stop(time + 0.035);
  }

  private playKick(time: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain);
    gain.connect(target);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  private playSnare(time: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, time);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    osc.connect(gain);
    gain.connect(target);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playBassNote(time: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, time); // A1 aprox
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    osc.connect(gain);
    gain.connect(target);
    osc.start(time);
    osc.stop(time + 0.45);
  }

  private speakCue(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.3;
      u.pitch = 1.0;
      u.lang = 'es-ES';
      window.speechSynthesis.speak(u);
    }
  }

  private startPads() {
    if (!this.ctx) return;
    const padGain = this.channelGains['pads'];
    if (!padGain) return;

    this.stopPads();

    const freqs = [196.0, 293.66, 392.0]; // G3, D4, G4
    freqs.forEach(f => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime);
      osc.connect(gain);
      gain.connect(padGain);
      osc.start();
      this.padOscillators.push(osc);
    });
  }

  private restartPads() {
    this.stopPads();
    this.startPads();
  }

  private stopPads() {
    this.padOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.padOscillators = [];
  }
}
