/**
 * Motor de Metrónomo Vocal y Audio Cues
 * Especializado para grupos de alabanza y directores musicales.
 * Combina Web Audio API (clicks precisos) con Web Speech API (conteo por voz y anuncio de secciones).
 */

export type MetronomeMode = 'click' | 'voice_count' | 'voice_cues';

export class VoiceMetronomeEngine {
  private audioCtx: AudioContext | null = null;
  private isVoiceSupported: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isVoiceSupported = 'speechSynthesis' in window;
      if (this.isVoiceSupported) {
        this.loadVoice();
        window.speechSynthesis.onvoiceschanged = () => this.loadVoice();
      }
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private loadVoice() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    // Preferir voz en español clara
    const esVoice = voices.find(v => v.lang.startsWith('es') || v.lang.includes('ES')) || voices[0];
    this.selectedVoice = esVoice || null;
  }

  /**
   * Reproduce click sintético de alta precisión vía Web Audio API
   */
  public playClick(isFirstBeat: boolean = false) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      // Primer pulso más brillante (1200 Hz), pulsos secundarios (800 Hz)
      osc.frequency.setValueAtTime(isFirstBeat ? 1200 : 800, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(isFirstBeat ? 0.6 : 0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // Ignorar errores de audio background
    }
  }

  /**
   * Pronuncia el número de pulso ("Uno", "Dos", "Tres", "Cuatro")
   */
  public speakBeat(beatNumber: number) {
    if (!this.isVoiceSupported || typeof window === 'undefined') return;

    try {
      window.speechSynthesis.cancel();
      const words = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis'];
      const text = words[beatNumber] || String(beatNumber);

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.rate = 1.6; // Rápido para sincronía
      utterance.pitch = beatNumber === 1 ? 1.2 : 1.0;
      utterance.volume = 0.8;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Fallback
    }
  }

  /**
   * Anuncia sección musical (Audio Cue ministerial)
   * ej: "Coro", "Puente", "Intro", "Verso 1"
   */
  public announceSection(sectionName: string) {
    if (!this.isVoiceSupported || typeof window === 'undefined') return;

    try {
      window.speechSynthesis.cancel();
      // Limpiar corchetes
      const clean = sectionName.replace(/[\[\]]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.rate = 1.3;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Fallback
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

let voiceMetronomeInstance: VoiceMetronomeEngine | null = null;
export function getVoiceMetronome(): VoiceMetronomeEngine {
  if (!voiceMetronomeInstance) {
    voiceMetronomeInstance = new VoiceMetronomeEngine();
  }
  return voiceMetronomeInstance;
}
