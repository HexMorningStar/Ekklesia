'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Guitar, 
  Play, 
  Pause, 
  Volume2, 
  Copy, 
  Check, 
  Sparkles, 
  Music, 
  BookOpen, 
  Sliders, 
  RotateCcw,
  Plus
} from 'lucide-react';
import { 
  ICONIC_WORSHIP_RIFFS, 
  IconicWorshipRiff, 
  getFretFrequency, 
  playGuitarStringPluck 
} from '@/lib/guitar-tab-engine';

interface GuitarTabViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  songTitle?: string;
  onInsertTabIntoSong?: (tabText: string) => void;
}

export default function GuitarTabViewer({
  isOpen,
  onClose,
  initialTab,
  songTitle,
  onInsertTabIntoSong
}: GuitarTabViewerProps) {
  const [selectedRiffId, setSelectedRiffId] = useState<string>(ICONIC_WORSHIP_RIFFS[0].id);
  const [tabText, setTabText] = useState<string>(initialTab || ICONIC_WORSHIP_RIFFS[0].tabText);
  const [bpm, setBpm] = useState<number>(ICONIC_WORSHIP_RIFFS[0].tempo);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayColumn, setCurrentPlayColumn] = useState<number>(-1);
  const [copied, setCopied] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackTimeoutRef = useRef<any>(null);

  // Seleccionar riff predefinido
  const handleSelectRiff = (riff: IconicWorshipRiff) => {
    setSelectedRiffId(riff.id);
    setTabText(riff.tabText);
    setBpm(riff.tempo);
    stopPlayback();
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentPlayColumn(-1);
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  // Reproductor de tablatura nota por nota
  const playTabAudio = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setIsPlaying(true);

      const lines = tabText.trim().split('\n').filter(l => l.includes('|'));
      if (lines.length < 6) {
        setIsPlaying(false);
        return;
      }

      // Detectar cuerdas estándar e, B, G, D, A, E
      const stringLines = lines.slice(0, 6);
      const maxCol = Math.max(...stringLines.map(l => l.length));
      const colDuration = (60 / bpm) / 4; // semicorchea

      let colIdx = 0;

      const scheduleColumn = () => {
        if (!audioCtxRef.current || colIdx >= maxCol) {
          stopPlayback();
          return;
        }

        setCurrentPlayColumn(colIdx);

        // Buscar notas en la columna actual
        for (let strIdx = 0; strIdx < 6; strIdx++) {
          const line = stringLines[strIdx];
          if (colIdx < line.length) {
            const char = line[colIdx];
            const fret = parseInt(char);
            if (!isNaN(fret)) {
              const freq = getFretFrequency(strIdx, fret);
              playGuitarStringPluck(audioCtxRef.current, freq, audioCtxRef.current.currentTime, 0.7);
            }
          }
        }

        colIdx++;
        playbackTimeoutRef.current = setTimeout(scheduleColumn, colDuration * 1000);
      };

      scheduleColumn();

    } catch (e) {
      console.error('Error al reproducir tablatura:', e);
      stopPlayback();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tabText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Guitar className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Visualizador de Tablaturas & Riffs Icónicos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {songTitle ? `Riff para: ${songTitle}` : 'Intros y arreglos de guitarra listos para el ensayo y escenario'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPlayback();
              onClose();
            }}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Selector de Riffs de Alabanza Pre-cargados */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Biblioteca de Riffs e Intros Populares
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {ICONIC_WORSHIP_RIFFS.map((riff) => (
                <button
                  key={riff.id}
                  onClick={() => handleSelectRiff(riff)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition ${
                    selectedRiffId === riff.id
                      ? 'border-amber-500 bg-amber-500/15 shadow-sm ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-xs truncate text-slate-900 dark:text-white">
                    {riff.songTitle.split('(')[0]}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                    {riff.originalKey} • {riff.tempo} BPM
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Barra de Control de Reproducción */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={playTabAudio}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm active:scale-95 ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 fill-white" />
                    <span>Detener</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-slate-950" />
                    <span>Reproducir Riff</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Tempo:</span>
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-24 accent-amber-500"
                />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 w-12 text-center">
                  {bpm} BPM
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Tab'}</span>
              </button>

              {onInsertTabIntoSong && (
                <button
                  onClick={() => onInsertTabIntoSong(tabText)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition shadow-sm shadow-emerald-600/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Insertar en Canción</span>
                </button>
              )}
            </div>
          </div>

          {/* Área de Visualización Monospaced de la Tablatura */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tablatura de 6 Cuerdas (Afinación Estándar E A D G B e)
              </span>
              <span className="text-[11px] text-slate-400">
                Puedes editarla o pegar tus propios arreglos
              </span>
            </div>

            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-amber-400 shadow-inner overflow-x-auto">
              <textarea
                value={tabText}
                onChange={(e) => setTabText(e.target.value)}
                rows={7}
                spellCheck={false}
                className="w-full bg-transparent resize-y font-mono text-xs sm:text-sm text-emerald-400 dark:text-emerald-300 focus:outline-none leading-relaxed tracking-wider"
              />
            </div>
          </div>

          {/* Consejos de Ejecución para el Guitarrista */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Consejo de Tono y Efectos para este Riff</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Para lograr el sonido característico de este riff en vivo: utiliza una pastilla del puente (bridge) o intermedia, añade un compresor ligero para nivelar el ataque y configura tu pedal de delay en corchea con puntillo (dotted-eighth) sincronizado con el tempo ({bpm} BPM).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            6 Cuerdas • Audio sintetizado en tiempo real
          </span>
          <button
            onClick={() => {
              stopPlayback();
              onClose();
            }}
            className="rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white px-5 py-2 text-xs font-bold text-white dark:text-slate-950 transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
