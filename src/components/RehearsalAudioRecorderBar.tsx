'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Pause, 
  Play, 
  Download, 
  X, 
  Radio, 
  Volume2,
  Trash2
} from 'lucide-react';
import { getRehearsalRecorder, RecordedTrack } from '@/lib/audio-recorder';

interface RehearsalAudioRecorderBarProps {
  currentSongTitle?: string;
  currentSetlistTitle?: string;
  onTrackSaved?: (track: RecordedTrack) => void;
}

export default function RehearsalAudioRecorderBar({
  currentSongTitle,
  currentSetlistTitle,
  onTrackSaved
}: RehearsalAudioRecorderBarProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [lastTake, setLastTake] = useState<RecordedTrack | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const recorder = useRef(getRehearsalRecorder());

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    try {
      await recorder.current.startRecording((time) => {
        setElapsedSeconds(time);
      });
      setIsRecording(true);
      setIsPaused(false);
      setElapsedSeconds(0);
      setLastTake(null);
    } catch (e: any) {
      alert(e.message || 'Error al iniciar la grabación.');
    }
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      recorder.current.resumeRecording();
      setIsPaused(false);
    } else {
      recorder.current.pauseRecording();
      setIsPaused(true);
    }
  };

  const handleStop = async () => {
    try {
      const track = await recorder.current.stopRecording({
        songTitle: currentSongTitle,
        setlistTitle: currentSetlistTitle
      });
      setIsRecording(false);
      setIsPaused(false);
      setLastTake(track);
      if (onTrackSaved) onTrackSaved(track);
    } catch (e: any) {
      console.error(e);
      setIsRecording(false);
    }
  };

  return (
    <>
      {/* Botón flotante para abrir barra de grabación si está cerrada */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-20 md:bottom-4 right-3 sm:right-4 z-40 flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2 text-xs font-bold shadow-2xl transition border ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse border-red-400'
              : 'bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md text-slate-200 border-slate-700 hover:border-amber-500'
          }`}
          title="Abrir Grabadora de Ensayo"
        >
          <Mic className={`h-4 w-4 ${isRecording ? 'text-white' : 'text-amber-400'}`} />
          <span>{isRecording ? `Grabando (${formatTime(elapsedSeconds)})` : 'Grabar'}</span>
        </button>
      )}

      {/* Barra de Grabación Desplegada */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-4 left-3 right-3 sm:left-4 sm:right-4 md:left-auto md:right-4 md:w-96 z-40 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 shadow-2xl text-slate-800 dark:text-slate-100 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
              <span className="font-bold text-xs">Grabadora de Ensayo</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white block">
                {formatTime(elapsedSeconds)}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentSongTitle ? `Tema: ${currentSongTitle}` : 'Ensayo General'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {!isRecording ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-red-600/30 transition"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Grabar</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseToggle}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                    title={isPaused ? 'Reanudar' : 'Pausar'}
                  >
                    {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-500" /> : <Pause className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1 rounded-xl bg-slate-900 text-white dark:bg-red-600 px-3 py-1.5 text-xs font-bold shadow transition"
                  >
                    <Square className="h-3 w-3" />
                    <span>Detener</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Reproductor de la última toma grabada */}
          {lastTake && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
              <div className="min-w-0 pr-2">
                <span className="font-semibold text-slate-900 dark:text-white block truncate text-[11px]">
                  Toma guardada ({formatTime(lastTake.durationSeconds)})
                </span>
                <audio controls src={lastTake.blobUrl} className="h-7 w-48 mt-1 scale-90 -ml-2" />
              </div>

              <a
                href={lastTake.blobUrl}
                download={`${lastTake.songTitle || 'ensayo'}-${Date.now()}.webm`}
                className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shrink-0"
                title="Descargar audio"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
