'use client';

import React from 'react';
import { X, Sparkles, Check, Info } from 'lucide-react';
import { getCapoOptions, CapoOption, NOTE_TO_SOLFA } from '@/lib/chord-engine';

interface CapoCalculatorModalProps {
  isOpen: boolean;
  concertKey: string;
  onClose: () => void;
  onApplyCapo?: (capoFret: number, shapeKey: string) => void;
}

export default function CapoCalculatorModal({
  isOpen,
  concertKey,
  onClose,
  onApplyCapo
}: CapoCalculatorModalProps) {
  if (!isOpen) return null;

  const capoOptions: CapoOption[] = getCapoOptions(concertKey || 'G');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                🎸
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Calculadora de Cejilla / Capo</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tono de concierto: <span className="font-bold font-mono text-amber-600 dark:text-amber-400">{concertKey}</span> ({NOTE_TO_SOLFA[concertKey] || concertKey})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Toca con acordes abiertos resonantes en la guitarra acústica sin hacer cejillas forzadas:
          </p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {capoOptions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Esta tonalidad ya utiliza posiciones abiertas ideales (G, C, D, E o A). No es indispensable usar cejilla.
              </div>
            ) : (
              capoOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                    opt.isRecommended
                      ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white shrink-0">
                      <span className="text-[10px] text-slate-500 uppercase">Traste</span>
                      <span className="text-sm text-amber-600 dark:text-amber-400 -mt-1">{opt.capoFret}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Forma de {opt.shapeKey}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({opt.shapeSolfa})
                        </span>
                        {opt.isRecommended && (
                          <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            <Sparkles className="h-3 w-3" /> Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Dificultad: <strong className="capitalize">{opt.difficulty}</strong> • Suena en {concertKey}
                      </p>
                    </div>
                  </div>

                  {onApplyCapo && (
                    <button
                      onClick={() => {
                        onApplyCapo(opt.capoFret, opt.shapeKey);
                        onClose();
                      }}
                      className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition shadow"
                    >
                      Aplicar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <span>
            Al colocar el capo en el traste indicado y tocar los acordes con la forma sugerida, tu guitarra sonará exactamente en el tono de concierto de la banda.
          </span>
        </div>
      </div>
    </div>
  );
}
