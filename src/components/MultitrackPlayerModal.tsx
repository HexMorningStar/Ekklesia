'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Headphones, 
  Sliders, 
  Radio, 
  Music, 
  Clock, 
  Mic2, 
  Compass, 
  Check, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MultitrackEngine, RoutingMode, MultitrackChannel } from '@/lib/multitrack-engine';
import { CHROMATIC_SHARPS } from '@/lib/chord-engine';

interface MultitrackPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle?: string;
  initialKey?: string;
  initialBpm?: number;
}

export default function MultitrackPlayerModal({
  isOpen,
  onClose,
  songTitle,
  initialKey = 'G',
  initialBpm = 72
}: MultitrackPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [songKey, setSongKey] = useState<string>(initialKey);
  const [currentBar, setCurrentBar] = useState<number>(1);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [routingMode, setRoutingMode] = useState<RoutingMode>('normal_stereo');
  const [masterVolume, setMasterVolume] = useState<number>(85);

  const engineRef = useRef<MultitrackEngine | null>(null);
  const [channels, setChannels] = useState<Record<string, MultitrackChannel>>({});

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new MultitrackEngine();
    }
    const eng = engineRef.current;
    eng.setBpm(bpm);
    eng.setKey(songKey);
    setChannels({ ...eng.channels });
  }, [isOpen]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setBpm(bpm);
    }
  }, [bpm]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setKey(songKey);
    }
  }, [songKey]);

  const handleTogglePlay = () => {
    if (!engineRef.current) return;
    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
    } else {
      engineRef.current.start((bar, beat) => {
        setCurrentBar(bar);
        setCurrentBeat(beat);
      });
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (!engineRef.current) return;
    engineRef.current.stop();
    setIsPlaying(false);
    setCurrentBar(1);
    setCurrentBeat(1);
  };

  const handleVolumeChange = (chId: string, vol: number) => {
    if (!engineRef.current) return;
    engineRef.current.updateChannel(chId, { volume: vol });
    setChannels({ ...engineRef.current.channels });
  };

  const handleToggleMute = (chId: string) => {
    if (!engineRef.current) return;
    const current = engineRef.current.channels[chId];
    engineRef.current.updateChannel(chId, { isMuted: !current.isMuted });
    setChannels({ ...engineRef.current.channels });
  };

  const handleToggleSolo = (chId: string) => {
    if (!engineRef.current) return;
    const current = engineRef.current.channels[chId];
    engineRef.current.updateChannel(chId, { isSolo: !current.isSolo });
    setChannels({ ...engineRef.current.channels });
  };

  const handleToggleRouting = () => {
    if (!engineRef.current) return;
    const nextMode: RoutingMode = routingMode === 'normal_stereo' ? 'in_ear_split' : 'normal_stereo';
    engineRef.current.setRoutingMode(nextMode);
    setRoutingMode(nextMode);
    setChannels({ ...engineRef.current.channels });
  };

  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    if (engineRef.current) {
      engineRef.current.setMasterVolume(vol);
    }
  };

  // Detener al desmontar
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Sliders className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Reproductor Multi-Pistas & Secuencias (Multitrack Player)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {songTitle ? `Mezclador de Secuencias: ${songTitle}` : 'Mezclador multi-canal con clic, guía de voz, pads y ruteo in-ear'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Panel Superior de Control de Transporte */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-950/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Botones de Transporte y Compás */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition shadow-sm active:scale-95 ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isPlaying ? 'Pausar' : 'Iniciar Secuencia'}</span>
            </button>

            <button
              onClick={handleStop}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 transition"
              title="Detener y rebobinar"
            >
              <Square className="h-4 w-4" />
            </button>

            {/* Marcador de Compás y Beat */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono">
              <span className="text-xs text-slate-400">Compás</span>
              <span className="text-sm font-black text-amber-500 min-w-[20px] text-center">
                {currentBar}
              </span>
              <span className="text-slate-600">.</span>
              <span className="text-sm font-black text-emerald-400 min-w-[15px] text-center">
                {currentBeat}
              </span>
            </div>
          </div>

          {/* Ajustes de BPM, Tono y Ruteo In-Ear */}
          <div className="flex items-center gap-3">
            {/* Tono */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Tono:</span>
              <select
                value={songKey}
                onChange={(e) => setSongKey(e.target.value)}
                className="font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-amber-500"
              >
                {CHROMATIC_SHARPS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Tempo BPM */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">BPM:</span>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 72)}
                className="w-16 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-center"
              />
            </div>

            {/* Interruptor Ruteo In-Ear Split */}
            <button
              onClick={handleToggleRouting}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                routingMode === 'in_ear_split'
                  ? 'border-purple-500/50 bg-purple-500/20 text-purple-400 ring-1 ring-purple-500'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
              title="Separar Clic/Voz al audífono izquierdo y Música a la consola derecha"
            >
              <Headphones className="h-4 w-4 text-purple-500" />
              <span>
                {routingMode === 'in_ear_split' ? 'In-Ear Split (L/R) Activo' : 'Estéreo Normal'}
              </span>
            </button>
          </div>
        </div>

        {/* Faders de Canales / Mesa de Mezclas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {routingMode === 'in_ear_split' && (
            <div className="flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-300">
              <Headphones className="h-4 w-4 text-purple-400 shrink-0" />
              <span>
                <strong>Modo Ruteo In-Ear Dividido:</strong> El canal izquierdo (L) envía el Clic y la Guía de Voz a los audífonos de los músicos. El canal derecho (R) envía los Pads, Batería y Bajo a la consola general.
              </span>
            </div>
          )}

          {/* Grilla de Canales (Tiras de Fader) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(channels).map(([chKey, ch]) => (
              <div 
                key={chKey}
                className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                  ch.isMuted
                    ? 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40'
                    : ch.isSolo
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                }`}
              >
                {/* Nombre de la pista */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {ch.name.split('/')[0]}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-500">
                      {ch.volume}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {ch.name.split('/')[1] || 'Stem'}
                  </span>
                </div>

                {/* Fader Vertical / Slider de Volumen */}
                <div className="flex items-center justify-center py-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl mb-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ch.volume}
                    onChange={(e) => handleVolumeChange(chKey, parseInt(e.target.value))}
                    className="w-full h-2 accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Botones Mute y Solo */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleToggleMute(chKey)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition ${
                      ch.isMuted
                        ? 'bg-red-500 text-white'
                        : 'border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Mute
                  </button>
                  <button
                    onClick={() => handleToggleSolo(chKey)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition ${
                      ch.isSolo
                        ? 'bg-amber-500 text-slate-950'
                        : 'border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Solo
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Fader Master General */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Volumen Master de la Mezcla
                </span>
                <span className="text-[11px] text-slate-400">
                  Controla la ganancia global de salida
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => handleMasterVolumeChange(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-xs font-bold text-amber-500 w-10 text-right">
                {masterVolume}%
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            5 Canales Activos • Compatible con audífonos In-Ear por cable o Bluetooth
          </span>
          <button
            onClick={() => {
              handleStop();
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
