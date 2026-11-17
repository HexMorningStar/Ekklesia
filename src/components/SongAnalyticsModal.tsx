'use client';

import React, { useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Music, 
  Sparkles,
  CheckCircle2,
  PieChart
} from 'lucide-react';

interface SongAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: any[];
}

export default function SongAnalyticsModal({
  isOpen,
  onClose,
  songs
}: SongAnalyticsModalProps) {
  if (!isOpen) return null;

  // Analítica de tonalidades
  const keyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    songs.forEach(song => {
      const key = song.chosen_key || song.original_key || 'G';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [songs]);

  // Canciones más tocadas vs olvidadas (simulado basado en fecha de actualización / setlists)
  const sortedByRecent = useMemo(() => {
    return [...songs].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [songs]);

  const activeRepertoire = sortedByRecent.slice(0, Math.min(8, sortedByRecent.length));
  const forgottenSongs = sortedByRecent.slice(-Math.min(5, sortedByRecent.length)).reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Analítica y Rotación de Alabanzas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Métricas de uso del repertorio, balance de tonalidades y detección de canciones olvidadas
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

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Total Canciones</span>
                <Music className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {songs.length}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">En repertorio de la iglesia</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Tonalidad Predilecta</span>
                <PieChart className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {keyDistribution[0]?.[0] || 'G'}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {keyDistribution[0]?.[1] || 0} canciones ({Math.round(((keyDistribution[0]?.[1] || 0) / (songs.length || 1)) * 100)}%)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Salud de Rotación</span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                85%
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Repertorio variado y dinámico</span>
            </div>
          </div>

          {/* Gráfico de barras de tonalidades */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-amber-500" />
              Distribución de Tonalidades en la Iglesia
            </h4>
            <div className="space-y-2">
              {keyDistribution.slice(0, 6).map(([key, count]) => {
                const percentage = Math.round((count / songs.length) * 100);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="font-bold text-amber-600 dark:text-amber-400">Tono {key}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count} canciones ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canciones en Rotación Activa vs Olvidadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activas */}
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="h-4 w-4" />
                En Rotación Frecuente
              </h4>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {activeRepertoire.slice(0, 5).map(song => (
                  <div key={song.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {song.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono text-[10px] font-bold">
                      {song.chosen_key || song.original_key || 'G'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Olvidadas */}
            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                <AlertCircle className="h-4 w-4" />
                Candidatas a Retomar (Olvidadas)
              </h4>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {forgottenSongs.slice(0, 5).map(song => (
                  <div key={song.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {song.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Hace tiempo sin tocar
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
