import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    const setlist = db.prepare('SELECT * FROM setlists WHERE id = ?').get(id);
    if (!setlist) {
      return NextResponse.json({ success: false, error: 'Setlist no encontrado' }, { status: 404 });
    }

    const items = db.prepare(`
      SELECT 
        i.id as item_id,
        i.order_index,
        i.chosen_key,
        i.performance_notes,
        i.bpm as item_bpm,
        s.id as song_id,
        s.title,
        s.original_key,
        s.tempo as original_tempo,
        s.time_signature,
        s.content,
        s.scripture_reference,
        s.sheet_music_url,
        a.name as artist_name
      FROM setlist_items i
      JOIN songs s ON i.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE i.setlist_id = ?
      ORDER BY i.order_index ASC
    `).all(id);

    return NextResponse.json({
      success: true,
      setlist,
      items
    });
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
      description,
      eventDate,
      serviceType,
      items // Array de { songId, chosenKey, performanceNotes, bpm, orderIndex }
    } = body;

    const updateTx = db.transaction(() => {
      if (title) {
        db.prepare(`
          UPDATE setlists 
          SET title = ?, description = ?, event_date = ?, service_type = ?
          WHERE id = ?
        `).run(title, description ?? '', eventDate, serviceType ?? 'Culto General', id);
      }

      if (Array.isArray(items)) {
        // Reemplazar items con el nuevo orden y tonalidades seleccionadas
        db.prepare('DELETE FROM setlist_items WHERE setlist_id = ?').run(id);

        const insertItem = db.prepare(`
          INSERT INTO setlist_items (setlist_id, song_id, order_index, chosen_key, performance_notes, bpm)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        items.forEach((item: any, idx: number) => {
          insertItem.run(
            id,
            item.songId || item.song_id,
            idx + 1,
            item.chosenKey || item.chosen_key || 'G',
            item.performanceNotes || item.performance_notes || '',
            item.bpm || item.item_bpm || 72
          );
        });
      }
    });

    updateTx();

    return NextResponse.json({ success: true, message: 'Setlist actualizado' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    db.prepare('DELETE FROM setlists WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Setlist eliminado' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
