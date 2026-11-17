import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get('artistId');
    const search = searchParams.get('search');

    let query = `
      SELECT s.*, a.name as artist_name 
      FROM songs s 
      JOIN artists a ON s.artist_id = a.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (artistId) {
      conditions.push('s.artist_id = ?');
      params.push(artistId);
    }

    if (search) {
      conditions.push('(s.title LIKE ? OR s.content LIKE ? OR a.name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.name ASC, s.title ASC';

    const songs = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, songs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const {
      title,
      artistName,
      artistId,
      originalKey = 'G',
      tempo = 72,
      timeSignature = '4/4',
      content,
      scriptureReference = '',
      notes = '',
      sheetMusicUrl = null
    } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Título y contenido de la canción son obligatorios' }, { status: 400 });
    }

    let finalArtistId = artistId;
    if (!finalArtistId && artistName) {
      // Buscar o insertar artista
      const existingArtist = db.prepare('SELECT id FROM artists WHERE LOWER(name) = LOWER(?)').get(artistName.trim()) as { id: number } | undefined;
      if (existingArtist) {
        finalArtistId = existingArtist.id;
      } else {
        const newArtist = db.prepare('INSERT INTO artists (name) VALUES (?)').run(artistName.trim());
        finalArtistId = newArtist.lastInsertRowid;
      }
    }

    if (!finalArtistId) {
      finalArtistId = 1; // Default
    }

    const insertSong = db.prepare(`
      INSERT INTO songs (artist_id, title, original_key, tempo, time_signature, content, scripture_reference, notes, sheet_music_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertSong.run(
      finalArtistId,
      title.trim(),
      originalKey.trim(),
      tempo,
      timeSignature.trim(),
      content.trim(),
      scriptureReference.trim(),
      notes.trim(),
      sheetMusicUrl
    );

    return NextResponse.json({
      success: true,
      songId: result.lastInsertRowid,
      message: 'Canción guardada con éxito'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
