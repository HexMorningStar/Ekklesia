import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { FAMOUS_PASSAGES, INITIAL_CROSS_REFERENCES } from './bible-data';

const DB_PATH = path.join(process.cwd(), 'church-music.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);
  seedInitialData(db);

  dbInstance = db;
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      bio TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      original_key TEXT NOT NULL,
      tempo INTEGER DEFAULT 72,
      time_signature TEXT DEFAULT '4/4',
      content TEXT NOT NULL,
      scripture_reference TEXT,
      notes TEXT,
      sheet_music_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS setlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      service_type TEXT DEFAULT 'Culto General',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS setlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setlist_id INTEGER NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
      song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
      order_index INTEGER NOT NULL,
      chosen_key TEXT NOT NULL,
      performance_notes TEXT,
      bpm INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bible_verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      UNIQUE(book, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS cross_references (
      id TEXT PRIMARY KEY,
      from_book TEXT NOT NULL,
      from_chapter INTEGER NOT NULL,
      from_verse INTEGER NOT NULL,
      to_book TEXT NOT NULL,
      to_chapter INTEGER NOT NULL,
      to_verse INTEGER NOT NULL,
      to_verse_end INTEGER,
      note TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_bible_lookup ON bible_verses(book, chapter, verse);
    CREATE INDEX IF NOT EXISTS idx_cross_ref_from ON cross_references(from_book, from_chapter, from_verse);
    CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist_id);
    CREATE INDEX IF NOT EXISTS idx_setlist_items ON setlist_items(setlist_id, order_index);
  `);
}

function seedInitialData(db: Database.Database) {
  // 1. Sembrar referencias cruzadas
  const insertCross = db.prepare(`
    INSERT OR IGNORE INTO cross_references (id, from_book, from_chapter, from_verse, to_book, to_chapter, to_verse, to_verse_end, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertManyRefs = db.transaction((refs: typeof INITIAL_CROSS_REFERENCES) => {
    for (const ref of refs) {
      insertCross.run(
        ref.id,
        ref.from.book,
        ref.from.chapter,
        ref.from.verse,
        ref.to.book,
        ref.to.chapter,
        ref.to.verse,
        ref.to.verseEnd ?? null,
        ref.note ?? null
      );
    }
  });

  insertManyRefs(INITIAL_CROSS_REFERENCES);

  // 2. Sembrar versículos emblemáticos
  const insertVerse = db.prepare(`
    INSERT OR IGNORE INTO bible_verses (book, chapter, verse, text)
    VALUES (?, ?, ?, ?)
  `);

  const insertManyVerses = db.transaction((verses: typeof FAMOUS_PASSAGES) => {
    for (const v of verses) {
      insertVerse.run(v.book, v.chapter, v.verse, v.text);
    }
  });

  insertManyVerses(FAMOUS_PASSAGES);

  // 3. Sembrar artistas y canciones de demostración (sólo si SEED_DEMO_DATA está activo)
  if (process.env.SEED_DEMO_DATA === 'true') {
    seedDemoData(db);
  }
}

export function seedDemoData(db: Database.Database) {
  const checkArtists = db.prepare('SELECT COUNT(*) as count FROM artists').get() as { count: number };
  if (checkArtists.count === 0) {
    const insertArtist = db.prepare('INSERT INTO artists (name, bio) VALUES (?, ?)');
    const insertSong = db.prepare(`
      INSERT INTO songs (artist_id, title, original_key, tempo, time_signature, content, scripture_reference, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedTx = db.transaction(() => {
      // Artista 1: Bethel Music / Jenn Johnson
      const a1 = insertArtist.run('Bethel Music', 'Ministerio internacional de alabanza y adoración contemporánea.');
      insertSong.run(
        a1.lastInsertRowid,
        'La Bondad de Dios (Goodness of God)',
        'G',
        70,
        '4/4',
`[Intro]
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

[Verso 2]
Tu [G]voz me guió a través del [C]fuego y la [G]tormenta
En la oscuri[D/F#]dad, [Em]Tu cercanía me dio [C]paz   [D]
Te conozco [C]como Padre, [G]como mi a[D/F#]migo y [Em]Rey
He vi[C]vido en la [D]bondad de [G]Dios

[Puente]
Tu fide[C]lidad sigue perseguién[D]dome
Tu fide[G]lidad sigue perseguién[Em]dome
Todo lo que [C]soy rindo a Tus [D]pies
Te entrego todo a [G]Ti   [D/F#]    [Em]
Tu fide[C]lidad sigue perseguién[D]dome   [G]`,
        'Salmos 23:6; Salmos 145:7; Lamentaciones 3:22-23',
        'Iniciar suave con guitarra acústica o piano pad. Subir dinámica en el puente con la batería marcando el bombo.'
      );

      // Artista 2: Chris Tomlin / En Espíritu y En Verdad
      const a2 = insertArtist.run('Chris Tomlin', 'Compositor y líder de alabanza.');
      insertSong.run(
        a2.lastInsertRowid,
        'Cuán Grande es Dios',
        'G',
        76,
        '4/4',
`[Intro]
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

[Verso 2]
Día a [G]día Él está, y el tiempo está en Su [Em7]mano
Principio y el [C2]fin, principio y el fin
La [G]Trinidad en Dios, el Padre, Hijo y [Em7]Espíritu
Cordero y el [C2]León, Cordero y el León

[Puente]
Tu [G]Nombre sobre todo es
Eres [Em7]digno de alabar
Y mi [C2]ser dirá: Cuán [D]grande es [G]Dios`,
        'Salmos 104:1-2; Salmos 145:3; Apocalipsis 4:8',
        'Clásico congregacional. Excelente para transición a adoración profunda.'
      );

      // Artista 3: Marcos Witt
      const a3 = insertArtist.run('Marcos Witt', 'Pionero de la alabanza y adoración en el mundo hispano.');
      insertSong.run(
        a3.lastInsertRowid,
        'Tu Fidelidad',
        'D',
        68,
        '4/4',
`[Intro]
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
        'Lamentaciones 3:22-23; Salmos 89:1',
        'Himno solemne. Perfecto para momentos de comunión o ministración suave con piano.'
      );

      // Artista 4: Elevation Worship
      const a4 = insertArtist.run('Elevation Worship', 'Ministerio de adoración de Elevation Church.');
      insertSong.run(
        a4.lastInsertRowid,
        'Alaba (Praise)',
        'G',
        127,
        '4/4',
`[Intro]
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
Por lo que [C]Él ha hecho y [D]ha de ha[G]cer

[Puente]
No me calla[Em]ré, yo le cantaré
En la tempes[C]tad, le celebraré
Pues las cade[G]nas Él ya rompió
Mi libertad [D]Él proclamó`,
        'Salmos 150:6; Salmos 103:1-2',
        'Tema de alabanza rápida y festiva. Enfatizar el ritmo de bajo y batería.'
      );

      // 4. Sembrar un setlist de ensayo inicial
      const s1 = db.prepare(`
        INSERT INTO setlists (title, description, event_date, service_type)
        VALUES (?, ?, ?, ?)
      `).run(
        'Culto Dominical de Alabanza',
        'Servicio principal de domingo con el equipo de alabanza completo.',
        new Date().toISOString().split('T')[0],
        'Culto General'
      );

      const insertSetlistItem = db.prepare(`
        INSERT INTO setlist_items (setlist_id, song_id, order_index, chosen_key, performance_notes, bpm)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertSetlistItem.run(s1.lastInsertRowid, 4, 1, 'G', 'Apertura con júbilo. Entrada con batería fuerte y palmas.', 127);
      insertSetlistItem.run(s1.lastInsertRowid, 2, 2, 'G', 'Transición a adoración congregacional media.', 76);
      insertSetlistItem.run(s1.lastInsertRowid, 1, 3, 'G', 'Momento de adoración profunda. Repetir coro suave.', 70);
      insertSetlistItem.run(s1.lastInsertRowid, 3, 4, 'D', 'Cierre de alabanza y oración pastoral.', 68);
    });

    seedTx();
  }
}
