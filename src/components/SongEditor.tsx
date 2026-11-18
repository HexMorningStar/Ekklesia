'use client';

import React, { useState } from 'react';
import { X, Save, Music, BookOpen, Clock, FileText } from 'lucide-react';
import { CHROMATIC_SHARPS, NOTE_TO_SOLFA } from '@/lib/chord-engine';
import { saveSong } from '@/lib/data-repository';

interface SongEditorProps {
  isOpen: boolean;
  song?: any | null;
  onClose: () => void;
  onSaved: () => void;
  artists: any[];
}

export default function SongEditor({
  isOpen,
  song,
  onClose,
  onSaved,
  artists
}: SongEditorProps) {
  const [title, setTitle] = useState(song?.title || '');
  const [artistName, setArtistName] = useState(song?.artist_name || '');
  const [originalKey, setOriginalKey] = useState(song?.original_key || 'G');
  const [tempo, setTempo] = useState(song?.tempo || 72);
  const [timeSignature, setTimeSignature] = useState(song?.time_signature || '4/4');
  const [content, setContent] = useState(song?.content || '');
  const [scriptureReference, setScriptureReference] = useState(song?.scripture_reference || '');
  const [notes, setNotes] = useState(song?.notes || '');
  const [sheetMusicUrl, setSheetMusicUrl] = useState(song?.sheet_music_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error subiendo partitura');
      }

      setSheetMusicUrl(data.fileUrl);
    } catch (err: any) {
      setError(err.message || 'Error al subir archivo');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('El título y la letra con acordes son obligatorios');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const isEditing = !!song?.id;
      const songPayload = {
        ...(isEditing ? { id: Number(song.id) } : {}),
        title: title.trim(),
        artist_name: artistName.trim() || 'Artista de Alabanza',
        original_key: originalKey,
        tempo: Number(tempo) || 72,
        time_signature: timeSignature,
        content: content.trim(),
        scripture_reference: scriptureReference.trim(),
        notes: notes.trim(),
        sheet_music_url: sheetMusicUrl.trim() || null
      };

      await saveSong(songPayload);

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error guardando la canción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertTag = (tag: string) => {
    setContent((prev: string) => prev + (prev.endsWith('\n') ? '' : '\n') + tag + '\n');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              {song?.id ? 'Editar Canción' : 'Agregar Nueva Canción'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Título de la Canción *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: La Bondad de Dios"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Artista / Grupo / Compositor</label>
              <input
                type="text"
                list="artists-list"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Ej: Bethel Music, Marcos Witt..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <datalist id="artists-list">
                {artists.map((a) => (
                  <option key={a.id} value={a.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Tono Original</label>
              <select
                value={originalKey}
                onChange={(e) => setOriginalKey(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                {CHROMATIC_SHARPS.map((k) => (
                  <option key={k} value={k}>
                    {k} ({NOTE_TO_SOLFA[k] || k})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Tempo (BPM)</label>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Compás</label>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="4/4">4/4</option>
                <option value="6/8">6/8</option>
                <option value="3/4">3/4</option>
                <option value="2/4">2/4</option>
                <option value="12/8">12/8</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Fundamento Bíblico</label>
              <input
                type="text"
                value={scriptureReference}
                onChange={(e) => setScriptureReference(e.target.value)}
                placeholder="Ej: Salmos 23:6; Lamentaciones 3:22-23"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Partitura (PDF o Imagen)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sheetMusicUrl}
                  onChange={(e) => setSheetMusicUrl(e.target.value)}
                  placeholder="URL o sube un archivo..."
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                />
                <label className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-200 transition shrink-0 font-medium">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span>{isUploading ? 'Subiendo...' : 'Subir'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              {sheetMusicUrl && (
                <span className="block mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                  ✓ Archivo adjunto: {sheetMusicUrl}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Notas de Ensayo para Músicos</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Iniciar solo guitarra acústica, puente bombo marcando a tierra..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
              <label className="block text-slate-600 dark:text-slate-400 font-semibold">
                Letra y Acordes (Formato ChordPro o tradicional) *
              </label>
              <div className="flex flex-wrap items-center gap-1">
                {['[Intro]', '[Verso 1]', '[Pre-Coro]', '[Coro]', '[Puente]', '[Outro]'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertTag(tag)}
                    className="rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-300 font-mono active:scale-95"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="[Intro]&#10;[G]  [C]  [G]  [C]&#10;&#10;[Verso 1]&#10;Te [G]amo, Dios, Tu mise[C]ricordia nunca [G]falla...&#10;&#10;[Coro]&#10;En toda mi [C]vida has sido [G]bueno..."
              rows={14}
              className="w-full font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tip: Coloca los acordes entre corchetes <code>[G]Tu fidelidad</code> o escribe las líneas de acordes directamente arriba de la letra.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-5 py-2 font-bold text-slate-950 shadow-lg shadow-amber-500/20"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Canción'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
