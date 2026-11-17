import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    const song = db.prepare(`
      SELECT s.*, a.name as artist_name 
      FROM songs s 
      JOIN artists a ON s.artist_id = a.id
      WHERE s.id = ?
    `).get(id);

    if (!song) {
      return NextResponse.json({ success: false, error: 'Canción no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, song });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await req.json();

    const {
      title,
      artistId,
      originalKey,
      tempo,
      timeSignature,
      content,
      scriptureReference,
      notes,
      sheetMusicUrl
    } = body;

    db.prepare(`
      UPDATE songs 
      SET title = COALESCE(?, title),
          artist_id = COALESCE(?, artist_id),
          original_key = COALESCE(?, original_key),
          tempo = COALESCE(?, tempo),
          time_signature = COALESCE(?, time_signature),
          content = COALESCE(?, content),
          scripture_reference = COALESCE(?, scripture_reference),
          notes = COALESCE(?, notes),
          sheet_music_url = COALESCE(?, sheet_music_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      artistId,
      originalKey,
      tempo,
      timeSignature,
      content,
      scriptureReference,
      notes,
      sheetMusicUrl,
      id
    );

    return NextResponse.json({ success: true, message: 'Canción actualizada correctamente' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    db.prepare('DELETE FROM songs WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Canción eliminada' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
