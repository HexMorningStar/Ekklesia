'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Music, 
  ArrowRight, 
  Play, 
  Pause, 
  Volume2, 
  Clock, 
  Compass, 
  CheckCircle2, 
  Guitar, 
  Piano, 
  Mic2,
  Sliders,
  Repeat
} from 'lucide-react';
import { calculateTransition, TransitionResult } from '@/lib/song-transition-engine';
import { CHROMATIC_SHARPS } from '@/lib/chord-engine';

interface SongTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs?: any[];
  initialSourceSong?: any;
  initialTargetSong?: any;
}

export default function SongTransitionModal({
  isOpen,
  onClose,
  songs = [],
  initialSourceSong,
  initialTargetSong
}: SongTransitionModalProps) {
  const [sourceKey, setSourceKey] = useState<string>(initialSourceSong?.chosen_key || initialSourceSong?.original_key || 'G');
  const [targetKey, setTargetKey] = useState<string>(initialTargetSong?.chosen_key || initialTargetSong?.original_key || 'D');
  const [sourceTempo, setSourceTempo] = useState<number>(initialSourceSong?.tempo || 72);
  const [targetTempo, setTargetTempo] = useState<number>(initialTargetSong?.tempo || 125);
  
  const [selectedSourceSongId, setSelectedSourceSongId] = useState<number | string>(initialSourceSong?.id || '');
  const [selectedTargetSongId, setSelectedTargetSongId] = useState<number | string>(initialTargetSong?.id || '');

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  // Actualizar cuando cambian las canciones iniciales
  useEffect(() => {
    if (initialSourceSong) {
      setSourceKey(initialSourceSong.chosen_key || initialSourceSong.original_key || 'G');
      setSourceTempo(initialSourceSong.tempo || 72);
      setSelectedSourceSongId(initialSourceSong.id);
    }
    if (initialTargetSong) {
      setTargetKey(initialTargetSong.chosen_key || initialTargetSong.original_key || 'D');
      setTargetTempo(initialTargetSong.tempo || 125);
      setSelectedTargetSongId(initialTargetSong.id);
    }
  }, [initialSourceSong, initialTargetSong, isOpen]);

  // Manejo de selección por dropdown de canción
  const handleSelectSourceSong = (songId: string) => {
    setSelectedSourceSongId(songId);
    const found = songs.find(s => s.id.toString() === songId.toString());
    if (found) {
      setSourceKey(found.chosen_key || found.original_key || 'G');
      setSourceTempo(found.tempo || 72);
    }
  };

  const handleSelectTargetSong = (songId: string) => {
    setSelectedTargetSongId(songId);
    const found = songs.find(s => s.id.toString() === songId.toString());
    if (found) {
      setTargetKey(found.chosen_key || found.original_key || 'D');
      setTargetTempo(found.tempo || 125);
    }
  };

  // Cálculo de la transición
  const transition: TransitionResult = useMemo(() => {
    return calculateTransition(sourceKey, targetKey, sourceTempo, targetTempo);
  }, [sourceKey, targetKey, sourceTempo, targetTempo]);

  // Reproductor sintetizado de la progresión de acordes con Web Audio API
  const playTransitionProgression = () => {
    if (typeof window === 'undefined') return;
    if (isPlayingAudio) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      setIsPlayingAudio(true);

      const noteFreqs: Record<string, number> = {
        'C': 130.81, 'C#': 138.59, 'Db': 138.59,
        'D': 146.83, 'D#': 155.56, 'Eb': 155.56,
        'E': 164.81,
        'F': 174.61, 'F#': 185.00, 'Gb': 185.00,
        'G': 196.00, 'G#': 207.65, 'Ab': 207.65,
        'A': 220.00, 'A#': 233.08, 'Bb': 233.08,
        'B': 246.94
      };

      const stepDuration = 1.2; // segundos por acorde

      transition.steps.forEach((step, idx) => {
        const startTime = ctx.currentTime + idx * stepDuration;
        
        // Timer visual
        setTimeout(() => {
          setActiveStepIndex(idx);
        }, idx * stepDuration * 1000);

        // Sintetizar tríada armónica
        const rootMatch = step.chord.match(/^[A-G][#b]?/);
        const root = rootMatch ? rootMatch[0] : 'C';
        const baseFreq = noteFreqs[root] || 196.0;

        // Frecuencias de la tríada (raíz, tercera, quinta, séptima)
        const freqs = [
          baseFreq, 
          baseFreq * (step.chord.includes('m') ? 1.189 : 1.259), // 3ra menor / mayor
          baseFreq * 1.498 // 5ta justa
        ];

        if (step.chord.includes('7')) {
          freqs.push(baseFreq * 1.781); // 7ma menor
        }

        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, startTime);

          // Envolvente ADSR suave
          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.12, startTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + stepDuration - 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + stepDuration);
        });
      });

      // Finalizar reproducción
      const totalTime = transition.steps.length * stepDuration;
      setTimeout(() => {
        setIsPlayingAudio(false);
        setActiveStepIndex(-1);
        ctx.close();
      }, totalTime * 1000);

    } catch (e) {
      console.error('Error al reproducir progresión:', e);
      setIsPlayingAudio(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20">
              <Sparkles className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Generador de Transiciones y Modulaciones
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conexión armónica fluida entre canciones sin romper la atmósfera de adoración
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Selectores de Canción / Tono Origen y Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Canción 1 (Origen) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-amber-500" />
                Canción 1 (Origen)
              </label>
              {songs.length > 0 && (
                <select
                  value={selectedSourceSongId}
                  onChange={(e) => handleSelectSourceSong(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="">Seleccionar canción...</option>
                  {songs.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.chosen_key || s.original_key || 'G'} - {s.tempo || 72} BPM)
                    </option>
                  ))}
                </select>
              )}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <span className="text-[11px] text-slate-400 block mb-1">Tono:</span>
                  <select
                    value={sourceKey}
                    onChange={(e) => setSourceKey(e.target.value)}
                    className="w-full font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-amber-600 dark:text-amber-400"
                  >
                    {CHROMATIC_SHARPS.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <span className="text-[11px] text-slate-400 block mb-1">Tempo:</span>
                  <input
                    type="number"
                    value={sourceTempo}
                    onChange={(e) => setSourceTempo(parseInt(e.target.value) || 72)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Canción 2 (Destino) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
                Canción 2 (Destino)
              </label>
              {songs.length > 0 && (
                <select
                  value={selectedTargetSongId}
                  onChange={(e) => handleSelectTargetSong(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="">Seleccionar canción...</option>
                  {songs.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.chosen_key || s.original_key || 'D'} - {s.tempo || 125} BPM)
                    </option>
                  ))}
                </select>
              )}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <span className="text-[11px] text-slate-400 block mb-1">Tono:</span>
                  <select
                    value={targetKey}
                    onChange={(e) => setTargetKey(e.target.value)}
                    className="w-full font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400"
                  >
                    {CHROMATIC_SHARPS.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <span className="text-[11px] text-slate-400 block mb-1">Tempo:</span>
                  <input
                    type="number"
                    value={targetTempo}
                    onChange={(e) => setTargetTempo(parseInt(e.target.value) || 125)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de la Progresión Calculada */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {transition.transitionType}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Intervalo: {transition.intervalName}
                </h3>
              </div>
              <button
                onClick={playTransitionProgression}
                disabled={isPlayingAudio}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition disabled:opacity-50"
              >
                {isPlayingAudio ? (
                  <>
                    <Volume2 className="h-4 w-4 animate-bounce" />
                    <span>Sonando...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-slate-950" />
                    <span>Escuchar Progresión</span>
                  </>
                )}
              </button>
            </div>

            {/* Secuencia Visual de Acordes */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {transition.steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-2xl border transition-all ${
                    activeStepIndex === idx
                      ? 'border-amber-400 bg-amber-500/25 scale-110 shadow-lg shadow-amber-500/20'
                      : step.role === 'resolution'
                        ? 'border-emerald-500/40 bg-emerald-500/15'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}>
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      {step.chord}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {step.durationBeats} tiempos
                    </span>
                  </div>
                  {idx < transition.steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Guía Específica por Instrumento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Instrucciones por Músico en el Escenario
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Teclados / Piano */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Piano className="h-4 w-4" />
                  <span>Piano / Tecladista</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {transition.keyboardAdvice}
                </p>
              </div>

              {/* Guitarras */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Guitar className="h-4 w-4" />
                  <span>Guitarrista (Acústica / Eléctrica)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {transition.guitarAdvice}
                </p>
              </div>

              {/* Batería */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span>Batería & Percusión</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {transition.drumsAdvice}
                </p>
              </div>

              {/* Bajo */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Sliders className="h-4 w-4" />
                  <span>Bajista</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {transition.bassAdvice}
                </p>
              </div>
            </div>

            {/* Director de Alabanza */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Mic2 className="h-4 w-4" />
                <span>Vocalista / Director de Alabanza</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {transition.worshipLeaderAdvice}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {transition.chordsSequence.join(' → ')}
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white px-5 py-2 text-xs font-bold text-white dark:text-slate-950 transition"
          >
            Listo / Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
