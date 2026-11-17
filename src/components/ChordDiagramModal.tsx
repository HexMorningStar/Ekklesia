'use client';

import React from 'react';
import { X, Guitar, Music } from 'lucide-react';
import { CHORD_DIAGRAMS, normalizeRoot, NOTE_TO_SOLFA } from '@/lib/chord-engine';

interface ChordDiagramModalProps {
  chord: string | null;
  onClose: () => void;
}

export default function ChordDiagramModal({ chord, onClose }: ChordDiagramModalProps) {
  if (!chord) return null;

  // Buscar diagrama
  const cleanChord = chord.trim();
  const diagram = CHORD_DIAGRAMS[cleanChord] || CHORD_DIAGRAMS[normalizeRoot(cleanChord)];

  const pianoKeys = [
    { note: 'C', isBlack: false },
    { note: 'C#', isBlack: true },
    { note: 'D', isBlack: false },
    { note: 'D#', isBlack: true },
    { note: 'E', isBlack: false },
    { note: 'F', isBlack: false },
    { note: 'F#', isBlack: true },
    { note: 'G', isBlack: false },
    { note: 'G#', isBlack: true },
    { note: 'A', isBlack: false },
    { note: 'A#', isBlack: true },
    { note: 'B', isBlack: false },
  ];

  const activeNotes = diagram?.piano?.notes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-800 dark:text-slate-100 transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xl font-bold text-amber-700 dark:text-amber-400">
              {chord}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({NOTE_TO_SOLFA[normalizeRoot(chord)] || chord} en Solfa)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {diagram?.name || 'Digitación e intervalos armónicos para el ministerio musical'}
          </p>
        </div>

        {/* Tab Guitarra */}
        <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Guitar className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <span>Guitarra Acústica / Eléctrica</span>
          </div>

          {diagram?.guitar ? (
            <div className="flex flex-col items-center">
              {/* Cuerdas: E A D G B E */}
              <div className="flex gap-4 text-xs font-mono text-slate-400 mb-1">
                {['6(E)', '5(A)', '4(D)', '3(G)', '2(B)', '1(E)'].map((s, idx) => (
                  <span key={idx} className="w-4 text-center">
                    {diagram.guitar.frets[idx] === -1 ? 'X' : diagram.guitar.frets[idx] === 0 ? 'O' : ''}
                  </span>
                ))}
              </div>

              {/* Diapasón */}
              <div className="relative border-t-4 border-amber-600 bg-slate-900/80 px-2 py-3 rounded-md">
                {[1, 2, 3, 4].map((fret) => (
                  <div
                    key={fret}
                    className="relative flex gap-4 border-b border-slate-700 py-1.5"
                  >
                    <span className="absolute -left-5 text-[10px] text-slate-500">{fret}</span>
                    {diagram.guitar.frets.map((fretPos, sIdx) => {
                      const isPlayed = fretPos === fret;
                      return (
                        <div
                          key={sIdx}
                          className="relative flex h-5 w-4 items-center justify-center"
                        >
                          {/* Cuerda vertical */}
                          <div className="absolute h-full w-[1.5px] bg-slate-600" />
                          {/* Punto de dedo */}
                          {isPlayed && (
                            <div className="relative z-10 h-3.5 w-3.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-500 py-3">
              Diagrama básico no registrado. Posición estándar según tonalidad raíz.
            </p>
          )}
        </div>

        {/* Tab Teclado / Piano */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Music className="h-4 w-4 text-blue-400" />
            <span>Piano / Teclado (Notas activas)</span>
          </div>

          <div className="relative flex justify-center py-2">
            <div className="relative flex h-20 border border-slate-800 rounded bg-white overflow-hidden shadow-inner">
              {pianoKeys.map((k, i) => {
                const isSelected = activeNotes.some(n => normalizeRoot(n) === normalizeRoot(k.note));
                if (k.isBlack) return null;

                return (
                  <div
                    key={i}
                    className={`relative w-7 h-full border-r border-slate-300 flex items-end justify-center pb-1 text-[10px] font-bold ${
                      isSelected ? 'bg-blue-200 text-blue-900 font-extrabold' : 'bg-white text-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}
                    {k.note}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 text-center text-xs text-slate-400">
            Notas del acorde: <span className="font-mono text-amber-300 font-medium">{activeNotes.join(' - ') || 'Tónica, Tercera, Quinta'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
