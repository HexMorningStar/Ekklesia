'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Maximize, 
  Minimize, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Tv, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { stripChords } from '@/lib/chord-engine';

interface ProjectionModalProps {
  isOpen: boolean;
  songs: any[];
  currentSongIndex?: number;
  initialSongIndex?: number;
  onClose: () => void;
}

export type ProjectionTheme = 'church_dark' | 'obs_chroma_green' | 'clean_white';

export default function ProjectionModal({
  isOpen,
  songs,
  currentSongIndex,
  initialSongIndex,
  onClose
}: ProjectionModalProps) {
  const startIdx = initialSongIndex ?? currentSongIndex ?? 0;
  const [index, setIndex] = useState(startIdx);
  const [theme, setTheme] = useState<ProjectionTheme>('church_dark');
  const [fontSize, setFontSize] = useState<number>(36); // px
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(3);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<any>(null);

  useEffect(() => {
    setIndex(initialSongIndex ?? currentSongIndex ?? 0);
  }, [initialSongIndex, currentSongIndex, isOpen]);

  const currentSong = songs[index] || songs[0];

  // Auto-scroll
  useEffect(() => {
    if (isAutoScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollBy({ top: 1, behavior: 'smooth' });
        }
      }, Math.max(15, 80 - scrollSpeed * 6));
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  if (!isOpen || !currentSong) return null;

  // Extraer sólo letras y secciones
  const rawContent = currentSong.content || '';
  const lines = rawContent.split('\n');

  const parsedLines = lines.map((l: string) => {
    const trimmed = l.trim();
    if (!trimmed) return { type: 'empty' };
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.includes(' ')) {
      const section = trimmed.slice(1, -1);
      // Si parece una sección (ej. Intro, Verso, Coro, Puente)
      if (['intro', 'verso', 'verso 1', 'verso 2', 'pre-coro', 'coro', 'puente', 'outro', 'final'].includes(section.toLowerCase())) {
        return { type: 'section', text: section.toUpperCase() };
      }
    }
    const cleanLyric = stripChords(l).trim();
    return { type: 'lyric', text: cleanLyric };
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'obs_chroma_green':
        return 'bg-[#00FF00] text-black font-extrabold text-shadow';
      case 'clean_white':
        return 'bg-white text-slate-900';
      case 'church_dark':
      default:
        return 'bg-black text-slate-100';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${getThemeClasses()} select-none overflow-hidden transition-colors`}>
      {/* Barra de herramientas flotante para el operador de proyección */}
      <div className="group opacity-20 hover:opacity-100 transition-opacity duration-300 absolute top-0 left-0 right-0 z-30 p-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between text-white text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-amber-400" />
            <span className="font-bold">Modo Proyección Congregacional</span>
          </div>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
            {currentSong.title} ({index + 1} de {songs.length})
          </span>
        </div>

        {/* Controles de pantalla y estilo */}
        <div className="flex items-center gap-2">
          {/* Selector de tema de proyección */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ProjectionTheme)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 font-semibold focus:outline-none"
          >
            <option value="church_dark">Fondo Negro (Sala / Beamer)</option>
            <option value="clean_white">Fondo Blanco (Lectura)</option>
            <option value="obs_chroma_green">Chroma Verde (OBS Studio)</option>
          </select>

          {/* Tamaño de fuente */}
          <div className="flex items-center border border-slate-700 rounded bg-slate-900 px-1.5 py-0.5">
            <button
              onClick={() => setFontSize(Math.max(20, fontSize - 4))}
              className="px-1 text-slate-400 hover:text-white"
            >
              A-
            </button>
            <span className="px-1 text-[11px] font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(72, fontSize + 4))}
              className="px-1 text-slate-400 hover:text-white"
            >
              A+
            </button>
          </div>

          {/* Auto-scroll */}
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`flex items-center gap-1 rounded px-2.5 py-1 font-semibold ${
              isAutoScrolling ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isAutoScrolling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>Scroll</span>
          </button>

          {/* Canción anterior / siguiente */}
          {songs.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIndex(Math.max(0, index - 1))}
                disabled={index === 0}
                className="p-1 rounded bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIndex(Math.min(songs.length - 1, index + 1))}
                disabled={index === songs.length - 1}
                className="p-1 rounded bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-red-600/80 hover:bg-red-500 text-white"
            title="Cerrar proyección"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contenedor principal de letras proyectadas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-8 md:px-16 py-20 flex flex-col items-center justify-start text-center"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-4xl w-full space-y-6 leading-relaxed">
          {parsedLines.map((line: any, idx: number) => {
            if (line.type === 'empty') {
              return <div key={idx} className="h-8" />;
            }
            if (line.type === 'section') {
              return (
                <div key={idx} className="pt-8 pb-2">
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-extrabold tracking-widest uppercase ${
                    theme === 'church_dark' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                      : 'bg-black/10 text-slate-800 border border-black/20'
                  }`}>
                    {line.text}
                  </span>
                </div>
              );
            }
            return (
              <p 
                key={idx} 
                className="font-medium tracking-tight whitespace-pre-wrap transition-all"
              >
                {line.text}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
