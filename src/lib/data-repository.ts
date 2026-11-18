import {
  dbGetAllSongs,
  dbGetSongById,
  dbSaveSong,
  dbDeleteSong,
  dbGetAllArtists,
  dbGetAllSetlists,
  dbGetSetlistById,
  dbSaveSetlist,
  dbDeleteSetlist,
  dbGetBibleChapter,
  dbSearchBible,
  dbSeedDemoSongs,
  dbExportBackup,
  dbImportBackup,
  LocalSong,
  LocalArtist,
  LocalSetlist
} from './local-db';

export async function fetchSongs(): Promise<LocalSong[]> {
  if (typeof window === 'undefined') return [];
  try {
    const local = await dbGetAllSongs();
    return local;
  } catch (e) {
    console.error('Error obteniendo canciones locales:', e);
    return [];
  }
}

export async function saveSong(songData: Partial<LocalSong>): Promise<LocalSong> {
  const saved = await dbSaveSong(songData);

  // Intentar sincronizar en segundo plano con el servidor si está activo (opcional)
  if (typeof window !== 'undefined') {
    fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saved)
    }).catch(() => {
      // Si no hay servidor de red, no pasa nada; la app sigue 100% offline
    });
  }

  return saved;
}

export async function deleteSong(id: number): Promise<boolean> {
  const deleted = await dbDeleteSong(id);

  if (typeof window !== 'undefined') {
    fetch(`/api/songs/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  return deleted;
}

export async function fetchArtists(): Promise<LocalArtist[]> {
  if (typeof window === 'undefined') return [];
  try {
    return await dbGetAllArtists();
  } catch (e) {
    console.error('Error obteniendo artistas locales:', e);
    return [];
  }
}

export async function fetchSetlists(): Promise<LocalSetlist[]> {
  if (typeof window === 'undefined') return [];
  try {
    return await dbGetAllSetlists();
  } catch (e) {
    console.error('Error obteniendo setlists locales:', e);
    return [];
  }
}

export async function fetchSetlistById(id: number): Promise<LocalSetlist | null> {
  if (typeof window === 'undefined') return null;
  try {
    return await dbGetSetlistById(id);
  } catch (e) {
    console.error('Error obteniendo setlist:', e);
    return null;
  }
}

export async function saveSetlist(setlistData: Partial<LocalSetlist>): Promise<LocalSetlist> {
  const saved = await dbSaveSetlist(setlistData);

  if (typeof window !== 'undefined') {
    fetch('/api/setlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saved)
    }).catch(() => {});
  }

  return saved;
}

export async function deleteSetlist(id: number): Promise<boolean> {
  const deleted = await dbDeleteSetlist(id);

  if (typeof window !== 'undefined') {
    fetch(`/api/setlists/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  return deleted;
}

export async function seedDemoData(): Promise<void> {
  await dbSeedDemoSongs();
}

export async function exportLocalData(): Promise<string> {
  return await dbExportBackup();
}

export async function importLocalData(jsonStr: string) {
  return await dbImportBackup(jsonStr);
}
