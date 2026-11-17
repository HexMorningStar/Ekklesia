'use client';

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Download, 
  Check, 
  BookOpen, 
  Sparkles,
  Columns
} from 'lucide-react';
import { parseSongContent, NotationType } from '@/lib/chord-engine';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: any[];
  title?: string;
}

export default function PdfExportModal({
  isOpen,
  onClose,
  songs,
  title = 'Repertorio Ministerial Ekklesia'
}: PdfExportModalProps) {
  const [columns, setColumns] = useState<1 | 2>(2);
  const [includeChords, setIncludeChords] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(12);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Cabecera (Oculta al imprimir) */}
        <div className="print:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Exportador a PDF / Cancionero de Atril
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formato profesional en 2 columnas para carpetas físicas de ensayo y músicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de opciones de impresión (Oculta al imprimir) */}
        <div className="print:hidden border-b border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-100 dark:bg-slate-950/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeChords}
                onChange={(e) => setIncludeChords(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Incluir Acordes</span>
            </label>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
              <Columns className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value) as 1 | 2)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-white dark:bg-slate-900">1 Columna</option>
                <option value={2} className="bg-white dark:bg-slate-900">2 Columnas (Atril)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
              <span className="text-slate-400">Letra:</span>
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                className="px-1 text-slate-600 dark:text-slate-300 font-bold"
              >
                -
              </button>
              <span className="font-mono">{fontSize}pt</span>
              <button
                onClick={() => setFontSize(Math.min(18, fontSize + 1))}
                className="px-1 text-slate-600 dark:text-slate-300 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 font-bold text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>

        {/* Vista previa imprimible */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 font-sans print:p-0 print:bg-white print:text-black">
          <div className="max-w-3xl mx-auto space-y-8 print:space-y-6">
            {songs.map((song, sIdx) => {
              const parsed = parseSongContent(song.content || '', 0, 'american', song.chosen_key || song.original_key || 'G');

              return (
                <div 
                  key={song.id || sIdx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/60 shadow-sm print:border-none print:shadow-none print:p-0 print:break-after-page"
                >
                  {/* Encabezado de la canción */}
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white print:text-black">
                        {sIdx + 1}. {song.title}
                      </h4>
                      <p className="text-xs text-slate-500 print:text-gray-600">
                        {song.artist_name} • Compás: {song.time_signature || '4/4'} • BPM: {song.tempo || 72}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-black text-sm print:border print:border-black print:text-black">
                        Tono: {song.chosen_key || song.original_key || 'G'}
                      </span>
                      {song.scripture_reference && (
                        <p className="text-[10px] text-slate-400 print:text-gray-500 mt-1">
                          📖 {song.scripture_reference}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo de acordes y letra en 1 o 2 columnas */}
                  <div 
                    className={columns === 2 ? 'grid grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}
                    style={{ fontSize: `${fontSize}pt` }}
                  >
                    {parsed.map((line, lIdx) => {
                      if (line.type === 'empty') return <div key={lIdx} className="h-3" />;

                      if (line.type === 'section') {
                        return (
                          <div key={lIdx} className="pt-2 pb-1 font-bold text-amber-600 dark:text-amber-400 print:text-black uppercase text-[11px] tracking-wider">
                            {line.sectionName}
                          </div>
                        );
                      }

                      if (line.type === 'lyrics-only') {
                        return (
                          <div key={lIdx} className="text-slate-800 dark:text-slate-200 print:text-black font-sans leading-relaxed">
                            {line.rawText}
                          </div>
                        );
                      }

                      if (line.type === 'chords-and-lyrics' && line.items) {
                        return (
                          <div key={lIdx} className="flex flex-wrap items-end gap-x-1.5 gap-y-1 py-0.5">
                            {line.items.map((item, iIdx) => (
                              <div key={iIdx} className="inline-flex flex-col">
                                {includeChords && item.chord && (
                                  <span className="font-mono font-black text-amber-600 dark:text-amber-400 print:text-black text-[12px] leading-tight">
                                    {item.chord}
                                  </span>
                                )}
                                <span className="text-slate-800 dark:text-slate-100 print:text-black font-sans whitespace-pre">
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
