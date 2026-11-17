'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw, 
  BookOpen, 
  Music, 
  Maximize2, 
  FileText, 
  Edit3, 
  ArrowLeft,
  Volume2,
  VolumeX,
  Printer,
  Radio,
  Sliders,
  Tv,
  Guitar,
  Sparkles,
  Compass,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';
import { 
  parseSongContent, 
  NotationType, 
  CHROMATIC_SHARPS, 
  CHROMATIC_FLATS, 
  NOTE_TO_SOLFA, 
  transposeNote,
  formatChord,
  INSTRUMENTS,
  InstrumentKey
} from '@/lib/chord-engine';
import { getAmbientPadEngine } from '@/lib/ambient-pad-engine';
import ChordDiagramModal from './ChordDiagramModal';
import CapoCalculatorModal from './CapoCalculatorModal';
import ProjectionModal from './ProjectionModal';
import HarmonicCircleModal from './HarmonicCircleModal';
import InstrumentTunerModal from './InstrumentTunerModal';
import GuitarTabViewer from './GuitarTabViewer';
import MultitrackPlayerModal from './MultitrackPlayerModal';
import SongTransitionModal from './SongTransitionModal';
import { PedalController } from '@/lib/pedal-controller';

interface SongViewerProps {
  song: any;
  onBack?: () => void;
  onEdit?: (song: any) => void;
  onLaunchLiveMode?: (song: any, semitones: number, notation: NotationType) => void;
}

export default function SongViewer({ song, onBack, onEdit, onLaunchLiveMode }: SongViewerProps) {
  const [semitones, setSemitones] = useState<number>(0);
  const [notation, setNotation] = useState<NotationType>('american');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentKey>('C');
  const [fontSize, setFontSize] = useState<number>(16);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(3); // 1-10
  const [selectedChordForModal, setSelectedChordForModal] = useState<string | null>(null);

  // Modales adicionales: Capo, Proyección, Círculo Armónico, Afinador, Tablaturas, Secuencias y Transiciones
  const [isCapoModalOpen, setIsCapoModalOpen] = useState<boolean>(false);
  const [activeCapoFret, setActiveCapoFret] = useState<number | null>(null);
  const [activeCapoShape, setActiveCapoShape] = useState<string | null>(null);
  const [isProjectionOpen, setIsProjectionOpen] = useState<boolean>(false);
  const [isHarmonicCircleOpen, setIsHarmonicCircleOpen] = useState<boolean>(false);
  const [isTunerOpen, setIsTunerOpen] = useState<boolean>(false);
  const [isGuitarTabOpen, setIsGuitarTabOpen] = useState<boolean>(false);
  const [isMultitrackOpen, setIsMultitrackOpen] = useState<boolean>(false);
  const [isTransitionOpen, setIsTransitionOpen] = useState<boolean>(false);

  // Vista activa: 'chords' (letra y acordes) vs 'sheet' (partitura)
  const [viewMode, setViewMode] = useState<'chords' | 'sheet'>('chords');

  // Control móvil de herramientas y metadatos
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState<boolean>(false);
  const [isMetaExpanded, setIsMetaExpanded] = useState<boolean>(false);

  // Ambient Worship Pad
  const [isPadPlaying, setIsPadPlaying] = useState<boolean>(false);
  const padEngine = useRef(getAmbientPadEngine());

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<any>(null);

  // Obtener info del instrumento seleccionado
  const instrumentInfo = INSTRUMENTS.find(i => i.id === selectedInstrument) || INSTRUMENTS[0];
  const instrumentSemitones = instrumentInfo.transpositionSemitones;

  // Tono de concierto
  const concertKey = transposeNote(song.original_key || 'G', semitones);
  // Tono efectivo para el instrumento
  const displayedKey = transposeNote(concertKey, instrumentSemitones);

  // Contenido parseado con el desplazamiento total (semitonos + instrumento)
  const totalSemitones = semitones + instrumentSemitones;
  const parsedContent = parseSongContent(song.content || '', totalSemitones, notation, displayedKey);

  // Auto-scroll loop
  useEffect(() => {
    if (isAutoScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollBy({ top: 1, behavior: 'smooth' });
        } else {
          window.scrollBy({ top: 1, behavior: 'smooth' });
        }
      }, Math.max(15, 75 - scrollSpeed * 6));
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Actualizar Pad si cambia la tonalidad mientras está sonando
  useEffect(() => {
    if (isPadPlaying) {
      padEngine.current.play(concertKey);
    }
  }, [concertKey, isPadPlaying]);

  // Detener Pad al desmontar
  useEffect(() => {
    return () => {
      padEngine.current.stop();
    };
  }, []);

  const toggleAmbientPad = () => {
    if (isPadPlaying) {
      padEngine.current.stop();
      setIsPadPlaying(false);
    } else {
      padEngine.current.play(concertKey);
      setIsPadPlaying(true);
    }
  };

  const handleTranspose = (diff: number) => {
    setSemitones((prev) => prev + diff);
  };

  const handleResetTranspose = () => {
    setSemitones(0);
    setActiveCapoFret(null);
    setActiveCapoShape(null);
  };

  const handleApplyCapo = (fret: number, shape: string) => {
    setActiveCapoFret(fret);
    setActiveCapoShape(shape);
    setSemitones(-fret);
  };

  // Escuchar pedales Bluetooth y controladores MIDI
  useEffect(() => {
    const controller = new PedalController();
    controller.init({
      onToggleScroll: () => setIsAutoScrolling(prev => !prev),
      onTogglePad: () => toggleAmbientPad(),
    });
    return () => controller.destroy();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-xl overflow-hidden transition-colors">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR MÓVIL (< 768px - Galaxy S25 Ultra, etc.)                 */}
      {/* ========================================================================= */}
      <div className="print:hidden md:hidden sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 px-3 py-2 backdrop-blur-md transition-colors space-y-2">
        {/* Fila 1: Título, Volver, Modo Atril y Herramientas */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition shrink-0"
                title="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {song.title}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {song.artist_name || 'Artista'} • {song.time_signature || '4/4'} • {song.tempo || 72} BPM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onLaunchLiveMode && (
              <button
                onClick={() => onLaunchLiveMode(song, semitones, notation)}
                className="flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 px-2.5 py-1.5 text-xs font-bold text-slate-950 transition shadow-sm active:scale-95"
                title="Abrir Modo Atril en pantalla completa"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Atril</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileToolsOpen(true)}
              className="relative rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 transition active:scale-95"
              title="Herramientas y Ajustes"
            >
              <Sliders className="h-4 w-4" />
              {(semitones !== 0 || activeCapoFret !== null || selectedInstrument !== 'C') && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Fila 2: Tira Rápida para el Músico (Tono, Pad, Scroll, Notación) */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Tono con transposición rápida */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 px-2 py-1 text-xs shrink-0">
            <span className="text-slate-500 text-[10px]">Tono:</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400 min-w-5 text-center">
              {notation === 'solfa' ? NOTE_TO_SOLFA[displayedKey] || displayedKey : displayedKey}
            </span>
            <button
              onClick={() => handleTranspose(-1)}
              className="rounded p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Bajar medio tono"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleTranspose(1)}
              className="rounded p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Subir medio tono"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            {semitones !== 0 && (
              <button
                onClick={handleResetTranspose}
                className="text-[10px] text-amber-500 ml-0.5"
                title="Restablecer"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Ambient Worship Pad */}
          <button
            onClick={toggleAmbientPad}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold transition shrink-0 ${
              isPadPlaying
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm animate-pulse'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Pad ambiental"
          >
            <Radio className="h-3 w-3" />
            <span>Pad {concertKey}</span>
          </button>

          {/* Auto-scroll Rápido */}
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold transition shrink-0 ${
              isAutoScrolling
                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Auto-scroll"
          >
            {isAutoScrolling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{isAutoScrolling ? 'Pausa' : 'Scroll'}</span>
          </button>

          {/* Selector Notación Compacto */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-0.5 text-[11px] font-medium shrink-0">
            <button
              onClick={() => setNotation('american')}
              className={`rounded px-1.5 py-0.5 transition ${
                notation === 'american' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'
              }`}
            >
              C,D
            </button>
            <button
              onClick={() => setNotation('solfa')}
              className={`rounded px-1.5 py-0.5 transition ${
                notation === 'solfa' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'
              }`}
            >
              Do,Re
            </button>
            <button
              onClick={() => setNotation('degrees')}
              className={`rounded px-1.5 py-0.5 transition ${
                notation === 'degrees' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'
              }`}
            >
              I,IV
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BARRA SUPERIOR ESCRITORIO (>= 768px Tablets y Desktop)                */}
      {/* ========================================================================= */}
      <div className="print:hidden hidden md:flex sticky top-0 z-30 flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 px-4 py-3 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
              title="Volver a la lista"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{song.title}</h1>
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                {song.time_signature || '4/4'}
              </span>
              <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                {song.tempo || 72} BPM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Por <span className="font-medium text-slate-700 dark:text-slate-300">{song.artist_name || 'Artista'}</span>
            </p>
          </div>
        </div>

        {/* Selector de Vista: Letra/Acordes vs Partitura */}
        {song.sheet_music_url && (
          <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode('chords')}
              className={`rounded px-3 py-1 transition ${
                viewMode === 'chords' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Letra y Acordes
            </button>
            <button
              onClick={() => setViewMode('sheet')}
              className={`flex items-center gap-1 rounded px-3 py-1 transition ${
                viewMode === 'sheet' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Partitura</span>
            </button>
          </div>
        )}

        {/* Controles interactivos completos de escritorio */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Instrumento Transpositor */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded-lg text-xs">
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(e.target.value as InstrumentKey)}
              className="bg-transparent text-amber-700 dark:text-amber-400 font-semibold focus:outline-none cursor-pointer"
              title="Ajuste de tono para instrumentos transpositores (vientos, metales)"
            >
              {INSTRUMENTS.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Notación: Cifrado Americano vs Solfa vs Grados */}
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-0.5 text-xs font-medium">
            <button
              onClick={() => setNotation('american')}
              className={`rounded-md px-2.5 py-1 transition ${
                notation === 'american'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cifrado (C, D)
            </button>
            <button
              onClick={() => setNotation('solfa')}
              className={`rounded-md px-2.5 py-1 transition ${
                notation === 'solfa'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Solfa (Do, Re)
            </button>
            <button
              onClick={() => setNotation('degrees')}
              className={`rounded-md px-2 py-1 transition ${
                notation === 'degrees'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Grados (I, IV)
            </button>
          </div>

          {/* Transposición */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2 py-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 mr-0.5">Tono:</span>
            <span className="font-bold text-amber-700 dark:text-amber-400 min-w-6 text-center">
              {notation === 'solfa' ? NOTE_TO_SOLFA[displayedKey] || displayedKey : displayedKey}
            </span>
            {selectedInstrument !== 'C' && (
              <span className="text-[10px] text-blue-400">
                (Conc: {concertKey})
              </span>
            )}
            <button
              onClick={() => handleTranspose(-1)}
              className="ml-1 rounded p-1 hover:bg-slate-700 text-slate-300"
              title="Bajar medio tono"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleTranspose(1)}
              className="rounded p-1 hover:bg-slate-700 text-slate-300"
              title="Subir medio tono"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            {semitones !== 0 && (
              <button
                onClick={handleResetTranspose}
                className="rounded p-1 hover:bg-slate-700 text-slate-400"
                title="Restablecer al tono original"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Ambient Worship Pad Synth */}
          <button
            onClick={toggleAmbientPad}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
              isPadPlaying
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Activar o pausar Pad ambiental"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Pad {concertKey}</span>
          </button>

          {/* Auto-Scroll Manos Libres */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2 py-1 text-xs">
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`flex items-center gap-1 rounded px-2 py-0.5 font-medium transition ${
                isAutoScrolling ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              }`}
              title="Auto-scroll manos libres"
            >
              {isAutoScrolling ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isAutoScrolling ? 'Pausar' : 'Auto-scroll'}</span>
            </button>
            <input
              type="range"
              min="1"
              max="10"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-14 h-1.5 accent-amber-500 cursor-pointer"
              title={`Velocidad: ${scrollSpeed}`}
            />
          </div>

          {/* Tamaño de Fuente */}
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-1 py-0.5 text-xs">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="px-1.5 py-0.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono"
            >
              A-
            </button>
            <span className="text-slate-500 px-1 text-[10px]">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 1))}
              className="px-1.5 py-0.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono"
            >
              A+
            </button>
          </div>

          {/* Imprimir / Exportar Hoja de Acordes */}
          <button
            onClick={handlePrint}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="h-4 w-4" />
          </button>

          {/* Círculo Armónico */}
          <button
            onClick={() => setIsHarmonicCircleOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 transition"
            title="Círculo Armónico"
          >
            <Compass className="h-3.5 w-3.5 text-amber-500" />
            <span>Círculo</span>
          </button>

          {/* Capo */}
          <button
            onClick={() => setIsCapoModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
              activeCapoFret !== null
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Calculadora de cejilla"
          >
            <Guitar className="h-3.5 w-3.5" />
            <span>{activeCapoFret !== null ? `Capo ${activeCapoFret}` : 'Capo'}</span>
          </button>

          {/* Afinador */}
          <button
            onClick={() => setIsTunerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            title="Afinador Cromático Digital"
          >
            <Guitar className="h-3.5 w-3.5 text-amber-500" />
            <span>Afinador</span>
          </button>

          {/* Modo Proyección Congregacional */}
          <button
            onClick={() => setIsProjectionOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            title="Proyectar letras"
          >
            <Tv className="h-3.5 w-3.5 text-blue-500" />
            <span>Proyección</span>
          </button>

          {/* Tablaturas y Riffs */}
          <button
            onClick={() => setIsGuitarTabOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition"
            title="Visualizador de Tablaturas y Riffs de Guitarra"
          >
            <Guitar className="h-3.5 w-3.5 text-emerald-500" />
            <span>Riffs / Tab</span>
          </button>

          {/* Secuencias y Multipistas */}
          <button
            onClick={() => setIsMultitrackOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 transition"
            title="Reproductor de Multi-Pistas y Secuencias con Clic y Voz"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-500" />
            <span>Secuencias</span>
          </button>

          {/* Transición y Modulación */}
          <button
            onClick={() => setIsTransitionOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            title="Generador de Transiciones y Modulaciones"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Modulación</span>
          </button>

          {/* Modo Atril */}
          {onLaunchLiveMode && (
            <button
              onClick={() => onLaunchLiveMode(song, semitones, notation)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition shadow-lg shadow-amber-500/20"
              title="Abrir en Modo Atril Digital"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Modo Atril</span>
            </button>
          )}

          {/* Editar Canción */}
          {onEdit && (
            <button
              onClick={() => onEdit(song)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              title="Editar canción"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido de Impresión Encabezado */}
      <div className="hidden print:block p-6 border-b border-black text-black">
        <h1 className="text-2xl font-bold">{song.title}</h1>
        <p className="text-sm font-semibold text-gray-700">
          Artista: {song.artist_name} • Tono: {displayedKey} ({notation === 'solfa' ? 'Solfa' : 'Cifrado'}) • {song.tempo} BPM • Compás {song.time_signature}
        </p>
        {song.scripture_reference && (
          <p className="text-xs italic text-gray-600 mt-1">📖 {song.scripture_reference}</p>
        )}
      </div>

      {/* Cuerpo principal */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 print:p-0 print:text-black"
        style={{ fontSize: `${fontSize}px` }}
      >
        {viewMode === 'sheet' && song.sheet_music_url ? (
          /* Visor de Partitura (PDF o Imagen) */
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-slate-900 rounded-xl p-4 border border-slate-800">
            {song.sheet_music_url.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={song.sheet_music_url}
                className="w-full h-[700px] rounded-lg border border-slate-700"
                title={`Partitura de ${song.title}`}
              />
            ) : (
              <img
                src={song.sheet_music_url}
                alt={`Partitura de ${song.title}`}
                className="max-w-full max-h-[750px] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        ) : (
          /* Vista de Letra y Acordes */
          <>
            {/* Metadatos bíblicos y notas (colapsable en móvil para ahorrar espacio) */}
            {(song.scripture_reference || song.notes) && (
              <div className="mb-4">
                {/* Versión móvil: Acordeón colapsable */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMetaExpanded(!isMetaExpanded)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 transition active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <BookOpen className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="truncate font-semibold text-slate-900 dark:text-white">
                        {song.scripture_reference ? `📖 ${song.scripture_reference}` : 'Notas musicales'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold shrink-0">
                      <span>{isMetaExpanded ? 'Ocultar' : 'Ver detalles'}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isMetaExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isMetaExpanded && (
                    <div className="mt-2 space-y-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 text-xs animate-in fade-in duration-150">
                      {song.scripture_reference && (
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">Fundamento Bíblico:</span>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">{song.scripture_reference}</p>
                        </div>
                      )}
                      {song.notes && (
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Indicaciones para Músicos:</span>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">{song.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Versión desktop: Tarjetas en cuadrícula */}
                <div className="hidden md:grid md:grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs print:border-gray-300 print:bg-gray-50 print:text-black">
                  {song.scripture_reference && (
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5 print:text-black" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-300 print:text-black">Fundamento Bíblico:</span>
                        <p className="text-slate-600 dark:text-slate-400 print:text-gray-800 mt-0.5">{song.scripture_reference}</p>
                      </div>
                    </div>
                  )}
                  {song.notes && (
                    <div className="flex items-start gap-2">
                      <Music className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5 print:text-black" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-300 print:text-black">Indicaciones para Músicos:</span>
                        <p className="text-slate-600 dark:text-slate-400 print:text-gray-800 mt-0.5">{song.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Renderizado de secciones, acordes y letra */}
            <div className="space-y-4 font-mono leading-relaxed print:text-black">
              {parsedContent.map((line, idx) => {
                if (line.type === 'empty') {
                  return <div key={idx} className="h-4" />;
                }

                if (line.type === 'section') {
                  return (
                    <div key={idx} className="pt-3 pb-1">
                      <span className="inline-block rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-700 dark:text-amber-300 tracking-wider print:border-black print:bg-gray-200 print:text-black">
                        {line.sectionName}
                      </span>
                    </div>
                  );
                }

                if (line.type === 'lyrics-only') {
                  return (
                    <div key={idx} className="text-slate-800 dark:text-slate-200 pl-1 whitespace-pre-wrap font-sans print:text-black">
                      {line.rawText}
                    </div>
                  );
                }

                if (line.type === 'chords-and-lyrics' && line.items) {
                  return (
                    <div key={idx} className="flex flex-wrap items-end gap-x-1 gap-y-2 pl-1 py-1">
                      {line.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="inline-flex flex-col">
                          {/* Acorde encima */}
                          {item.chord ? (
                            <button
                              onClick={() => setSelectedChordForModal(item.chord || null)}
                              className="text-left font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-200 transition-colors -mb-1 text-sm md:text-base font-mono cursor-pointer hover:underline print:text-blue-900 print:no-underline"
                              title="Ver diagrama de digitación en guitarra y piano"
                            >
                              {item.chord}
                            </button>
                          ) : (
                            <span className="h-5" />
                          )}
                          {/* Letra debajo */}
                          <span className="text-slate-900 dark:text-slate-100 font-sans whitespace-pre print:text-black">
                            {item.lyric || ' '}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de Diagramas de Acordes */}
      <ChordDiagramModal
        chord={selectedChordForModal}
        onClose={() => setSelectedChordForModal(null)}
      />

      {/* Modal Calculadora de Cejilla / Capo */}
      <CapoCalculatorModal
        isOpen={isCapoModalOpen}
        concertKey={concertKey}
        onClose={() => setIsCapoModalOpen(false)}
        onApplyCapo={handleApplyCapo}
      />

      {/* Modo Proyección Congregacional (Segunda Pantalla / Beamer) */}
      <ProjectionModal
        isOpen={isProjectionOpen}
        songs={[song]}
        onClose={() => setIsProjectionOpen(false)}
      />

      {/* Modal Círculo Armónico & Acompañamiento Espontáneo */}
      <HarmonicCircleModal
        isOpen={isHarmonicCircleOpen}
        onClose={() => setIsHarmonicCircleOpen(false)}
        initialKey={concertKey}
      />

      {/* Afinador Cromático Digital */}
      <InstrumentTunerModal
        isOpen={isTunerOpen}
        onClose={() => setIsTunerOpen(false)}
      />

      {/* Visualizador de Tablaturas y Riffs Icónicos */}
      <GuitarTabViewer
        isOpen={isGuitarTabOpen}
        onClose={() => setIsGuitarTabOpen(false)}
        songTitle={song.title}
      />

      {/* Reproductor Multi-Pistas & Secuencias */}
      <MultitrackPlayerModal
        isOpen={isMultitrackOpen}
        onClose={() => setIsMultitrackOpen(false)}
        songTitle={song.title}
        initialKey={concertKey}
        initialBpm={song.tempo || 72}
      />

      {/* Generador de Transiciones y Modulaciones Asistido */}
      <SongTransitionModal
        isOpen={isTransitionOpen}
        onClose={() => setIsTransitionOpen(false)}
        initialSourceSong={song}
      />

      {/* ========================================================================= */}
      {/* 3. MODAL DESLIZABLE (BOTTOM SHEET) DE HERRAMIENTAS PARA MÓVIL             */}
      {/* ========================================================================= */}
      {isMobileToolsOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200 text-slate-800 dark:text-slate-100"
          >
            {/* Tirador superior y encabezado */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mb-3" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-amber-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Herramientas y Ajustes
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileToolsOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Bloque 1: Instrumento Transpositor */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Instrumento Transpositor:
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  {instrumentInfo.name}
                </span>
              </div>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value as InstrumentKey)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                {INSTRUMENTS.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bloque 2: Capo, Círculo Armónico & Afinador */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setIsMobileToolsOpen(false);
                  setIsCapoModalOpen(true);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-[11px] font-bold transition text-center ${
                  activeCapoFret !== null
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                }`}
              >
                <Guitar className="h-4 w-4 text-amber-500 mb-0.5" />
                <span>{activeCapoFret !== null ? `Capo ${activeCapoFret}` : 'Capo'}</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileToolsOpen(false);
                  setIsHarmonicCircleOpen(true);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold transition text-center"
              >
                <Compass className="h-4 w-4 text-amber-500 mb-0.5" />
                <span>Círculo</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileToolsOpen(false);
                  setIsTunerOpen(true);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition text-center"
              >
                <Guitar className="h-4 w-4 text-emerald-500 mb-0.5" />
                <span>Afinador</span>
              </button>
            </div>

            {/* Bloque 3: Velocidad de Scroll y Tamaño de Fuente */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Velocidad Scroll:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{scrollSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="w-full h-1.5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tamaño letra:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                    className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold flex items-center justify-center text-slate-700 dark:text-slate-300"
                  >
                    A-
                  </button>
                  <span className="text-[11px] font-mono px-1 font-bold">{fontSize}</span>
                  <button
                    onClick={() => setFontSize(Math.min(26, fontSize + 1))}
                    className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold flex items-center justify-center text-slate-700 dark:text-slate-300"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Bloque 4: Proyección, Imprimir y Editar */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => {
                  setIsMobileToolsOpen(false);
                  setIsProjectionOpen(true);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition"
              >
                <Tv className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-[11px]">Proyectar</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileToolsOpen(false);
                  handlePrint();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition"
              >
                <Printer className="h-5 w-5 text-slate-600 dark:text-slate-400 mb-1" />
                <span className="text-[11px]">Imprimir</span>
              </button>

              {onEdit && (
                <button
                  onClick={() => {
                    setIsMobileToolsOpen(false);
                    onEdit(song);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-medium transition"
                >
                  <Edit3 className="h-5 w-5 text-amber-500 mb-1" />
                  <span className="text-[11px]">Editar</span>
                </button>
              )}
            </div>

            {/* Alternar Partitura en móvil si tiene */}
            {song.sheet_music_url && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setViewMode(viewMode === 'chords' ? 'sheet' : 'chords');
                    setIsMobileToolsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  <FileText className="h-4 w-4" />
                  <span>{viewMode === 'chords' ? 'Ver Partitura' : 'Ver Acordes y Letra'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
