'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Music, 
  BookOpen, 
  Check, 
  Search, 
  Clock, 
  Key, 
  Save, 
  AlertCircle,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { NotationType, parseSongContent } from '@/lib/chord-engine';
import { GeminiSongVersion } from '@/lib/gemini';

interface GeminiSongSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongSaved: (newSong: any) => void;
}

export default function GeminiSongSearchModal({
  isOpen,
  onClose,
  onSongSaved
}: GeminiSongSearchModalProps) {
  const [query, setQuery] = useState('');
  const [requestedKey, setRequestedKey] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelPreference, setModelPreference] = useState<'gemini-3.8-flash' | 'gemini-3.5-flash-lite' | 'lacuerda'>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Múltiples versiones devueltas por Gemini y LaCuerda
  const [versions, setVersions] = useState<GeminiSongVersion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [previewNotation, setPreviewNotation] = useState<NotationType>('american');
  const [isSaving, setIsSaving] = useState(false);

  // Cargar clave de API guardada localmente si existe
  React.useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setVersions([]);
    setSelectedIndex(0);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          apiKey: apiKey.trim() || undefined,
          requestedKey: requestedKey || undefined,
          modelPreference
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'No se pudo obtener la canción');
      }

      const returnedVersions: GeminiSongVersion[] = data.versions || (data.song ? [data.song] : []);
      if (returnedVersions.length === 0) {
        throw new Error('No se encontraron versiones para esta búsqueda.');
      }

      setVersions(returnedVersions);
      setSelectedIndex(0);

      if (apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
      }
    } catch (err: any) {
      setError(err.message || 'Error conectando con Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  const currentVersion: GeminiSongVersion | undefined = versions[selectedIndex];

  const handleSaveToCatalog = async () => {
    if (!currentVersion) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentVersion.title,
          artistName: currentVersion.artist,
          originalKey: currentVersion.originalKey,
          tempo: currentVersion.tempo,
          timeSignature: currentVersion.timeSignature,
          content: currentVersion.content,
          scriptureReference: currentVersion.scriptureReference,
          notes: currentVersion.notes
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al guardar');
      }

      onSongSaved({
        ...currentVersion,
        id: data.songId,
        artist_name: currentVersion.artist,
        original_key: currentVersion.originalKey,
        time_signature: currentVersion.timeSignature,
        scripture_reference: currentVersion.scriptureReference
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la canción');
    } finally {
      setIsSaving(false);
    }
  };

  const parsedPreview = currentVersion
    ? parseSongContent(currentVersion.content || '', 0, previewNotation, currentVersion.originalKey || 'G')
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Buscador Inteligente con Gemini AI</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detecta y compara diferentes versiones, arreglos en vivo y tonalidades
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario de búsqueda */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-5 space-y-3">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex flex-wrap md:flex-nowrap gap-2">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej: 'Su nombre es Cristo', 'Miel San Marcos 25 Años', estrofas o enlace de LaCuerda..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <select
                value={modelPreference}
                onChange={(e: any) => setModelPreference(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:border-amber-500 focus:outline-none font-medium"
              >
                <option value="gemini-3.8-flash">🤖 Gemini 3.8 Flash (Alta Precisión)</option>
                <option value="lacuerda">🎸 LaCuerda.net Directo</option>
                <option value="gemini-3.5-flash-lite">⚡ Gemini 3.5 Flash Lite</option>
              </select>

              <select
                value={requestedKey}
                onChange={(e) => setRequestedKey(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="">Tono Original</option>
                {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((k) => (
                  <option key={k} value={k}>Tono {k}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-5 py-2.5 text-sm font-bold text-slate-950 transition shadow-lg shadow-amber-500/20 shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </div>

            {/* Estado del Motor Gemini 3.8 */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Motor Inteligente: Google Gemini 3.8 Flash (Clave Oficial Activa)
              </span>
            </div>
          </form>

          {error && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shrink-0 transition"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Área de resultados con Selector de Versiones */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mb-3" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Buscando versiones con Gemini AI...</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                Examinando diferentes grabaciones, álbumes, tonos y arreglos para darte opciones exactas.
              </p>
            </div>
          ) : versions.length > 0 ? (
            <div className="space-y-4">
              {/* Tarjetas selectoras de las versiones encontradas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-amber-500" />
                    <span>Versiones Encontradas ({versions.length}): Selecciona la que buscas</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {versions.map((ver, idx) => {
                    const isCurrent = idx === selectedIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/30'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {ver.title}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                              {ver.originalKey}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1">
                            {ver.source === 'lacuerda' ? (
                              <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                                🎸 LaCuerda.net
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 shrink-0">
                                🤖 Gemini 3.8
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                              {ver.versionTitle}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {ver.artist} • {ver.tempo} BPM
                          </p>

                          {ver.previewSnippet && (
                            <p className="text-[10px] italic text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 bg-slate-200/50 dark:bg-slate-900 p-1.5 rounded">
                              "{ver.previewSnippet}"
                            </p>
                          )}
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
                          <span className={isCurrent ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-400'}>
                            {isCurrent ? '✓ Seleccionada' : 'Clic para ver'}
                          </span>
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detalle y previsualización de la versión seleccionada */}
              {currentVersion && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-4 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentVersion.title}</h3>
                        {currentVersion.source === 'lacuerda' ? (
                          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            🎸 LaCuerda.net Oficial
                          </span>
                        ) : (
                          <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            🤖 Gemini 3.8 Flash AI
                          </span>
                        )}
                        <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          {currentVersion.versionTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Por <span className="font-semibold text-slate-700 dark:text-slate-300">{currentVersion.artist}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                        Tono: {currentVersion.originalKey}
                      </span>
                      <span className="rounded-md bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        {currentVersion.tempo} BPM
                      </span>
                      <span className="rounded-md bg-slate-200 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {currentVersion.timeSignature}
                      </span>
                    </div>
                  </div>

                  {currentVersion.scriptureReference && (
                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <BookOpen className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Fundamento Bíblico:</strong> {currentVersion.scriptureReference}</span>
                    </div>
                  )}

                  {currentVersion.notes && (
                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Music className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong>Notas de Arreglo:</strong> {currentVersion.notes}</span>
                    </div>
                  )}

                  {/* Acciones: Notación Cifrado vs Solfa y Botón Guardar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 text-xs">
                      <button
                        onClick={() => setPreviewNotation('american')}
                        className={`rounded px-3 py-1 font-semibold transition ${
                          previewNotation === 'american' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Ver Cifrado (C, D)
                      </button>
                      <button
                        onClick={() => setPreviewNotation('solfa')}
                        className={`rounded px-3 py-1 font-semibold transition ${
                          previewNotation === 'solfa' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Ver Solfa (Do, Re)
                      </button>
                    </div>

                    <button
                      onClick={handleSaveToCatalog}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-emerald-600/20"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Guardando...' : `Guardar "${currentVersion.versionTitle}"`}</span>
                    </button>
                  </div>

                  {/* Acordes de la versión seleccionada */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 font-mono text-sm leading-relaxed space-y-3 shadow-inner">
                    {parsedPreview.map((line, idx) => {
                      if (line.type === 'empty') return <div key={idx} className="h-3" />;
                      if (line.type === 'section') {
                        return (
                          <div key={idx} className="pt-2">
                            <span className="rounded bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                              {line.sectionName}
                            </span>
                          </div>
                        );
                      }
                      if (line.type === 'lyrics-only') {
                        return <div key={idx} className="text-slate-800 dark:text-slate-200 font-sans">{line.rawText}</div>;
                      }
                      if (line.type === 'chords-and-lyrics' && line.items) {
                        return (
                          <div key={idx} className="flex flex-wrap items-end gap-x-1 gap-y-2">
                            {line.items.map((it, i) => (
                              <div key={i} className="inline-flex flex-col">
                                {it.chord ? (
                                  <span className="font-bold text-amber-600 dark:text-amber-400 text-xs font-mono -mb-1">
                                    {it.chord}
                                  </span>
                                ) : (
                                  <span className="h-4" />
                                )}
                                <span className="text-slate-900 dark:text-slate-100 font-sans whitespace-pre text-xs md:text-sm">
                                  {it.lyric || ' '}
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
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              Escribe el nombre de una alabanza o himno cristiano para buscar y comparar diferentes versiones grabadas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
