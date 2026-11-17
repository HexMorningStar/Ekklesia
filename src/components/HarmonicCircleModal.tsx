'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Compass, 
  Volume2, 
  Radio, 
  Sparkles, 
  Info, 
  Music, 
  HelpCircle, 
  Check, 
  Flame,
  ChevronRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { 
  CIRCLE_OF_FIFTHS, 
  getHarmonicKeyInfo, 
  findCandidateKeysByMelodyNote, 
  playAuditoryReferenceTone,
  CandidateKeyMatch,
  HarmonicKeyInfo
} from '@/lib/harmonic-circle';
import { CHROMATIC_SHARPS, NOTE_TO_SOLFA, NotationType } from '@/lib/chord-engine';
import { getAmbientPadEngine } from '@/lib/ambient-pad-engine';
import ChordDiagramModal from './ChordDiagramModal';

interface HarmonicCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: string;
}

export default function HarmonicCircleModal({
  isOpen,
  onClose,
  initialKey = 'G'
}: HarmonicCircleModalProps) {
  const [selectedKey, setSelectedKey] = useState<string>(initialKey || 'G');
  const [notation, setNotation] = useState<NotationType>('american');
  const [activeEarNote, setActiveEarNote] = useState<string | null>(null);
  const [selectedChordForDiagram, setSelectedChordForDiagram] = useState<string | null>(null);
  
  // Ambient Pad continuo
  const [isPadPlaying, setIsPadPlaying] = useState<boolean>(false);
  const padEngine = useRef(getAmbientPadEngine());

  useEffect(() => {
    if (initialKey) {
      setSelectedKey(initialKey);
    }
  }, [initialKey, isOpen]);

  // Actualizar pad si la tonalidad cambia mientras está activo
  useEffect(() => {
    if (isPadPlaying) {
      padEngine.current.play(selectedKey);
    }
  }, [selectedKey, isPadPlaying]);

  useEffect(() => {
    return () => {
      padEngine.current.stop();
    };
  }, []);

  if (!isOpen) return null;

  const currentInfo = getHarmonicKeyInfo(selectedKey);
  const candidateMatches: CandidateKeyMatch[] = activeEarNote 
    ? findCandidateKeysByMelodyNote(activeEarNote) 
    : [];

  const handleSelectEarNote = (note: string) => {
    setActiveEarNote(note);
    playAuditoryReferenceTone(note);
    // Seleccionar automáticamente la coincidencia más probable
    const matches = findCandidateKeysByMelodyNote(note);
    if (matches.length > 0) {
      setSelectedKey(matches[0].key);
    }
  };

  const togglePad = () => {
    if (isPadPlaying) {
      padEngine.current.stop();
      setIsPadPlaying(false);
    } else {
      padEngine.current.play(selectedKey);
      setIsPadPlaying(true);
    }
  };

  // Coordenadas trigonométricas para dibujar el Círculo de Quintas en SVG
  const circleRadius = 155;
  const centerX = 200;
  const centerY = 200;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
        
        {/* Cabecera del Círculo Armónico */}
        <header className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 sm:px-5 py-2.5 sm:py-3.5 gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
              <Compass className="h-5 w-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Círculo Armónico & Acompañamiento
                </h3>
                <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 shrink-0">
                  Sin Nota Base
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Identifica el tono al oído y obtén al instante la familia armónica para ministración
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Switch Notación */}
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setNotation('american')}
                className={`rounded px-2.5 py-1 transition ${
                  notation === 'american' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                C, D, G
              </button>
              <button
                onClick={() => setNotation('solfa')}
                className={`rounded px-2.5 py-1 transition ${
                  notation === 'solfa' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Do, Re, Sol
              </button>
            </div>

            {/* Botón de Pad Atmosférico Instantáneo */}
            <button
              onClick={togglePad}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                isPadPlaying
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-amber-500/30'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Iniciar colchón sonoro continuo en esta tonalidad para evitar silencios"
            >
              <Radio className="h-4 w-4" />
              <span>{isPadPlaying ? `Pad ${selectedKey} Activo` : `Lanzar Pad ${selectedKey}`}</span>
            </button>

            <button
              onClick={() => {
                padEngine.current.stop();
                setIsPadPlaying(false);
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* Sección 1: Detector de Tono por Oído (Ear Key Matcher) */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  ¿Alguien comenzó a cantar u orar? Toca la nota que escuchas en su voz:
                </h4>
              </div>
              {activeEarNote && (
                <button
                  onClick={() => setActiveEarNote(null)}
                  className="text-xs text-slate-500 hover:text-amber-500 underline"
                >
                  Limpiar nota de oído
                </button>
              )}
            </div>

            {/* Teclado selector de 12 notas cromáticas */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {CHROMATIC_SHARPS.map((note) => {
                const isSelected = activeEarNote === note;
                const solfaNote = NOTE_TO_SOLFA[note] || note;
                const isSharp = note.includes('#');

                return (
                  <button
                    key={note}
                    onClick={() => handleSelectEarNote(note)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl font-bold transition text-xs border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105 ring-2 ring-amber-500/50'
                        : isSharp
                        ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        : 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-amber-400'
                    }`}
                    title={`Escuchar nota de referencia ${note}`}
                  >
                    <span className="font-mono text-sm">{notation === 'solfa' ? solfaNote : note}</span>
                    <span className="text-[10px] font-normal opacity-70">
                      {notation === 'solfa' ? note : solfaNote}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Resultados sugeridos del buscador de oído */}
            {activeEarNote && candidateMatches.length > 0 && (
              <div className="mt-4 pt-3 border-t border-amber-500/20">
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mb-2">
                  Tonalidades más probables para la nota cantada <span className="font-bold text-amber-500">{activeEarNote}</span>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {candidateMatches.slice(0, 3).map((match, mIdx) => {
                    const isCurrent = selectedKey === match.key;
                    return (
                      <div
                        key={mIdx}
                        onClick={() => setSelectedKey(match.key)}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-500 text-slate-900 dark:text-white ring-1 ring-amber-500'
                            : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                            {notation === 'solfa' ? `${match.solfa} Mayor` : `${match.key} Major`}
                          </span>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                            {match.confidenceScore}% prob.
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {match.roleInKey}
                        </p>
                        <div className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span>Empieza tocando:</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 font-mono">
                            {notation === 'solfa' ? match.firstChordSolfa : match.firstChordToTry}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sección 2: Círculo de Quintas Visual + Panel de la Tonalidad */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Visualización Gráfica Interactiva del Círculo (SVG) */}
            <div className="lg:col-span-5 flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">
                Rueda de Quintas & Familia Armónica
              </h4>

              <div className="relative w-72 h-72 sm:w-80 sm:h-80 select-none">
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow">
                  {/* Círculo base exterior */}
                  <circle cx={centerX} cy={centerY} r="185" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-800" strokeWidth="2" />
                  <circle cx={centerX} cy={centerY} r="125" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-800" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx={centerX} cy={centerY} r="70" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-800" strokeWidth="1" />

                  {/* 12 Posiciones en el círculo */}
                  {CIRCLE_OF_FIFTHS.map((item, i) => {
                    // Cada posición está separada por 30 grados (360 / 12)
                    // C está a 0 grados (arriba, -90 grados respecto a las 3 en punto)
                    const angleDeg = i * 30 - 90;
                    const angleRad = (angleDeg * Math.PI) / 180;

                    // Posición para tono mayor exterior
                    const majorX = centerX + circleRadius * Math.cos(angleRad);
                    const majorY = centerY + circleRadius * Math.sin(angleRad);

                    // Posición para tono menor interior
                    const minorRadius = 98;
                    const minorX = centerX + minorRadius * Math.cos(angleRad);
                    const minorY = centerY + minorRadius * Math.sin(angleRad);

                    const isSelected = selectedKey === item.key;
                    
                    // Identificar si es Subdominante (IV) o Dominante (V) respecto a la seleccionada
                    const currentIndex = CIRCLE_OF_FIFTHS.findIndex(c => c.key === selectedKey);
                    const isSubdominant = (i === (currentIndex - 1 + 12) % 12);
                    const isDominant = (i === (currentIndex + 1) % 12);

                    return (
                      <g key={item.key} className="cursor-pointer" onClick={() => setSelectedKey(item.key)}>
                        {/* Resaltado del nodo mayor */}
                        <circle
                          cx={majorX}
                          cy={majorY}
                          r={isSelected ? 26 : 21}
                          className={`transition-all duration-200 ${
                            isSelected
                              ? 'fill-amber-500 stroke-amber-300 stroke-2 filter drop-shadow-lg'
                              : isSubdominant || isDominant
                              ? 'fill-amber-500/20 stroke-amber-500/50 stroke-1 hover:fill-amber-500/40'
                              : 'fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700 hover:fill-slate-100 dark:hover:fill-slate-700'
                          }`}
                        />

                        {/* Texto del tono mayor */}
                        <text
                          x={majorX}
                          y={majorY + 4}
                          textAnchor="middle"
                          className={`font-bold font-mono text-xs select-none pointer-events-none ${
                            isSelected ? 'fill-slate-950 font-black text-sm' : 'fill-slate-800 dark:fill-slate-100'
                          }`}
                        >
                          {notation === 'solfa' ? (NOTE_TO_SOLFA[item.key] || item.key) : item.key}
                        </text>

                        {/* Texto del relativo menor interior */}
                        <text
                          x={minorX}
                          y={minorY + 3}
                          textAnchor="middle"
                          className={`font-mono text-[10px] select-none pointer-events-none ${
                            isSelected ? 'fill-amber-400 font-bold' : 'fill-slate-400 dark:fill-slate-500'
                          }`}
                        >
                          {item.relativeMinor}
                        </text>
                      </g>
                    );
                  })}

                  {/* Núcleo central del círculo */}
                  <circle cx={centerX} cy={centerY} r="50" className="fill-slate-100 dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" />
                  <text x={centerX} y={centerY - 6} textAnchor="middle" className="fill-amber-500 font-black text-base font-mono">
                    {notation === 'solfa' ? currentInfo.solfa : currentInfo.key}
                  </text>
                  <text x={centerX} y={centerY + 12} textAnchor="middle" className="fill-slate-400 text-[10px] font-sans font-semibold">
                    {currentInfo.relativeMinor}
                  </text>
                </svg>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> Tónica (I)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500/30 inline-block" /> IV y V vecinos
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" /> Círculo interior = vi
                </span>
              </div>
            </div>

            {/* Panel Derecho: Grados Diatónicos y Progresiones */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Acordes de la Familia Armónica */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Familia Armónica Diatónica de {notation === 'solfa' ? currentInfo.solfa : currentInfo.key}</span>
                    <span className="text-[11px] font-normal text-slate-400">({currentInfo.accidentalLabel})</span>
                  </h4>
                  <span className="text-[11px] text-amber-500 font-semibold hidden sm:inline">
                    Haz clic en un acorde para ver su digitación
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {[
                    { degree: 'I (Tónica)', chord: currentInfo.chords.I, solfa: currentInfo.chordsSolfa.I, role: 'Base principal', color: 'border-amber-500/60 bg-amber-500/15 text-amber-700 dark:text-amber-300' },
                    { degree: 'ii (Menor)', chord: currentInfo.chords.ii, solfa: currentInfo.chordsSolfa.ii, role: 'Paso suave', color: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900' },
                    { degree: 'iii (Menor)', chord: currentInfo.chords.iii, solfa: currentInfo.chordsSolfa.iii, role: 'Emotivo', color: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900' },
                    { degree: 'IV (Subdom.)', chord: currentInfo.chords.IV, solfa: currentInfo.chordsSolfa.IV, role: 'Apertura', color: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
                    { degree: 'V (Dominante)', chord: currentInfo.chords.V, solfa: currentInfo.chordsSolfa.V, role: 'Tensión / Fuerza', color: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
                    { degree: 'vi (Rel. Menor)', chord: currentInfo.chords.vi, solfa: currentInfo.chordsSolfa.vi, role: 'Adoración íntima', color: 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400' },
                    { degree: 'vii° (Dism.)', chord: currentInfo.chords.viiDim, solfa: currentInfo.chordsSolfa.viiDim, role: 'Tensión máxima', color: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900' },
                  ].map((d, dIdx) => (
                    <button
                      key={dIdx}
                      onClick={() => setSelectedChordForDiagram(d.chord)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition hover:scale-105 ${d.color}`}
                    >
                      <span className="text-[10px] font-bold opacity-75">{d.degree}</span>
                      <span className="text-base font-mono font-black my-0.5">
                        {notation === 'solfa' ? d.solfa : d.chord}
                      </span>
                      <span className="text-[9px] opacity-70 truncate max-w-full">{d.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progresiones recomendadas para oraciones y cánticos espontáneos */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Progresiones para Acompañamiento Espontáneo en {notation === 'solfa' ? currentInfo.solfa : currentInfo.key}
                  </h4>
                </div>

                <div className="space-y-3">
                  {currentInfo.progressions.map((prog, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{prog.name}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {prog.degrees}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                        {prog.description}
                      </p>

                      {/* Botones de acordes en orden de la progresión */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {(notation === 'solfa' ? prog.chordsSolfa : prog.chordsAmerican).map((ch, chIdx) => (
                          <React.Fragment key={chIdx}>
                            <button
                              onClick={() => setSelectedChordForDiagram(ch.split('/')[0])}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono font-black text-xs hover:bg-amber-500 hover:text-slate-950 transition"
                              title="Ver diagrama de digitación"
                            >
                              {ch}
                            </button>
                            {chIdx < (prog.chordsAmerican.length - 1) && (
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 border-t border-slate-200 dark:border-slate-800/60 pt-1.5 mt-1.5">
                        <p>🎹 <span className="font-semibold text-slate-700 dark:text-slate-300">Teclado/Pad:</span> {prog.pedalNotes}</p>
                        <p>🎸 <span className="font-semibold text-slate-700 dark:text-slate-300">Guitarra:</span> {prog.guitarTip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal de Diagramas de Acordes */}
        <ChordDiagramModal
          chord={selectedChordForDiagram}
          onClose={() => setSelectedChordForDiagram(null)}
        />
      </div>
    </div>
  );
}
