import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { BIBLE_BOOKS, findBookByName, parseBibleCitation } from '@/lib/bible-data';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'books';

    // 1. Listar libros de la Biblia
    if (type === 'books') {
      const testament = searchParams.get('testament');
      let books = BIBLE_BOOKS;
      if (testament) {
        books = books.filter(b => b.testament.toLowerCase().includes(testament.toLowerCase()));
      }
      return NextResponse.json({ success: true, books });
    }

    // 2. Obtener un capítulo específico
    if (type === 'chapter') {
      const bookQuery = searchParams.get('book');
      const chapterStr = searchParams.get('chapter');

      if (!bookQuery || !chapterStr) {
        return NextResponse.json({ success: false, error: 'Libro y capítulo requeridos' }, { status: 400 });
      }

      const book = findBookByName(bookQuery);
      const bookName = book ? book.name : bookQuery;
      const chapter = parseInt(chapterStr, 10);

      const verses = db.prepare(`
        SELECT * FROM bible_verses 
        WHERE book = ? AND chapter = ? 
        ORDER BY verse ASC
      `).all(bookName, chapter);

      // Obtener todas las referencias cruzadas que apuntan a o salen de este capítulo
      const crossRefs = db.prepare(`
        SELECT * FROM cross_references 
        WHERE (from_book = ? AND from_chapter = ?) 
           OR (to_book = ? AND to_chapter = ?)
      `).all(bookName, chapter, bookName, chapter);

      // Obtener canciones conectadas con este pasaje o libro
      const connectedSongs = db.prepare(`
        SELECT s.id, s.title, s.original_key, s.tempo, s.time_signature, s.scripture_reference, a.name as artist_name
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        WHERE s.scripture_reference LIKE ? OR s.scripture_reference LIKE ?
      `).all(`%${bookName} ${chapter}%`, `%${bookName}%`);

      return NextResponse.json({
        success: true,
        book: book || { name: bookName, chaptersCount: 150 },
        chapter,
        verses,
        crossRefs,
        connectedSongs
      });
    }

    // 3. Búsqueda por palabra clave o por cita (Ej: "Salmos 23:1" o "pastor")
    if (type === 'search') {
      const query = searchParams.get('q');
      if (!query || !query.trim()) {
        return NextResponse.json({ success: false, error: 'Término de búsqueda requerido' }, { status: 400 });
      }

      // Probar si es una cita bíblica directa
      const parsedCitation = parseBibleCitation(query);
      if (parsedCitation) {
        let sql = 'SELECT * FROM bible_verses WHERE book = ? AND chapter = ?';
        const params: any[] = [parsedCitation.book.name, parsedCitation.chapter];

        if (parsedCitation.verse) {
          sql += ' AND verse = ?';
          params.push(parsedCitation.verse);
        }
        sql += ' ORDER BY verse ASC LIMIT 50';

        const directVerses = db.prepare(sql).all(...params);
        if (directVerses.length > 0) {
          return NextResponse.json({
            success: true,
            isCitation: true,
            citation: parsedCitation,
            results: directVerses
          });
        }
      }

      // Búsqueda por texto libre
      const searchTerm = `%${query.trim()}%`;
      const results = db.prepare(`
        SELECT * FROM bible_verses 
        WHERE text LIKE ? 
        ORDER BY id ASC 
        LIMIT 50
      `).all(searchTerm);

      return NextResponse.json({
        success: true,
        isCitation: false,
        results
      });
    }

    // 4. Referencias cruzadas de un versículo
    if (type === 'cross_ref') {
      const book = searchParams.get('book');
      const chapter = searchParams.get('chapter');
      const verse = searchParams.get('verse');

      if (!book || !chapter || !verse) {
        return NextResponse.json({ success: false, error: 'Parámetros incompletos' }, { status: 400 });
      }

      const refs = db.prepare(`
        SELECT * FROM cross_references 
        WHERE from_book = ? AND from_chapter = ? AND from_verse = ?
      `).all(book, parseInt(chapter, 10), parseInt(verse, 10));

      // También traer el texto de los versículos referenciados si existen
      const enrichedRefs = refs.map((ref: any) => {
        const targetVerse = db.prepare(`
          SELECT text FROM bible_verses 
          WHERE book = ? AND chapter = ? AND verse = ?
        `).get(ref.to_book, ref.to_chapter, ref.to_verse) as { text: string } | undefined;

        return {
          ...ref,
          targetText: targetVerse ? targetVerse.text : undefined
        };
      });

      return NextResponse.json({ success: true, crossReferences: enrichedRefs });
    }

    return NextResponse.json({ success: false, error: 'Tipo de consulta no válido' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { fromBook, fromChapter, fromVerse, toBook, toChapter, toVerse, toVerseEnd, note } = body;

    if (!fromBook || !fromChapter || !fromVerse || !toBook || !toChapter || !toVerse) {
      return NextResponse.json({ success: false, error: 'Datos de referencia incompletos' }, { status: 400 });
    }

    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    db.prepare(`
      INSERT INTO cross_references (id, from_book, from_chapter, from_verse, to_book, to_chapter, to_verse, to_verse_end, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, fromBook, fromChapter, fromVerse, toBook, toChapter, toVerse, toVerseEnd || null, note || null);

    return NextResponse.json({ success: true, id, message: 'Referencia cruzada guardada' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
