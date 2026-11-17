'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldCheck, 
  Guitar,
  Music
} from 'lucide-react';
import { NOTE_TO_SOLFA } from '@/lib/chord-engine';

interface InstrumentTunerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface TunerPreset {
  name: string;
  strings: { note: string; freq: number; label: string }[];
}

const PRESETS: Record<string, TunerPreset> = {
  chromatic: {
    name: 'Cromático Libre',
    strings: []
  },
  guitar: {
    name: 'Guitarra Estándar (E A D G B E)',
    strings: [
      { note: 'E2', freq: 82.41, label: '6ª Cuerda (Mi grave)' },
      { note: 'A2', freq: 110.00, label: '5ª Cuerda (La)' },
      { note: 'D3', freq: 146.83, label: '4ª Cuerda (Re)' },
      { note: 'G3', freq: 196.00, label: '3ª Cuerda (Sol)' },
      { note: 'B3', freq: 246.94, label: '2ª Cuerda (Si)' },
      { note: 'E4', freq: 329.63, label: '1ª Cuerda (Mi aguda)' }
    ]
  },
  bass: {
    name: 'Bajo Eléctrico (E A D G)',
    strings: [
      { note: 'E1', freq: 41.20, label: '4ª Cuerda (Mi)' },
      { note: 'A1', freq: 55.00, label: '3ª Cuerda (La)' },
      { note: 'D2', freq: 73.42, label: '2ª Cuerda (Re)' },
      { note: 'G2', freq: 98.00, label: '1ª Cuerda (Sol)' }
    ]
  },
  ukulele: {
    name: 'Ukelele (G C E A)',
    strings: [
      { note: 'G4', freq: 392.00, label: '4ª Cuerda (Sol)' },
      { note: 'C4', freq: 261.63, label: '3ª Cuerda (Do)' },
      { note: 'E4', freq: 329.63, label: '2ª Cuerda (Mi)' },
      { note: 'A4', freq: 440.00, label: '1ª Cuerda (La)' }
    ]
  }
};

export default function InstrumentTunerModal({
  isOpen,
  onClose
}: InstrumentTunerModalProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [presetKey, setPresetKey] = useState<string>('guitar');
  const [detectedNote, setDetectedNote] = useState<string>('--');
  const [detectedSolfa, setDetectedSolfa] = useState<string>('--');
  const [octave, setOctave] = useState<number | null>(null);
  const [cents, setCents] = useState<number>(0);
  const [frequency, setFrequency] = useState<number>(0);
  const [clarity, setClarity] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlayingReference, setIsPlayingReference] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const referenceOscRef = useRef<OscillatorNode | null>(null);

  // Algoritmo de detección de tono por autocorrelación
  const autoCorrelate = (buf: Float32Array, sampleRate: number): { freq: number; clarity: number } => {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.015) {
      return { freq: -1, clarity: 0 }; // Señal demasiado débil o silencio
    }

    // Recortar buffer a rangos musicales (40Hz a 1000Hz)
    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmed = buf.slice(r1, r2);
    const c = new Array(trimmed.length).fill(0);
    for (let i = 0; i < trimmed.length; i++) {
      for (let j = 0; j < trimmed.length - i; j++) {
        c[i] = c[i] + trimmed[j] * trimmed[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    // Interpolación parabólica para afinación exacta de cents
    if (maxpos > 0 && maxpos < trimmed.length - 1) {
      const x1 = c[maxpos - 1];
      const x2 = c[maxpos];
      const x3 = c[maxpos + 1];
      const a = (x1 + x3 - 2 * x2) / 2;
      const b = (x3 - x1) / 2;
      if (a) T0 = maxpos - b / (2 * a);
    }

    return {
      freq: sampleRate / T0,
      clarity: maxval / c[0]
    };
  };

  const startListening = async () => {
    try {
      setAudioError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false, 
          autoGainControl: false, 
          noiseSuppression: false 
        } 
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);
      const buffer = new Float32Array(analyser.fftSize);

      const updatePitch = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);
        const { freq, clarity: clr } = autoCorrelate(buffer, audioCtx.sampleRate);

        if (freq > 30 && freq < 2000 && clr > 0.6) {
          setFrequency(Math.round(freq * 10) / 10);
          setClarity(clr);

          // Convertir Hz a nota MIDI
          const midiNum = 12 * (Math.log2(freq / 440)) + 69;
          const roundedMidi = Math.round(midiNum);
          const noteIdx = (roundedMidi % 12 + 12) % 12;
          const noteName = NOTE_NAMES[noteIdx];
          const oct = Math.floor(roundedMidi / 12) - 1;
          const exactFreq = 440 * Math.pow(2, (roundedMidi - 69) / 12);
          const centDiff = Math.floor(1200 * Math.log2(freq / exactFreq));

          setDetectedNote(noteName);
          setDetectedSolfa(NOTE_TO_SOLFA[noteName] || noteName);
          setOctave(oct);
          setCents(Math.max(-50, Math.min(50, centDiff)));
        }

        animationFrameRef.current = requestAnimationFrame(updatePitch);
      };

      updatePitch();
    } catch (err: any) {
      setAudioError(err.message || 'No se pudo acceder al micrófono para afinar');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsListening(false);
  };

  const toggleReferenceTone = (freq = 440) => {
    if (isPlayingReference) {
      if (referenceOscRef.current) {
        referenceOscRef.current.stop();
        referenceOscRef.current = null;
      }
      setIsPlayingReference(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0.25;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        referenceOscRef.current = osc;
        setIsPlayingReference(true);
      } catch (e) {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      if (isPlayingReference && referenceOscRef.current) {
        referenceOscRef.current.stop();
        referenceOscRef.current = null;
        setIsPlayingReference(false);
      }
    }
    return () => {
      stopListening();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPreset = PRESETS[presetKey] || PRESETS.guitar;
  const isPerfect = Math.abs(cents) <= 3 && detectedNote !== '--';
  const isNear = Math.abs(cents) <= 10 && !isPerfect;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
        
        {/* Cabecera */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Guitar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Afinador Cromático Ministerial</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Afinación precisa por micrófono para el escenario
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Contenido */}
        <div className="p-5 space-y-5 text-center">
          
          {audioError ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
              <p className="font-bold mb-1">Permiso de Micrófono Requerido</p>
              <p>{audioError}</p>
              <button
                onClick={startListening}
                className="mt-3 px-4 py-1.5 rounded-lg bg-red-500 text-white font-bold text-xs"
              >
                Permitir Micrófono
              </button>
            </div>
          ) : (
            <>
              {/* Selector de Instrumento Preset */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 text-xs">
                {Object.entries(PRESETS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPresetKey(key)}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition text-[11px] ${
                      presetKey === key
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {key === 'chromatic' ? 'Cromático' : key === 'guitar' ? 'Guitarra' : key === 'bass' ? 'Bajo' : 'Ukelele'}
                  </button>
                ))}
              </div>

              {/* Dial y Medidor de Cents */}
              <div className="relative py-4 flex flex-col items-center">
                {/* Arco Visual / Medidor */}
                <div className="relative w-full max-w-[280px] h-20 flex items-end justify-center overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  
                  {/* Marcas de Cents: -50, -25, 0, +25, +50 */}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] text-slate-400 font-mono">
                    <span>-50♭</span>
                    <span>-25</span>
                    <span className="font-bold text-emerald-500">▼ 0</span>
                    <span>+25</span>
                    <span>+50♯</span>
                  </div>

                  {/* Aguja de afinación */}
                  <div
                    className="absolute bottom-0 w-1.5 h-16 origin-bottom rounded-full transition-transform duration-100 shadow-md"
                    style={{
                      transform: `rotate(${cents * 1.5}deg)`,
                      backgroundColor: isPerfect ? '#10b981' : isNear ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>

                {/* Gran Indicador de Nota */}
                <div className="mt-4 flex flex-col items-center justify-center">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-6xl font-black font-mono tracking-tight transition-colors ${
                        isPerfect
                          ? 'text-emerald-500 scale-105'
                          : isNear
                          ? 'text-amber-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {detectedNote}
                    </span>
                    {octave !== null && (
                      <span className="text-xl font-bold text-slate-400 font-mono">
                        {octave}
                      </span>
                    )}
                  </div>

                  {/* Nombre en Solfa y Frecuencia */}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold text-xs">
                      {detectedSolfa}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {frequency > 0 ? `${frequency} Hz` : 'Esperando sonido...'}
                    </span>
                  </div>

                  {/* Estado en Texto */}
                  <div className="mt-2.5">
                    {detectedNote === '--' ? (
                      <span className="text-xs text-slate-400 animate-pulse">
                        Toca una cuerda en tu instrumento...
                      </span>
                    ) : isPerfect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                        ✓ ¡Afinada a la perfección! (0 cents)
                      </span>
                    ) : cents < 0 ? (
                      <span className="text-xs font-bold text-amber-500">
                        Baja ({cents} cents) • Aprieta la clavija
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-500">
                        Alta (+{cents} cents) • Afloja la clavija
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de cuerdas guía según preset */}
              {currentPreset.strings.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500 mb-2">Cuerdas de referencia ({currentPreset.name}):</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {currentPreset.strings.map((str, sIdx) => {
                      const isActive = detectedNote === str.note.replace(/[0-9]/g, '');
                      return (
                        <button
                          key={sIdx}
                          onClick={() => toggleReferenceTone(str.freq)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                          }`}
                          title={`Tono de referencia: ${str.label} (${str.freq} Hz)`}
                        >
                          <span>{str.note}</span>
                          <span className="text-[9px] font-normal opacity-70">({str.freq}Hz)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-3 text-xs">
          <button
            onClick={() => toggleReferenceTone(440)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isPlayingReference
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isPlayingReference ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isPlayingReference ? 'Detener Tono La-440' : 'Oír Tono La-440 Hz'}</span>
          </button>

          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="px-5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition"
          >
            Listo
          </button>
        </footer>

      </div>
    </div>
  );
}
