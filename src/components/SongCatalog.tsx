'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Music, 
  User, 
  Plus, 
  BookOpen, 
  Clock, 
  FileText, 
  Trash2, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SongCatalogProps {
  songs: any[];
  artists: any[];
  selectedSong: any | null;
  onSelectSong: (song: any) => void;
  onOpenCreateSong: () => void;
  onOpenGeminiSearch: () => void;
  onDeleteSong: (id: number) => void;
}

export default function SongCatalog({
  songs,
  artists,
  selectedSong,
  onSelectSong,
  onOpenCreateSong,
  onOpenGeminiSearch,
  onDeleteSong
}: SongCatalogProps) {
  const [selectedArtistId, setSelectedArtistId] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtrado de canciones
  const filteredSongs = songs.filter((s) => {
    const matchesArtist = selectedArtistId === 'all' || s.artist_id === selectedArtistId;
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.scripture_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArtist && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row h-full gap-3 sm:gap-4 text-slate-800 dark:text-slate-100">
      {/* Carrusel de chips de artistas exclusivo para Móvil (< 1024px) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 shrink-0">
        <button
          onClick={() => setSelectedArtistId('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
            selectedArtistId === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Todos ({songs.length})</span>
        </button>
        {artists.map((artist) => {
          const isSelected = selectedArtistId === artist.id;
          return (
            <button
              key={artist.id}
              onClick={() => setSelectedArtistId(artist.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{artist.name}</span>
              <span className="ml-1 opacity-70 text-[10px]">({artist.song_count || 0})</span>
            </button>
          );
        })}
      </div>

      {/* Panel Izquierdo: Artistas / Ministerios (Exclusivo Escritorio >= 1024px) */}
      <div className="hidden lg:flex w-72 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-xl overflow-hidden shrink-0 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Artistas y Ministerios</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {artists.length} registrados
          </span>
        </div>

        {/* Lista de Artistas */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => setSelectedArtistId('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition text-left ${
              selectedArtistId === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Todos los Artistas</span>
            </div>
            <span className={`text-[10px] rounded px-1.5 py-0.5 ${selectedArtistId === 'all' ? 'bg-amber-600/40 text-slate-950 font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
              {songs.length}
            </span>
          </button>

          {artists.map((artist) => {
            const isSelected = selectedArtistId === artist.id;
            return (
              <button
                key={artist.id}
                onClick={() => setSelectedArtistId(artist.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="font-semibold block truncate">{artist.name}</span>
                </div>
                <span className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                  {artist.song_count || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel: Lista de Canciones */}
      <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg dark:shadow-xl overflow-hidden transition-colors">
        {/* Barra de Búsqueda y Filtros */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, artista o versículo bíblico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGeminiSearch}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-2 text-xs font-bold text-amber-300 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Buscar con IA</span>
            </button>
            <button
              onClick={onOpenCreateSong}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 transition shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nueva Canción</span>
            </button>
          </div>
        </div>

        {/* Lista de Canciones en Tarjetas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredSongs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Music className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No se encontraron canciones.</p>
              <p className="mt-1 text-slate-500">
                Usa el botón de búsqueda con Gemini para importar cualquier tema al instante.
              </p>
            </div>
          ) : (
            filteredSongs.map((song) => {
              const isSelected = selectedSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-bold font-mono text-sm shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                      {song.original_key}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{song.title}</h4>
                        {song.sheet_music_url && (
                          <span className="flex items-center gap-0.5 rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                            <FileText className="h-2.5 w-2.5" /> Partitura
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {song.artist_name || 'Artista'}
                        {song.scripture_reference && (
                          <span className="ml-2 text-slate-400 dark:text-slate-500 hidden sm:inline">
                            • 📖 {song.scripture_reference}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 hidden sm:inline">
                      {song.tempo || 72} BPM
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 hidden sm:inline">
                      {song.time_signature || '4/4'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar la canción "${song.title}"?`)) {
                          onDeleteSong(song.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded transition"
                      title="Eliminar canción"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
