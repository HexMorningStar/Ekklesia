'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Play, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Music, 
  Clock, 
  Edit3, 
  Check, 
  Layers,
  Search,
  Maximize2,
  X,
  Users,
  Tv,
  Sparkles,
  Info,
  ArrowLeft
} from 'lucide-react';
import { CHROMATIC_SHARPS, NOTE_TO_SOLFA } from '@/lib/chord-engine';
import { analyzeHarmonicTransition } from '@/lib/harmonic-transitions';
import TeamRosterModal from './TeamRosterModal';
import ProjectionModal from './ProjectionModal';
import SongTransitionModal from './SongTransitionModal';
import { fetchSetlists, fetchSetlistById, saveSetlist, deleteSetlist } from '@/lib/data-repository';

interface SetlistManagerProps {
  onLaunchLiveStage: (setlistSongs: any[], setlistTitle: string) => void;
  availableSongs: any[];
}

export default function SetlistManager({
  onLaunchLiveStage,
  availableSongs
}: SetlistManagerProps) {
  const [setlists, setSetlists] = useState<any[]>([]);
  const [selectedSetlistId, setSelectedSetlistId] = useState<number | null>(null);
  const [activeSetlistDetail, setActiveSetlistDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modales adicionales: Equipo & WhatsApp, Proyección de Setlist y Asistente de Transiciones
  const [isRosterModalOpen, setIsRosterModalOpen] = useState<boolean>(false);
  const [isProjectionModalOpen, setIsProjectionModalOpen] = useState<boolean>(false);
  const [expandedTransitionIdx, setExpandedTransitionIdx] = useState<number | null>(null);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState<boolean>(false);
  const [transitionSourceSong, setTransitionSourceSong] = useState<any | null>(null);
  const [transitionTargetSong, setTransitionTargetSong] = useState<any | null>(null);

  // Modal para crear nuevo setlist
  const [isCreatingSetlist, setIsCreatingSetlist] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newEventDate, setNewEventDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newServiceType, setNewServiceType] = useState<string>('Culto General');

  // Modal para agregar canciones al setlist activo
  const [isAddingSongModal, setIsAddingSongModal] = useState<boolean>(false);
  const [songSearchFilter, setSongSearchFilter] = useState<string>('');

  // Cargar lista de setlists
  const loadSetlists = async () => {
    setIsLoading(true);
    try {
      const list = await fetchSetlists();
      setSetlists(list || []);
      if (list && list.length > 0 && !selectedSetlistId) {
        setSelectedSetlistId(list[0].id);
      }
    } catch (e) {
      console.error('Error cargando setlists:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSetlists();
  }, []);

  // Cargar detalle del setlist seleccionado
  useEffect(() => {
    if (!selectedSetlistId) return;
    const idToFetch = selectedSetlistId;

    async function loadSetlistDetail() {
      try {
        const detail = await fetchSetlistById(idToFetch);
        if (detail) {
          setActiveSetlistDetail(detail);
        }
      } catch (e) {
        console.error('Error cargando detalle de setlist:', e);
      }
    }

    loadSetlistDetail();
  }, [selectedSetlistId]);

  // Crear setlist
  const handleCreateSetlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await saveSetlist({
        title: newTitle.trim(),
        description: newDescription.trim(),
        event_date: newEventDate,
        service_type: newServiceType,
        items: []
      });

      setIsCreatingSetlist(false);
      setNewTitle('');
      setNewDescription('');
      await loadSetlists();
      if (created?.id) {
        setSelectedSetlistId(created.id);
      }
    } catch (e) {
      console.error('Error creando setlist:', e);
    }
  };

  const persistItems = async (items: any[]) => {
    if (!activeSetlistDetail || !selectedSetlistId) return;
    const updated = { ...activeSetlistDetail, items };
    setActiveSetlistDetail(updated);
    try {
      await saveSetlist(updated);
    } catch (e) {
      console.error('Error guardando items de setlist:', e);
    }
  };

  // Reordenar canciones en el setlist
  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    if (!activeSetlistDetail?.items) return;
    const items = [...activeSetlistDetail.items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    await persistItems(items);
  };

  // Cambiar tono elegido para la canción en este evento
  const handleChangeChosenKey = async (itemIndex: number, newKey: string) => {
    if (!activeSetlistDetail?.items) return;
    const items = [...activeSetlistDetail.items];
    items[itemIndex].chosen_key = newKey;

    await persistItems(items);
  };

  // Cambiar notas de ensayo para la canción
  const handleUpdateNotes = async (itemIndex: number, notes: string) => {
    if (!activeSetlistDetail?.items) return;
    const items = [...activeSetlistDetail.items];
    items[itemIndex].performance_notes = notes;

    await persistItems(items);
  };

  // Eliminar canción del setlist
  const handleRemoveItem = async (itemIndex: number) => {
    if (!activeSetlistDetail?.items) return;
    const items = activeSetlistDetail.items.filter((_: any, idx: number) => idx !== itemIndex);

    await persistItems(items);
    loadSetlists();
  };

  // Agregar canción al setlist
  const handleAddSongToSetlist = async (song: any) => {
    if (!activeSetlistDetail) return;
    const items = [...(activeSetlistDetail.items || [])];

    const newItem = {
      song_id: song.id,
      title: song.title,
      artist_name: song.artist_name,
      chosen_key: song.original_key || 'G',
      original_key: song.original_key || 'G',
      performance_notes: song.notes || '',
      item_bpm: song.tempo || 72,
      tempo: song.tempo || 72,
      time_signature: song.time_signature || '4/4',
      content: song.content
    };

    items.push(newItem);
    setIsAddingSongModal(false);
    await persistItems(items);
    loadSetlists();
  };

  // Eliminar setlist completo
  const handleDeleteSetlist = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este setlist de ensayo?')) return;
    try {
      await deleteSetlist(id);
      setSelectedSetlistId(null);
      setActiveSetlistDetail(null);
      await loadSetlists();
    } catch (e) {
      console.error('Error eliminando setlist:', e);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-3 sm:gap-4 text-slate-800 dark:text-slate-100">
      {/* Panel Izquierdo: Lista de Setlists / Ensayos (Se oculta en móvil si hay un setlist seleccionado) */}
      <div className={`w-full lg:w-80 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-xl overflow-hidden shrink-0 transition-colors ${selectedSetlistId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">Eventos y Ensayos</h2>
          </div>
          <button
            onClick={() => setIsCreatingSetlist(true)}
            className="flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 px-2.5 py-1 text-xs font-bold text-slate-950 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo</span>
          </button>
        </div>

        {/* Modal de creación de Setlist */}
        {isCreatingSetlist && (
          <form onSubmit={handleCreateSetlist} className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Crear Setlist / Ensayo</h3>
            <input
              type="text"
              placeholder="Ej: Culto Dominical, Ensayo Jueves..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <select
                value={newServiceType}
                onChange={(e) => setNewServiceType(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Culto General">Culto General</option>
                <option value="Jóvenes">Jóvenes</option>
                <option value="Ensayo">Ensayo</option>
                <option value="Vigilia">Vigilia</option>
                <option value="Especial">Especial</option>
              </select>
            </div>
            <textarea
              placeholder="Descripción o propósito del ensayo..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 h-16"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingSetlist(false)}
                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-amber-500 font-bold text-slate-950"
              >
                Guardar
              </button>
            </div>
          </form>
        )}

        {/* Lista con scroll de setlists */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {setlists.length === 0 && !isCreatingSetlist && (
            <div className="p-8 text-center text-xs text-slate-400">
              <Calendar className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No hay repertorios creados.</p>
              <p className="mt-1 text-slate-500 text-[11px]">
                Pulsa &quot;+ Nuevo Setlist&quot; para programar el culto o ensayo.
              </p>
            </div>
          )}
          {setlists.map((s) => {
            const isSelected = selectedSetlistId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSetlistId(s.id)}
                className={`group w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 text-slate-950 dark:text-white shadow-sm ring-1 ring-amber-500/20'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">{s.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{s.event_date}</span>
                    <span>•</span>
                    <span className="text-amber-700 dark:text-amber-400 font-medium">{s.service_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                    {s.songs_count || 0} temas
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSetlist(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition"
                    title="Eliminar setlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Central: Detalle de Canciones del Setlist */}
      <div className={`flex-1 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg dark:shadow-xl overflow-hidden transition-colors ${!selectedSetlistId ? 'hidden lg:flex' : 'flex'}`}>
        {activeSetlistDetail ? (
          <>
            {/* Cabecera del setlist */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div>
                {/* Botón Volver a eventos en móvil */}
                <button
                  onClick={() => setSelectedSetlistId(null)}
                  className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver a eventos</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {activeSetlistDetail.title}
                  </h2>
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    {activeSetlistDetail.service_type}
                  </span>
                  <span className="rounded-md bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300">
                    {activeSetlistDetail.event_date}
                  </span>
                </div>
                {activeSetlistDetail.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeSetlistDetail.description}</p>
                )}
              </div>

              {/* Botones de acción del setlist: Grid 2x2 en móvil, flex en desktop */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsAddingSongModal(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 shadow-sm"
                >
                  <Plus className="h-4 w-4 text-amber-500" />
                  <span>+ Canción</span>
                </button>

                {activeSetlistDetail.items?.length > 0 && (
                  <>
                    <button
                      onClick={() => setIsRosterModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 shadow-sm"
                      title="Planificar equipo de alabanza y generar setlist para WhatsApp"
                    >
                      <Users className="h-4 w-4 text-emerald-500" />
                      <span>Equipo / WA</span>
                    </button>

                    <button
                      onClick={() => setIsProjectionModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 shadow-sm"
                      title="Proyectar todas las canciones del setlist en pantalla de congregación"
                    >
                      <Tv className="h-4 w-4 text-blue-500" />
                      <span>Proyectar</span>
                    </button>

                    <button
                      onClick={() => onLaunchLiveStage(activeSetlistDetail.items, activeSetlistDetail.title)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 transition shadow-md shadow-amber-500/20 active:scale-95"
                      title="Iniciar ensayo con canciones en orden, metrónomo y auto-scroll"
                    >
                      <Maximize2 className="h-4 w-4" />
                      <span>Modo Atril</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Lista ordenada de canciones con padding adaptado a móvil */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3">
              {(!activeSetlistDetail.items || activeSetlistDetail.items.length === 0) ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center text-xs text-slate-400">
                  <Music className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Este setlist aún no tiene canciones.</p>
                  <p className="mt-1 text-slate-500">Haz clic en "+ Canción" para seleccionar temas del cancionero.</p>
                </div>
              ) : (
                activeSetlistDetail.items.map((item: any, idx: number) => {
                  const nextItem = idx < activeSetlistDetail.items.length - 1 ? activeSetlistDetail.items[idx + 1] : null;
                  const fromKey = item.chosen_key || item.original_key || 'G';
                  const toKey = nextItem ? (nextItem.chosen_key || nextItem.original_key || 'G') : null;
                  const transition = nextItem && toKey ? analyzeHarmonicTransition(fromKey, toKey) : null;
                  const isTransitionExpanded = expandedTransitionIdx === idx;

                  return (
                    <React.Fragment key={idx}>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-4 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm">
                        {/* ========================================================= */}
                        {/* 1. MÓVIL (< 640px) - Diseño Limpio en 2 Niveles           */}
                        {/* ========================================================= */}
                        <div className="sm:hidden space-y-2.5">
                          {/* Nivel 1 Móvil: Número, Título, Artista y Botón Eliminar */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-bold font-mono text-amber-700 dark:text-amber-400 shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                  {item.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {item.artist_name || 'Artista'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition shrink-0"
                              title="Quitar canción"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Nivel 2 Móvil: Tono elegido, BPM y Flechas de Reordenar */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex items-center gap-2">
                              {/* Selector de Tono */}
                              <div className="flex items-center gap-1 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs shadow-sm">
                                <span className="text-slate-500 text-[10px]">Tono:</span>
                                <select
                                  value={item.chosen_key || item.original_key || 'G'}
                                  onChange={(e) => handleChangeChosenKey(idx, e.target.value)}
                                  className="bg-transparent font-bold text-amber-700 dark:text-amber-400 focus:outline-none cursor-pointer text-xs"
                                >
                                  {CHROMATIC_SHARPS.map((k) => (
                                    <option key={k} value={k} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                      {k} ({NOTE_TO_SOLFA[k] || k})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* BPM */}
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800">
                                <Clock className="h-3 w-3 text-blue-500" />
                                <span>{item.item_bpm || item.tempo || 72} BPM</span>
                              </div>
                            </div>

                            {/* Botones de Reordenar */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveItem(idx, 'up')}
                                disabled={idx === 0}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 disabled:opacity-25 text-slate-600 dark:text-slate-300 active:scale-95 shadow-sm"
                                title="Subir"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleMoveItem(idx, 'down')}
                                disabled={idx === activeSetlistDetail.items.length - 1}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 disabled:opacity-25 text-slate-600 dark:text-slate-300 active:scale-95 shadow-sm"
                                title="Bajar"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ========================================================= */}
                        {/* 2. ESCRITORIO (>= 640px) - Diseño Horizontal Amplio      */}
                        {/* ========================================================= */}
                        <div className="hidden sm:flex items-center justify-between gap-3">
                          {/* Número de orden y título */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-bold font-mono text-amber-700 dark:text-amber-400 shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.artist_name}</p>
                            </div>
                          </div>

                          {/* Ajustes de ensayo: Tono elegido, BPM, Controles de posición */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Selector de Tono elegido para el evento */}
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
                              <span className="text-slate-500 dark:text-slate-400">Tono:</span>
                              <select
                                value={item.chosen_key || item.original_key || 'G'}
                                onChange={(e) => handleChangeChosenKey(idx, e.target.value)}
                                className="bg-transparent font-bold text-amber-700 dark:text-amber-400 focus:outline-none cursor-pointer"
                              >
                                {CHROMATIC_SHARPS.map((k) => (
                                  <option key={k} value={k} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                    {k} ({NOTE_TO_SOLFA[k] || k})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* BPM */}
                            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800">
                              <Clock className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                              <span>{item.item_bpm || item.tempo || 72} BPM</span>
                            </div>

                            {/* Reordenar arriba / abajo */}
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => handleMoveItem(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-300"
                                title="Subir de posición"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleMoveItem(idx, 'down')}
                                disabled={idx === activeSetlistDetail.items.length - 1}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-300"
                                title="Bajar de posición"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Eliminar del setlist */}
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition"
                              title="Quitar canción del setlist"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Notas de ensayo editables para los músicos */}
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                          <input
                            type="text"
                            placeholder="Instrucciones para los músicos (ej: Entrada suave piano, coro entra batería full, puente repetir 3x)..."
                            value={item.performance_notes || ''}
                            onChange={(e) => handleUpdateNotes(idx, e.target.value)}
                            className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:text-slate-900 dark:focus:text-white"
                          />
                        </div>
                      </div>

                      {/* Insignia de Transición Armónica Ministerial entre canciones */}
                      {transition && nextItem && (
                        <div className="py-1">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setExpandedTransitionIdx(isTransitionExpanded ? null : idx)}
                              className={`flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border transition shadow-sm hover:scale-[1.01] max-w-full text-center ${transition.badgeColor}`}
                              title="Ver análisis de modulación y acordes puente recomendados"
                            >
                              <Sparkles className="h-3 w-3 shrink-0" />
                              <span>Transición {fromKey} → {toKey}:</span>
                              <span className="font-bold">{transition.badgeLabel}</span>
                              <span className="font-mono text-[10px] opacity-80 hidden xs:inline">
                                {'★'.repeat(transition.compatibilityScore)}{'☆'.repeat(5 - transition.compatibilityScore)}
                              </span>
                              <Info className="h-3 w-3 opacity-70 shrink-0" />
                            </button>
                          </div>

                          {isTransitionExpanded && (
                            <div className="mt-2 mx-auto max-w-lg p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md text-xs space-y-2 animate-in fade-in duration-150">
                              <p className="text-slate-700 dark:text-slate-300">{transition.explanation}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-slate-500 dark:text-slate-400">Acordes puente sugeridos:</span>
                                <div className="flex items-center gap-1">
                                  {transition.transitionChords.map((ch, cIdx) => (
                                    <span key={cIdx} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono font-bold">
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                💡 Consejo para músicos: {transition.musicianTip}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setTransitionSourceSong(item);
                                  setTransitionTargetSong(nextItem);
                                  setIsTransitionModalOpen(true);
                                }}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-sm active:scale-95"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Abrir Asistente Completo de Modulación (Guía x Músico y Audio)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
            Selecciona o crea un setlist para planificar el servicio o ensayo.
          </div>
        )}
      </div>

      {/* Modal para Agregar Canción al Setlist */}
      {isAddingSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative flex flex-col w-full max-w-lg max-h-[80vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-800 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Agregar Canción al Setlist</h3>
              <button
                onClick={() => setIsAddingSongModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                placeholder="Buscar por título o artista..."
                value={songSearchFilter}
                onChange={(e) => setSongSearchFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 py-2">
              {availableSongs
                .filter(s =>
                  s.title.toLowerCase().includes(songSearchFilter.toLowerCase()) ||
                  s.artist_name?.toLowerCase().includes(songSearchFilter.toLowerCase())
                )
                .map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleAddSongToSetlist(song)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-amber-500/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{song.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{song.artist_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 font-bold font-mono">
                        {song.original_key}
                      </span>
                      <Plus className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Planificación de Equipo y Exportación WhatsApp */}
      {activeSetlistDetail && (
        <TeamRosterModal
          isOpen={isRosterModalOpen}
          onClose={() => setIsRosterModalOpen(false)}
          setlist={activeSetlistDetail}
        />
      )}

      {/* Modal de Proyección Congregacional del Setlist (Beamer) */}
      {activeSetlistDetail && (
        <ProjectionModal
          isOpen={isProjectionModalOpen}
          onClose={() => setIsProjectionModalOpen(false)}
          songs={activeSetlistDetail.items || []}
        />
      )}

      {/* Modal Asistente de Modulación y Transiciones */}
      <SongTransitionModal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        songs={availableSongs}
        initialSourceSong={transitionSourceSong}
        initialTargetSong={transitionTargetSong}
      />
    </div>
  );
}
