import { FAMOUS_PASSAGES, INITIAL_CROSS_REFERENCES, BIBLE_BOOKS, findBookByName } from './bible-data';

export interface LocalSong {
  id: number;
  artist_id?: number;
  artist_name?: string;
  title: string;
  original_key: string;
  chosen_key?: string;
  tempo: number;
  time_signature: string;
  content: string;
  scripture_reference?: string;
  notes?: string;
  sheet_music_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalArtist {
  id: number;
  name: string;
  bio?: string;
  image_url?: string;
  song_count?: number;
  created_at: string;
}

export interface LocalSetlistItem {
  id?: number;
  song_id: number;
  title: string;
  artist_name?: string;
  chosen_key: string;
  original_key: string;
  order_index?: number;
  performance_notes?: string;
  bpm?: number;
  tempo?: number;
  time_signature?: string;
  content?: string;
}

export interface LocalSetlist {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  service_type: string;
  created_at: string;
  items: LocalSetlistItem[];
}

export interface LocalBibleVerse {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface LocalCrossRef {
  id: string;
  from_book: string;
  from_chapter: number;
  from_verse: number;
  to_book: string;
  to_chapter: number;
  to_verse: number;
  to_verse_end?: number | null;
  note?: string | null;
}

const DB_NAME = 'EkklesiaLocalDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getLocalDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB solo está disponible en el cliente'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error al abrir EkklesiaLocalDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Tienda de Canciones
      if (!db.objectStoreNames.contains('songs')) {
        const songStore = db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
        songStore.createIndex('by_title', 'title', { unique: false });
        songStore.createIndex('by_artist_name', 'artist_name', { unique: false });
      }

      // 2. Tienda de Artistas
      if (!db.objectStoreNames.contains('artists')) {
        const artistStore = db.createObjectStore('artists', { keyPath: 'id', autoIncrement: true });
        artistStore.createIndex('by_name', 'name', { unique: true });
      }

      // 3. Tienda de Setlists
      if (!db.objectStoreNames.contains('setlists')) {
        const setlistStore = db.createObjectStore('setlists', { keyPath: 'id', autoIncrement: true });
        setlistStore.createIndex('by_event_date', 'event_date', { unique: false });
      }

      // 4. Tienda de Versículos Bíblicos RVR 1960
      if (!db.objectStoreNames.contains('bible_verses')) {
        const bibleStore = db.createObjectStore('bible_verses', { keyPath: 'id', autoIncrement: true });
        bibleStore.createIndex('by_book_chapter', ['book', 'chapter'], { unique: false });
        bibleStore.createIndex('by_book_chapter_verse', ['book', 'chapter', 'verse'], { unique: true });
      }

      // 5. Tienda de Referencias Cruzadas
      if (!db.objectStoreNames.contains('cross_references')) {
        const crossStore = db.createObjectStore('cross_references', { keyPath: 'id' });
        crossStore.createIndex('by_from', ['from_book', 'from_chapter', 'from_verse'], { unique: false });
        crossStore.createIndex('by_to', ['to_book', 'to_chapter', 'to_verse'], { unique: false });
      }

      // 6. Tienda de Ajustes y Perfil
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });

  // Sembrar datos bíblicos iniciales tras primera apertura si la tabla está vacía
  dbPromise.then(async (db) => {
    try {
      const tx = db.transaction(['bible_verses', 'cross_references'], 'readonly');
      const countReq = tx.objectStore('bible_verses').count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) {
          seedBibleAndRefs(db);
        }
      };
    } catch (e) {
      console.warn('Verificación de siembra bíblica:', e);
    }
  });

  return dbPromise;
}

function seedBibleAndRefs(db: IDBDatabase) {
  try {
    const tx = db.transaction(['bible_verses', 'cross_references'], 'readwrite');
    const verseStore = tx.objectStore('bible_verses');
    const crossStore = tx.objectStore('cross_references');

    for (const v of FAMOUS_PASSAGES) {
      verseStore.put({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text
      });
    }

    for (const ref of INITIAL_CROSS_REFERENCES) {
      crossStore.put({
        id: ref.id,
        from_book: ref.from.book,
        from_chapter: ref.from.chapter,
        from_verse: ref.from.verse,
        to_book: ref.to.book,
        to_chapter: ref.to.chapter,
        to_verse: ref.to.verse,
        to_verse_end: ref.to.verseEnd ?? null,
        note: ref.note ?? null
      });
    }
  } catch (err) {
    console.error('Error sembrando datos bíblicos locales:', err);
  }
}

// ==========================================
// OPERACIONES DE CANCIONES (LOCAL SONGS)
// ==========================================

export async function dbGetAllSongs(): Promise<LocalSong[]> {
  const db = await getLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('songs', 'readonly');
    const store = tx.objectStore('songs');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetSongById(id: number): Promise<LocalSong | null> {
  const db = await getLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('songs', 'readonly');
    const store = tx.objectStore('songs');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function dbSaveSong(song: Partial<LocalSong>): Promise<LocalSong> {
  const db = await getLocalDB();
  const now = new Date().toISOString();

  // Asegurar artista si no existe
  if (song.artist_name && song.artist_name.trim()) {
    await dbEnsureArtist(song.artist_name.trim());
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction('songs', 'readwrite');
    const store = tx.objectStore('songs');

    const songRecord: any = {
      ...song,
      title: song.title || 'Canción sin título',
      artist_name: song.artist_name || 'Artista de Alabanza',
      original_key: song.original_key || 'G',
      tempo: Number(song.tempo) || 72,
      time_signature: song.time_signature || '4/4',
      content: song.content || '',
      scripture_reference: song.scripture_reference || '',
      notes: song.notes || '',
      sheet_music_url: song.sheet_music_url || null,
      updated_at: now
    };

    if (!songRecord.id) {
      songRecord.created_at = now;
      delete songRecord.id;
      const addReq = store.add(songRecord);
      addReq.onsuccess = () => {
        songRecord.id = addReq.result as number;
        resolve(songRecord as LocalSong);
      };
      addReq.onerror = () => reject(addReq.error);
    } else {
      const putReq = store.put(songRecord);
      putReq.onsuccess = () => resolve(songRecord as LocalSong);
      putReq.onerror = () => reject(putReq.error);
    }
  });
}

export async function dbDeleteSong(id: number): Promise<boolean> {
  const db = await getLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('songs', 'readwrite');
    const store = tx.objectStore('songs');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ==========================================
// OPERACIONES DE ARTISTAS (LOCAL ARTISTS)
// ==========================================

export async function dbGetAllArtists(): Promise<LocalArtist[]> {
  const db = await getLocalDB();
  const [artists, songs] = await Promise.all([
    new Promise<LocalArtist[]>((resolve, reject) => {
      const tx = db.transaction('artists', 'readonly');
      const req = tx.objectStore('artists').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    }),
    dbGetAllSongs()
  ]);

  // Contar canciones por artista
  const countMap: Record<string, number> = {};
  for (const s of songs) {
    const name = s.artist_name || 'Desconocido';
    countMap[name] = (countMap[name] || 0) + 1;
  }

  return artists.map(a => ({
    ...a,
    song_count: countMap[a.name] || 0
  }));
}

export async function dbEnsureArtist(name: string): Promise<LocalArtist> {
  const db = await getLocalDB();
  const cleanName = name.trim();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('artists', 'readwrite');
    const store = tx.objectStore('artists');
    const index = store.index('by_name');
    const findReq = index.get(cleanName);

    findReq.onsuccess = () => {
      if (findReq.result) {
        resolve(findReq.result);
      } else {
        const newArtist: any = {
          name: cleanName,
          bio: 'Ministerio de alabanza y adoración.',
          created_at: new Date().toISOString()
        };
        const addReq = store.add(newArtist);
        addReq.onsuccess = () => {
          newArtist.id = addReq.result as number;
          resolve(newArtist);
        };
        addReq.onerror = () => reject(addReq.error);
      }
    };
    findReq.onerror = () => reject(findReq.error);
  });
}

// ==========================================
// OPERACIONES DE SETLISTS (LOCAL SETLISTS)
// ==========================================

export async function dbGetAllSetlists(): Promise<LocalSetlist[]> {
  const db = await getLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('setlists', 'readonly');
    const store = tx.objectStore('setlists');
    const req = store.getAll();
    req.onsuccess = () => {
      const list = (req.result || []) as LocalSetlist[];
      list.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetSetlistById(id: number): Promise<LocalSetlist | null> {
  const db = await getLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('setlists', 'readonly');
    const store = tx.objectStore('setlists');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function dbSaveSetlist(setlist: Partial<LocalSetlist>): Promise<LocalSetlist> {
  const db = await getLocalDB();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('setlists', 'readwrite');
    const store = tx.objectStore('setlists');

    const record: any = {
      ...setlist,
      title: setlist.title || 'Repertorio sin título',
      description: setlist.description || '',
      event_date: setlist.event_date || now.split('T')[0],
      service_type: setlist.service_type || 'Culto General',
      items: setlist.items || []
    };

    if (!record.id) {
      record.created_at = now;
      delete record.id;
      const addReq = store.add(record);
      addReq.onsuccess = () => {
        record.id = addReq.result as number;
        resolve(record as LocalSetlist);
      };
      addReq.onerror = () => reject(addReq.error);
    } else {
      const putReq = store.put(record);
      putReq.onsuccess = () => resolve(record as LocalSetlist);
      putReq.onerror = () => reject(putReq.error);
    }
  });
}

export async function dbDeleteSetlist(id: number): Promise<boolean> {
  const db = await getLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('setlists', 'readwrite');
    const store = tx.objectStore('setlists');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ==========================================
// CONSULTAS BÍBLICAS LOCALES (LOCAL BIBLE)
// ==========================================

export async function dbGetBibleChapter(bookName: string, chapter: number): Promise<{
  verses: LocalBibleVerse[];
  crossRefs: LocalCrossRef[];
}> {
  const db = await getLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['bible_verses', 'cross_references'], 'readonly');
    const verseStore = tx.objectStore('bible_verses');
    const crossStore = tx.objectStore('cross_references');

    const verses: LocalBibleVerse[] = [];
    const crossRefs: LocalCrossRef[] = [];

    const verseReq = verseStore.openCursor();
    verseReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor) {
        const v = cursor.value;
        if (v.book === bookName && Number(v.chapter) === Number(chapter)) {
          verses.push(v);
        }
        cursor.continue();
      } else {
        verses.sort((a, b) => a.verse - b.verse);

        const crossReq = crossStore.openCursor();
        crossReq.onsuccess = (e2) => {
          const c2 = (e2.target as IDBRequest).result;
          if (c2) {
            const ref = c2.value;
            if (
              (ref.from_book === bookName && Number(ref.from_chapter) === Number(chapter)) ||
              (ref.to_book === bookName && Number(ref.to_chapter) === Number(chapter))
            ) {
              crossRefs.push(ref);
            }
            c2.continue();
          } else {
            resolve({ verses, crossRefs });
          }
        };
        crossReq.onerror = () => reject(crossReq.error);
      }
    };
    verseReq.onerror = () => reject(verseReq.error);
  });
}

export async function dbSearchBible(query: string): Promise<LocalBibleVerse[]> {
  const db = await getLocalDB();
  const cleanQ = query.trim().toLowerCase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('bible_verses', 'readonly');
    const store = tx.objectStore('bible_verses');
    const results: LocalBibleVerse[] = [];

    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result;
      if (cursor && results.length < 50) {
        const v = cursor.value as LocalBibleVerse;
        if (v.text.toLowerCase().includes(cleanQ)) {
          results.push(v);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

// ==========================================
// SIEMBRA DE DEMO LOCAL & RESPALDO
// ==========================================

export async function dbSeedDemoSongs(): Promise<void> {
  const songs = await dbGetAllSongs();
  if (songs.length > 0) return;

  await dbSaveSong({
    title: 'La Bondad de Dios (Goodness of God)',
    artist_name: 'Bethel Music',
    original_key: 'G',
    tempo: 70,
    time_signature: '4/4',
    content: `[Intro]
[G]  [C]  [G]  [C]

[Verso 1]
Te [G]amo, Dios, Tu mise[C]ricordia nunca [G]falla
Cada [D/F#]día [Em]estoy en Tus [C]manos   [D]
Desde que me [C]despierto hasta el [G]reco[D/F#]star[Em]me
Oh, yo [C]cantaré de la [D]bondad de [G]Dios

[Coro]
En toda mi [C]vida has sido [G]bueno
En toda mi [C]vida has sido tan, tan [G]fiel   [D]
Con cada a[C]liento que tengo en [G]mí   [D/F#]    [Em]
Oh, yo [C]cantaré de la [D]bondad de [G]Dios

[Puente]
Tu fide[C]lidad sigue perseguién[D]dome
Tu fide[G]lidad sigue perseguién[Em]dome
Todo lo que [C]soy rindo a Tus [D]pies
Te entrego todo a [G]Ti   [D/F#]    [Em]
Tu fide[C]lidad sigue perseguién[D]dome   [G]`,
    scripture_reference: 'Salmos 23:6; Salmos 145:7; Lamentaciones 3:22-23',
    notes: 'Iniciar suave con guitarra acústica o piano pad. Subir dinámica en el puente.'
  });

  await dbSaveSong({
    title: 'Cuán Grande es Dios',
    artist_name: 'Chris Tomlin',
    original_key: 'G',
    tempo: 76,
    time_signature: '4/4',
    content: `[Intro]
[G]  [Em7]  [C2]  [D]

[Verso 1]
El [G]esplendor de un Rey, vestido en majes[Em7]tad
La tierra alegre es[C2]tá, la tierra alegre está
Se [G]cubre de Su luz, tinieblas huirán [Em7]
A Su potente [C2]voz, a Su potente voz

[Coro]
Cuán [G]grande es Dios, cántale
Cuán [Em7]grande es Dios, todos lo verán
Cuán [C2]grande, cuán [D]grande es [G]Dios

[Puente]
Tu [G]Nombre sobre todo es
Eres [Em7]digno de alabar
Y mi [C2]ser dirá: Cuán [D]grande es [G]Dios`,
    scripture_reference: 'Salmos 104:1-2; Salmos 145:3; Apocalipsis 4:8',
    notes: 'Clásico congregacional. Excelente para transición a adoración profunda.'
  });

  await dbSaveSong({
    title: 'Tu Fidelidad',
    artist_name: 'Marcos Witt',
    original_key: 'D',
    tempo: 68,
    time_signature: '4/4',
    content: `[Intro]
[D]  [Bm]  [G]  [A]

[Coro]
Tu fideli[D]dad es grande [Bm]
Tu fideli[Em]dad incomparable [A] es
Nadie como [G]Tú, bendito [D/F#]Dios
Grande es [Em]Tu fideli[A]dad   [D]

[Verso]
Cada ma[D]ñana se renuevan [Bm]Tus piedades
Inago[Em]table es Tu amor y Tu [A]bondad
Permaneces [G]fiel a través del [D/F#]tiempo
Grande es [Em]Tu fideli[A]dad   [D]`,
    scripture_reference: 'Lamentaciones 3:22-23; Salmos 89:1',
    notes: 'Himno solemne. Perfecto para comunión o ministración suave con piano.'
  });

  await dbSaveSong({
    title: 'Alaba (Praise)',
    artist_name: 'Elevation Worship',
    original_key: 'G',
    tempo: 127,
    time_signature: '4/4',
    content: `[Intro]
[G]  [C]  [G]  [D]

[Verso 1]
Que [G]todo lo que respire alabe al Señor
Que [C]todo en mi interior alabe al Se[G]ñor
Le a[Em]labo en la mañana, le alabo al ata[C]rdecer
Porque Él es [G]digno, digno de [D]todo mi [G]ser

[Coro]
A[G]laba al Señor, alma mía
A[C]laba al Señor con alegría
Por Su [Em]fuerza y Su gran poder
Por lo que [C]Él ha hecho y [D]ha de ha[G]cer`,
    scripture_reference: 'Salmos 150:6; Salmos 103:1-2',
    notes: 'Tema festivo y rápido. Enfatizar el ritmo de batería y bajo.'
  });
}

export async function dbExportBackup(): Promise<string> {
  const [songs, artists, setlists] = await Promise.all([
    dbGetAllSongs(),
    dbGetAllArtists(),
    dbGetAllSetlists()
  ]);

  return JSON.stringify(
    {
      version: 1,
      appName: 'EKKLESIA Mobile',
      exportDate: new Date().toISOString(),
      songs,
      artists,
      setlists
    },
    null,
    2
  );
}

export async function dbImportBackup(jsonString: string): Promise<{ success: boolean; songsAdded: number; setlistsAdded: number }> {
  const parsed = JSON.parse(jsonString);
  let songsAdded = 0;
  let setlistsAdded = 0;

  if (Array.isArray(parsed.songs)) {
    for (const s of parsed.songs) {
      delete s.id;
      await dbSaveSong(s);
      songsAdded++;
    }
  }

  if (Array.isArray(parsed.setlists)) {
    for (const sl of parsed.setlists) {
      delete sl.id;
      await dbSaveSetlist(sl);
      setlistsAdded++;
    }
  }

  return { success: true, songsAdded, setlistsAdded };
}
